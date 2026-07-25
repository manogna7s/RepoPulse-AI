/**
 * TEMPORARY DEBUG CONTROLLER
 * ---------------------------
 * Verifies that GITHUB_TOKEN loads from .env and that GitHub accepts it.
 *
 * REMOVE BEFORE PRODUCTION:
 *   1. Delete this file
 *   2. Delete routes/debugRoutes.js
 *   3. Remove the /api/debug mount from app.js
 *
 * Leaving it in production would expose rate-limit and account metadata.
 */

import { getGitHubDebugStatus } from '../services/githubService.js'
import { successResponse } from '../utils/response.js'

export async function getGitHubDebug(_request, response, next) {
  try {
    const status = await getGitHubDebugStatus()
    return successResponse(response, {
      message: 'GitHub integration debug status',
      data: status,
    })
  } catch (error) {
    return next(error)
  }
}
