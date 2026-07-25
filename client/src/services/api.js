import axios from 'axios'

// One Axios instance centralizes the API URL and future authentication
// headers. Components should request data through service modules, not Axios.
// Timeout is generous because repository analysis scans files and commits.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 120000,
})

export default api
