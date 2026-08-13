/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Controllers are the HTTP "traffic cops":
 *   1) read the request body
 *   2) call services / utilities
 *   3) send a consistent response
 */

import { generateRepositoryInsights } from '../services/aiService.js'
import { saveAnalysisIfNew } from '../services/analysisService.js'
import { getDecryptedAccessToken } from '../services/authService.js'
import { fetchRepositoryBundle } from '../services/githubService.js'
import { calculateRepositoryScores } from '../services/scoringService.js'
import { analyzeTechnicalDebt } from '../services/technicalDebtService.js'
import { parseGitHubUrl } from '../utils/githubParser.js'
import { successResponse } from '../utils/response.js'

/**
 * POST /api/repository/analyze
 *
 * Flow:
 *   validate URL
 *   → GitHub bundle
 *   → heuristic scores
 *   → technical debt
 *   → Gemini insights (non-fatal)
 *   → persist
 *   → respond
 */
export async function analyzeRepository(request, response, next) {
  try {
    const { url } = request.body ?? {}

    const { owner, repo } = parseGitHubUrl(url)
    const repositoryUrl = `https://github.com/${owner}/${repo}`
    const accessToken = request.user?._id
      ? await getDecryptedAccessToken(request.user._id)
      : undefined

    const bundle = await fetchRepositoryBundle(owner, repo, { accessToken })
    const { scores, engineeringHealth } = calculateRepositoryScores(bundle)
    const debtResult = await analyzeTechnicalDebt(owner, repo, {
      defaultBranch: bundle.repository.defaultBranch,
      accessToken,
    })

    const repository = {
      ...bundle.repository,
      contributors: bundle.contributors,
      languages: bundle.languages,
      releases: bundle.releases,
      commits: bundle.commits,
      dependencyFiles: (bundle.rootContents || [])
        .filter((item) => item.type === 'file')
        .map((item) => item.name),
      readme: bundle.readme
        ? {
            exists: true,
            name: bundle.readme.name,
            path: bundle.readme.path,
            size: bundle.readme.size,
          }
        : { exists: false },
    }

    // Gemini explains metrics. Failures must NOT break the whole analysis.
    const aiInsights = await generateRepositoryInsights({
      repository,
      scores,
      engineeringHealth,
      technicalDebt: debtResult.technicalDebt,
    })

    const analysisPayload = {
      repository,
      scores,
      engineeringHealth,
      technicalDebt: debtResult.technicalDebt,
      technicalDebtMeta: debtResult.meta,
      aiInsights,
    }

    const persistence = await saveAnalysisIfNew({
      repositoryUrl,
      owner,
      repositoryName: repo,
      userId: request.user?._id || null,
      isPrivate: Boolean(bundle.repository?.isPrivate),
      ...analysisPayload,
    })

    return successResponse(response, {
      statusCode: 200,
      message: `Engineering analysis complete for ${owner}/${repo}`,
      data: {
        ...analysisPayload,
        persistence: {
          saved: persistence.saved,
          reason: persistence.reason,
          analysisId: persistence.analysis?._id || null,
          analysisDate: persistence.analysis?.analysisDate || null,
        },
      },
    })
  } catch (error) {
    return next(error)
  }
}
