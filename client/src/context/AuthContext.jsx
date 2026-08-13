import { useCallback, useEffect, useMemo, useState } from 'react'
import AuthContext from './authContextObject'
import {
  fetchCurrentUser,
  getAuthLoginUrl,
  logoutRemote,
} from '../services/authService'
import { clearToken, getStoredToken, storeToken } from '../utils/authToken'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [oauthConfigured, setOauthConfigured] = useState(false)
  const [isReady, setIsReady] = useState(false)

  const refreshUser = useCallback(async () => {
    try {
      const data = await fetchCurrentUser()
      setUser(data.user || null)
      setOauthConfigured(Boolean(data.oauthConfigured))
      if (!data.user) clearToken()
    } catch {
      setUser(null)
    } finally {
      setIsReady(true)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const completeLogin = useCallback(
    async (token) => {
      storeToken(token)
      await refreshUser()
    },
    [refreshUser],
  )

  const login = useCallback(() => {
    window.location.assign(getAuthLoginUrl())
  }, [])

  const logout = useCallback(async () => {
    await logoutRemote()
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isReady,
      isSignedIn: Boolean(user),
      oauthConfigured,
      hasToken: Boolean(getStoredToken()),
      login,
      logout,
      completeLogin,
      refreshUser,
    }),
    [user, isReady, oauthConfigured, login, logout, completeLogin, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
