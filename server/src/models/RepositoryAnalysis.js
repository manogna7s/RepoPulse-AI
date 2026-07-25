/**
 * WHY THIS FILE EXISTS
 * --------------------
 * A Mongoose SCHEMA describes the shape of documents in a collection.
 * A MODEL is the constructor we use to create / query those documents.
 *
 * RepositoryAnalysis stores one completed RepoPulse run so the History page
 * can reload it without calling GitHub again.
 */

import mongoose from 'mongoose'

const repositoryAnalysisSchema = new mongoose.Schema(
  {
    // Canonical URL the user pasted (normalized by the controller before save).
    repositoryUrl: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    owner: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    repositoryName: {
      type: String,
      required: true,
      trim: true,
    },
    // Explicit analysis timestamp (also mirrored by createdAt via timestamps).
    analysisDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    // Nested payloads stay flexible (Mixed) because GitHub shapes evolve and
    // our score objects contain variable breakdown keys.
    repository: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    scores: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    engineeringHealth: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    technicalDebt: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    technicalDebtMeta: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    // Gemini narrative that explains heuristic scores (never recalculates them).
    aiInsights: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    // Automatically adds createdAt + updatedAt.
    timestamps: true,
  },
)

// Speeds up the "same repo analyzed in the last hour?" duplicate check.
repositoryAnalysisSchema.index({ owner: 1, repositoryName: 1, analysisDate: -1 })

const RepositoryAnalysis = mongoose.model('RepositoryAnalysis', repositoryAnalysisSchema)

export default RepositoryAnalysis
