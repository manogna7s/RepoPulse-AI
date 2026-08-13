const TOKEN_KEY = 'repopulse_token'

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function storeToken(token) {
  if (!token) {
    clearToken()
    return
  }
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore quota / private-mode failures.
  }
}
