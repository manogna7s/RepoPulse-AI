/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Express error middleware is a special function with FOUR arguments:
 *   (error, request, response, next)
 *
 * When any route or controller calls `next(error)`, Express skips normal
 * middleware and jumps here. That gives us ONE place to:
 *   - log the unexpected failure
 *   - return a consistent error JSON body
 *   - hide sensitive stack traces in production
 *
 * Controllers stay clean: they throw / next(error) instead of writing
 * their own try/catch response formatting.
 */

import env from '../config/env.js'
import { errorResponse } from '../utils/response.js'

export function errorMiddleware(error, _request, response, _next) {
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal server error'

  // In development we include the stack so debugging is faster.
  // In production we only expose a safe message (+ optional error code).
  const errorDetails =
    env.nodeEnv === 'development'
      ? { name: error.name, code: error.code || null, stack: error.stack }
      : error.code
        ? { code: error.code }
        : null

  return errorResponse(response, {
    statusCode,
    message,
    error: errorDetails,
  })
}
