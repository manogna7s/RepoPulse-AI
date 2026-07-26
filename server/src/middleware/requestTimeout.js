/**
 * Abort long-running requests before they hang forever.
 * Analyze can take a while (GitHub + Gemini), so the limit is generous.
 */

import { errorResponse } from '../utils/response.js'

/**
 * @param {number} ms - max time before responding 504
 */
export function requestTimeout(ms = 120000) {
  return function timeoutMiddleware(request, response, next) {
    response.setTimeout(ms, () => {
      if (response.headersSent) return
      errorResponse(response, {
        statusCode: 504,
        message: 'Request timed out. Please try again with a smaller repository.',
        error: { code: 'REQUEST_TIMEOUT' },
      })
    })
    next()
  }
}

export default requestTimeout
