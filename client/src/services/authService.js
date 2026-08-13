import api from './api'
import { toFriendlyError } from '../utils/apiErrors'
import { clearToken, getStoredToken, storeToken } from '../utils/authToken'

export { clearToken, getStoredToken, storeToken }

export function getAuthLoginUrl() {
  const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  return `${base.replace(/\/$/, '')}/auth/github`
}

export async function fetchCurrentUser() {
  try {
    const response = await api.get('/auth/me')
    return response.data.data
  } catch (error) {
    throw toFriendlyError(error)
  }
}

export async function logoutRemote() {
  try {
    await api.post('/auth/logout')
  } catch {
    // Local sign-out should still succeed if the network is down.
  }
}
