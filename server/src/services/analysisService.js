/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Persistence rules live here — not in controllers.
 * Controllers hand us an analysis payload; we decide whether to save it,
 * how to list history, and how to delete.
 */

import { isDatabaseConnected } from '../config/database.js'
import RepositoryAnalysis from '../models/RepositoryAnalysis.js'
import { createAppError } from '../utils/githubParser.js'

const DUPLICATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function assertDatabase() {
  if (!isDatabaseConnected()) {
    throw createAppError(
      'MongoDB is not connected. Set MONGODB_URI in server/.env and restart the API.',
      503,
      'DATABASE_UNAVAILABLE',
    )
  }
}

/**
 * Save an analysis unless the same owner/repo was saved within the last hour.
 *
 * WHY SKIP DUPLICATES?
 * Re-clicking "Analyze" during debugging would flood the History page with
 * near-identical rows. One save per hour per repo keeps history useful.
 */
export async function saveAnalysisIfNew(payload) {
  if (!isDatabaseConnected()) {
    console.warn('Database: skip save — MongoDB is not connected')
    return { saved: false, reason: 'database_unavailable', analysis: null }
  }

  const { owner, repositoryName, repositoryUrl } = payload
  const cutoff = new Date(Date.now() - DUPLICATE_WINDOW_MS)

  const recent = await RepositoryAnalysis.findOne({
    owner,
    repositoryName,
    analysisDate: { $gte: cutoff },
  })
    .sort({ analysisDate: -1 })
    .lean()

  if (recent) {
    return {
      saved: false,
      reason: 'duplicate_within_hour',
      analysis: recent,
    }
  }

  const created = await RepositoryAnalysis.create({
    repositoryUrl,
    owner,
    repositoryName,
    analysisDate: new Date(),
    repository: payload.repository,
    scores: payload.scores,
    engineeringHealth: payload.engineeringHealth,
    technicalDebt: payload.technicalDebt || [],
    technicalDebtMeta: payload.technicalDebtMeta || null,
    aiInsights: payload.aiInsights || null,
  })

  return {
    saved: true,
    reason: 'created',
    analysis: created.toObject(),
  }
}

/**
 * Newest analyses first — supports optional search / owner / sort for History.
 */
export async function listAnalyses({
  limit = 50,
  search = '',
  owner = '',
  sort = 'newest',
} = {}) {
  assertDatabase()

  const filter = {}

  if (owner && owner.trim()) {
    filter.owner = new RegExp(`^${escapeRegex(owner.trim())}$`, 'i')
  }

  if (search && search.trim()) {
    const term = escapeRegex(search.trim())
    filter.$or = [
      { repositoryName: new RegExp(term, 'i') },
      { owner: new RegExp(term, 'i') },
      { repositoryUrl: new RegExp(term, 'i') },
    ]
  }

  let sortSpec = { analysisDate: -1 }
  if (sort === 'oldest') sortSpec = { analysisDate: 1 }
  if (sort === 'highest') sortSpec = { 'engineeringHealth.overallScore': -1, analysisDate: -1 }
  if (sort === 'lowest') sortSpec = { 'engineeringHealth.overallScore': 1, analysisDate: -1 }

  return RepositoryAnalysis.find(filter)
    .sort(sortSpec)
    .limit(Math.min(Number(limit) || 50, 100))
    .select(
      'repositoryUrl owner repositoryName analysisDate engineeringHealth scores repository.name repository.fullName repository.owner aiInsights createdAt',
    )
    .lean()
}

/** Full document for replaying an analysis on the dashboard / compare page. */
export async function getAnalysisById(id) {
  assertDatabase()

  const analysis = await RepositoryAnalysis.findById(id).lean()
  if (!analysis) {
    throw createAppError('Analysis not found.', 404, 'ANALYSIS_NOT_FOUND')
  }
  return analysis
}

export async function deleteAnalysisById(id) {
  assertDatabase()

  const deleted = await RepositoryAnalysis.findByIdAndDelete(id).lean()
  if (!deleted) {
    throw createAppError('Analysis not found.', 404, 'ANALYSIS_NOT_FOUND')
  }
  return deleted
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
