/**
 * Optional + required JWT middleware.
 * Analyze stays usable for guests (public repos). History is per signed-in user.
 */

import User from '../models/User.js'
import { createAppError } from '../utils/githubParser.js'
import { verifyUserToken } from '../utils/jwt.js'

function readBearerToken(request) {
  const header = request.headers.authorization || ''
  if (header.startsWith('Bearer ')) {
    return header.slice(7).trim()
  }
  return ''
}

export async function optionalAuth(request, _response, next) {
  try {
    const token = readBearerToken(request)
    if (!token) {
      request.user = null
      return next()
    }

    const payload = verifyUserToken(token)
    const user = await User.findById(payload.sub).select('-encryptedAccessToken')
    request.user = user || null
    return next()
  } catch (error) {
    if (error.statusCode === 401) {
      request.user = null
      return next()
    }
    return next(error)
  }
}

export async function requireAuth(request, _response, next) {
  try {
    const token = readBearerToken(request)
    if (!token) {
      throw createAppError('Sign in with GitHub to continue.', 401, 'AUTH_REQUIRED')
    }

    const payload = verifyUserToken(token)
    const user = await User.findById(payload.sub).select('-encryptedAccessToken')
    if (!user) {
      throw createAppError('Account not found. Please sign in again.', 401, 'AUTH_REQUIRED')
    }

    request.user = user
    return next()
  } catch (error) {
    return next(error)
  }
}
