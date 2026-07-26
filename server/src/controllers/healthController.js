/**
 * Health is used by developers and hosts (Render) to confirm the process is alive.
 */

import { isDatabaseConnected } from '../config/database.js'
import { successResponse } from '../utils/response.js'

/**
 * GET /api/health
 */
export async function getHealth(_request, response) {
  const databaseConnected = isDatabaseConnected()

  return successResponse(response, {
    statusCode: 200,
    message: 'RepoPulse API Running',
    data: {
      status: 'ok',
      database: databaseConnected ? 'connected' : 'disconnected',
    },
    timestamp: new Date().toISOString(),
  })
}
