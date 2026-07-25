import api from './api'

/**
 * WHY A SERVICE FILE?
 * Components should describe UI, not HTTP details. Every backend call lives in
 * a service so endpoints, payload shapes, and error translation change in one
 * place instead of inside many components.
 */

/**
 * POST /api/repository/analyze
 * Returns the `data` object from our standard API envelope.
 */
export async function analyzeRepository(url) {
  try {
    const response = await api.post('/repository/analyze', { url })
    return response.data.data
  } catch (error) {
    throw toFriendlyError(error)
  }
}

/**
 * Translate Axios/backend failures into a small object the UI can render.
 * One responsibility: produce { title, message, code } for error cards.
 */
function toFriendlyError(error) {
  // No response object means the request never reached the server.
  if (!error.response) {
    return {
      title: 'Network error',
      message:
        'We could not reach the RepoPulse API. Check that the server is running and try again.',
      code: 'NETWORK_ERROR',
    }
  }

  const { status, data } = error.response
  const backendMessage = data?.message
  const backendCode = data?.error?.code

  const titles = {
    400: 'Invalid repository URL',
    401: 'GitHub authentication failed',
    404: 'Repository not found',
    429: 'GitHub rate limit reached',
  }

  return {
    title: titles[status] || 'Something went wrong',
    message: backendMessage || 'The analysis could not be completed. Please try again.',
    code: backendCode || `HTTP_${status}`,
  }
}
