/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Controllers are the HTTP "traffic cops":
 *   1) read the request body
 *   2) call services / utilities
 *   3) send a consistent response
 *
 * They do NOT call the GitHub API directly — that stays in githubService.
 * They do NOT calculate scores — that stays in scoringService.
 */

import { fetchRepositoryBundle } from '../services/githubService.js'
import { calculateRepositoryScores } from '../services/scoringService.js'
import { parseGitHubUrl } from '../utils/githubParser.js'
import { successResponse } from '../utils/response.js'

/**
 * POST /api/repository/analyze
 * Body: { "url": "https://github.com/facebook/react" }
 *
 * Flow:
 *   validate URL → fetch GitHub bundle → run heuristic scores → respond
 *
 * Deliberately does NOT call Gemini / AI in this phase.
 */
export async function analyzeRepository(request, response, next) {
  try {
    const { url } = request.body ?? {}

    // parseGitHubUrl throws a 400 AppError for bad input.
    const { owner, repo } = parseGitHubUrl(url)

    // 1) Fetch raw signals from GitHub (network I/O only).
    const bundle = await fetchRepositoryBundle(owner, repo)

    // 2) Run deterministic Engineering Intelligence scoring (no AI).
    const { scores, engineeringHealth } = calculateRepositoryScores(bundle)

    // 3) Shape the public API payload. Full README text is omitted on purpose
    //    (it can be huge); scoring already consumed it internally.
    const repository = {
      ...bundle.repository,
      contributors: bundle.contributors,
      languages: bundle.languages,
      releases: bundle.releases,
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

    return successResponse(response, {
      statusCode: 200,
      message: `Engineering analysis complete for ${owner}/${repo}`,
      // Nested under data to keep the global success envelope consistent,
      // while matching the product fields from the Engineering Intelligence phase.
      data: {
        repository,
        scores,
        engineeringHealth,
      },
    })
  } catch (error) {
    // Forward to the global error middleware for a consistent failure shape.
    return next(error)
  }
}
