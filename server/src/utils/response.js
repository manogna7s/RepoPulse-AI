/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Every API endpoint should return JSON in the SAME shape.
 * Frontend developers (and future mobile clients) can then rely on one
 * contract: look at `success`, then read `message` / `data` / `error`.
 *
 * Without this helper, each controller invents its own response format,
 * which becomes painful to maintain as the API grows.
 */

/**
 * Send a successful JSON response.
 * One responsibility: format and send a success payload.
 *
 * Extra top-level fields (for example `timestamp`) can be passed and are
 * merged into the body so endpoints can stay expressive without inventing
 * a brand-new response shape.
 */
export function successResponse(
  response,
  { statusCode = 200, message = 'OK', data = null, ...extraFields } = {},
) {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
    ...extraFields,
  })
}

/**
 * Send a failed JSON response.
 * One responsibility: format and send an error payload.
 */
export function errorResponse(response, { statusCode = 500, message = 'Internal server error', error = null } = {}) {
  return response.status(statusCode).json({
    success: false,
    message,
    error,
  })
}
