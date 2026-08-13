/**
 * Express error middleware (four args). Controllers call next(error);
 * this is the single place that formats failures and hides stacks in prod.
 */

import env from '../config/env.js'
import { logger } from '../utils/logger.js'
import { errorResponse } from '../utils/response.js'

export function errorMiddleware(error, _request, response, _next) {
  const statusCode = error.statusCode || 500
  const message =
    statusCode >= 500 && env.nodeEnv === 'production' && statusCode !== 503
      ? 'Internal server error'
      : error.message || 'Internal server error'

  logger.error('Request failed', {
    statusCode,
    message: error.message,
    code: error.code || null,
  })

  const errorDetails =
    env.nodeEnv === 'development'
      ? { name: error.name, code: error.code || null, stack: error.stack }
      : error.code
        ? { code: error.code }
        : statusCode >= 500
          ? { code: 'INTERNAL_ERROR' }
          : null

  return errorResponse(response, {
    statusCode,
    message,
    error: errorDetails,
  })
}
