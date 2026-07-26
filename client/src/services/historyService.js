import api from './api'
import { toFriendlyError } from '../utils/apiErrors'

export async function fetchHistory(params = {}) {
  try {
    const response = await api.get('/history', { params })
    return response.data.data
  } catch (error) {
    throw toFriendlyError(error, {
      networkMessage: 'Could not reach the RepoPulse API.',
    })
  }
}

export async function fetchHistoryById(id) {
  try {
    const response = await api.get(`/history/${id}`)
    return response.data.data
  } catch (error) {
    throw toFriendlyError(error, {
      networkMessage: 'Could not reach the RepoPulse API.',
    })
  }
}

export async function deleteHistoryById(id) {
  try {
    const response = await api.delete(`/history/${id}`)
    return response.data.data
  } catch (error) {
    throw toFriendlyError(error, {
      networkMessage: 'Could not reach the RepoPulse API.',
    })
  }
}
