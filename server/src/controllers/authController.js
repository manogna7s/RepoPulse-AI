/**
 * Auth HTTP layer: start OAuth, handle GitHub callback, return current user.
 */

import env from '../config/env.js'
import {
  buildClientRedirect,
  buildGitHubAuthorizeUrl,
  createOAuthState,
  exchangeCodeForAccessToken,
  fetchGitHubProfile,
  isOAuthConfigured,
  issueSession,
  toPublicUser,
  upsertUserFromGitHub,
} from '../services/authService.js'
import { successResponse } from '../utils/response.js'

const STATE_COOKIE = 'repopulse_oauth_state'

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.nodeEnv === 'production',
    maxAge: 10 * 60 * 1000,
    path: '/',
  }
}

export async function startGitHubOAuth(request, response, next) {
  try {
    const state = createOAuthState()
    const authorizeUrl = buildGitHubAuthorizeUrl(state)
    response.cookie(STATE_COOKIE, state, cookieOptions())
    return response.redirect(authorizeUrl)
  } catch (error) {
    return next(error)
  }
}

export async function handleGitHubCallback(request, response, next) {
  try {
    const { code, state, error } = request.query ?? {}

    if (error) {
      return response.redirect(buildClientRedirect({ error: String(error) }))
    }

    const expectedState = request.cookies?.[STATE_COOKIE]
    response.clearCookie(STATE_COOKIE, { path: '/' })

    if (!code || !state || !expectedState || state !== expectedState) {
      return response.redirect(buildClientRedirect({ error: 'invalid_oauth_state' }))
    }

    const accessToken = await exchangeCodeForAccessToken(String(code))
    const profile = await fetchGitHubProfile(accessToken)
    const user = await upsertUserFromGitHub(profile, accessToken)
    const session = issueSession(user)

    return response.redirect(buildClientRedirect({ token: session.token }))
  } catch (error) {
    const code = error.code || 'oauth_failed'
    return response.redirect(buildClientRedirect({ error: String(code).toLowerCase() }))
  }
}

export async function getCurrentUser(request, response) {
  return successResponse(response, {
    message: request.user ? 'Signed in' : 'Guest',
    data: {
      user: toPublicUser(request.user),
      oauthConfigured: isOAuthConfigured(),
    },
  })
}

export async function logout(_request, response) {
  return successResponse(response, {
    message: 'Signed out',
    data: { user: null },
  })
}
