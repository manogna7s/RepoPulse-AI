/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Controllers are the "HTTP layer".
 * They read the request, call helpers/services, and send a response.
 * They should NOT contain heavy business logic.
 *
 * Health is a tiny endpoint used by developers and hosting platforms
 * (like Render) to confirm the API process is alive.
 */

import { successResponse } from '../utils/response.js'

/**
 * GET /api/health
 * One responsibility: report that the API process is running.
 */
export async function getHealth(_request, response) {
  return successResponse(response, {
    statusCode: 200,
    message: 'RepoPulse API Running',
    timestamp: new Date().toISOString(),
  })
}
