/**
 * Shared translation of Axios failures into UI-friendly error objects.
 * Keeps repository and history services from duplicating the same mapping.
 */

export function toFriendlyError(error, options = {}) {
  const {
    networkMessage = 'We could not reach the RepoPulse API. Check your connection and try again.',
  } = options

  if (!error.response) {
    const isTimeout = error.code === 'ECONNABORTED'
    return {
      title: isTimeout ? 'Request timed out' : 'Network error',
      message: isTimeout
        ? 'The analysis took too long. Try again or pick a smaller repository.'
        : networkMessage,
      code: isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR',
    }
  }

  const { status, data } = error.response
  const backendMessage = data?.message
  const backendCode = data?.error?.code

  const titles = {
    400: 'Invalid repository URL',
    401: 'GitHub authentication failed',
    404: 'Repository not found',
    429: 'Rate limit reached',
    503: 'Database unavailable',
    504: 'Request timed out',
  }

  return {
    title: titles[status] || 'Something went wrong',
    message: backendMessage || 'The request could not be completed. Please try again.',
    code: backendCode || `HTTP_${status}`,
  }
}
