/**
 * WHY THIS FILE EXISTS
 * --------------------
 * If no route matches the URL, Express would otherwise send an HTML page.
 * API clients expect JSON. This middleware is registered AFTER all routes
 * so it only runs for unknown paths.
 */

import { errorResponse } from '../utils/response.js'

export function notFound(request, response, _next) {
  return errorResponse(response, {
    statusCode: 404,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
    error: { path: request.originalUrl, method: request.method },
  })
}
