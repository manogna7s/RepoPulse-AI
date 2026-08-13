import axios from 'axios'
import { getStoredToken } from '../utils/authToken'

// One Axios instance centralizes the API URL and auth header.
// Timeout is generous because repository analysis scans files and commits.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 120000,
})

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
