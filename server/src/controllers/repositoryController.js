/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Controllers are the HTTP "traffic cops":
 *   1) read the request body
 *   2) call services / utilities
 *   3) send a consistent response
 *
 * They do NOT call the GitHub API directly — that stays in githubService.
 */

import { fetchRepositoryBundle } from '../services/githubService.js'
import { parseGitHubUrl } from '../utils/githubParser.js'
import { successResponse } from '../utils/response.js'

/**
 * POST /api/repository/analyze
 * Body: { "url": "https://github.com/facebook/react" }
 *
 * Flow: validate URL → extract owner/repo → fetch GitHub data → respond.
 */
export async function analyzeRepository(request, response, next) {
  try {
    const { url } = request.body ?? {}

    // parseGitHubUrl throws a 400 AppError for bad input.
    const { owner, repo } = parseGitHubUrl(url)

    // Service layer talks to GitHub; controller only orchestrates.
    const data = await fetchRepositoryBundle(owner, repo)

    return successResponse(response, {
      statusCode: 200,
      message: `Repository data fetched for ${owner}/${repo}`,
      data,
    })
  } catch (error) {
    // Forward to the global error middleware for a consistent failure shape.
    return next(error)
  }
}
