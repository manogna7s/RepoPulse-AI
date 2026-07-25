/**
 * History controllers: thin HTTP wrappers around analysisService.
 */

import {
  deleteAnalysisById,
  getAnalysisById,
  listAnalyses,
} from '../services/analysisService.js'
import { successResponse } from '../utils/response.js'

export async function getHistory(_request, response, next) {
  try {
    const items = await listAnalyses()
    return successResponse(response, {
      message: 'Analysis history loaded',
      data: items,
    })
  } catch (error) {
    return next(error)
  }
}

export async function getHistoryById(request, response, next) {
  try {
    const analysis = await getAnalysisById(request.params.id)
    return successResponse(response, {
      message: 'Analysis loaded',
      data: {
        id: analysis._id,
        repositoryUrl: analysis.repositoryUrl,
        owner: analysis.owner,
        repositoryName: analysis.repositoryName,
        analysisDate: analysis.analysisDate,
        repository: analysis.repository,
        scores: analysis.scores,
        engineeringHealth: analysis.engineeringHealth,
        technicalDebt: analysis.technicalDebt,
        technicalDebtMeta: analysis.technicalDebtMeta,
      },
    })
  } catch (error) {
    return next(error)
  }
}

export async function deleteHistoryById(request, response, next) {
  try {
    await deleteAnalysisById(request.params.id)
    return successResponse(response, {
      message: 'Analysis deleted',
      data: { id: request.params.id },
    })
  } catch (error) {
    return next(error)
  }
}
