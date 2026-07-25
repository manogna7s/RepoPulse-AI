import env from '../config/env.js'

// Centralized error handling prevents every controller from repeating the same
// response format and hides stack traces in production.
export function errorHandler(error, _request, response, _next) {
  const statusCode = error.statusCode || 500

  response.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  })
}
