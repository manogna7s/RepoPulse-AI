/**
 * GitHub OAuth for end users.
 * Flow: redirect → GitHub consent → callback code → access token → upsert User → JWT.
 */

import crypto from 'node:crypto'
import axios from 'axios'
import env from '../config/env.js'
import User from '../models/User.js'
import { createAppError } from '../utils/githubParser.js'
import { encryptSecret, decryptSecret } from '../utils/tokenCrypto.js'
import { signUserToken } from '../utils/jwt.js'

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize'
const GITHUB_TOKEN = 'https://github.com/login/oauth/access_token'
const GITHUB_API = 'https://api.github.com'

function assertOAuthConfigured() {
  if (!env.githubClientId || !env.githubClientSecret) {
    throw createAppError(
      'GitHub OAuth is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.',
      503,
      'OAUTH_NOT_CONFIGURED',
    )
  }
}

export function isOAuthConfigured() {
  return Boolean(env.githubClientId && env.githubClientSecret && env.jwtSecret && env.tokenEncryptionKey)
}

export function createOAuthState() {
  return crypto.randomBytes(16).toString('hex')
}

export function buildGitHubAuthorizeUrl(state) {
  assertOAuthConfigured()

  const params = new URLSearchParams({
    client_id: env.githubClientId,
    redirect_uri: env.githubCallbackUrl,
    scope: env.githubOAuthScopes,
    state,
    allow_signup: 'true',
  })

  return `${GITHUB_AUTHORIZE}?${params.toString()}`
}

export async function exchangeCodeForAccessToken(code) {
  assertOAuthConfigured()

  try {
    const { data } = await axios.post(
      GITHUB_TOKEN,
      {
        client_id: env.githubClientId,
        client_secret: env.githubClientSecret,
        code,
        redirect_uri: env.githubCallbackUrl,
      },
      { headers: { Accept: 'application/json' }, timeout: 15000 },
    )

    if (data.error || !data.access_token) {
      throw createAppError(
        data.error_description || 'GitHub did not return an access token.',
        401,
        'OAUTH_EXCHANGE_FAILED',
      )
    }

    return data.access_token
  } catch (error) {
    if (error.statusCode) throw error
    throw createAppError('Could not complete GitHub sign-in. Try again.', 502, 'OAUTH_EXCHANGE_FAILED')
  }
}

export async function fetchGitHubProfile(accessToken) {
  try {
    const { data } = await axios.get(`${GITHUB_API}/user`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'RepoPulse-AI',
      },
      timeout: 15000,
    })

    return {
      githubId: String(data.id),
      login: data.login,
      name: data.name || data.login,
      email: data.email || '',
      avatarUrl: data.avatar_url || '',
      profileUrl: data.html_url || '',
    }
  } catch {
    throw createAppError('Could not load your GitHub profile after sign-in.', 502, 'OAUTH_PROFILE_FAILED')
  }
}

export async function upsertUserFromGitHub(profile, accessToken) {
  const encryptedAccessToken = encryptSecret(accessToken)

  const user = await User.findOneAndUpdate(
    { githubId: profile.githubId },
    {
      ...profile,
      encryptedAccessToken,
      lastLoginAt: new Date(),
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )

  return user
}

export function toPublicUser(user) {
  if (!user) return null
  return {
    id: String(user._id),
    githubId: user.githubId,
    login: user.login,
    name: user.name || user.login,
    avatarUrl: user.avatarUrl || '',
    profileUrl: user.profileUrl || '',
  }
}

export function issueSession(user) {
  return {
    token: signUserToken(user),
    user: toPublicUser(user),
  }
}

export async function getDecryptedAccessToken(userId) {
  const user = await User.findById(userId).select('+encryptedAccessToken')
  if (!user?.encryptedAccessToken) {
    throw createAppError('GitHub access expired. Please sign in again.', 401, 'AUTH_REQUIRED')
  }
  return decryptSecret(user.encryptedAccessToken)
}

export function buildClientRedirect({ token, error }) {
  const url = new URL('/auth/callback', env.clientUrl)
  if (token) url.searchParams.set('token', token)
  if (error) url.searchParams.set('error', error)
  return url.toString()
}
