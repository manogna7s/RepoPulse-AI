import api from './api'

/**
 * History API helpers. Kept separate from repositoryService so each service
 * owns one backend resource (repository vs history).
 */

function toFriendlyError(error) {
  if (!error.response) {
    return {
      title: 'Network error',
      message: 'Could not reach the RepoPulse API.',
      code: 'NETWORK_ERROR',
    }
  }

  const { status, data } = error.response
  return {
    title: status === 503 ? 'Database unavailable' : 'Request failed',
    message: data?.message || 'Something went wrong.',
    code: data?.error?.code || `HTTP_${status}`,
  }
}

export async function fetchHistory() {
  try {
    const response = await api.get('/history')
    return response.data.data
  } catch (error) {
    throw toFriendlyError(error)
  }
}

export async function fetchHistoryById(id) {
  try {
    const response = await api.get(`/history/${id}`)
    return response.data.data
  } catch (error) {
    throw toFriendlyError(error)
  }
}

export async function deleteHistoryById(id) {
  try {
    const response = await api.delete(`/history/${id}`)
    return response.data.data
  } catch (error) {
    throw toFriendlyError(error)
  }
}
