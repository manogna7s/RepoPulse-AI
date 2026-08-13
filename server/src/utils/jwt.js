/**
 * Session JWTs identify the logged-in user. They do NOT contain the GitHub token.
 * The GitHub token stays encrypted in Mongo and is loaded only on the server.
 */

import jwt from 'jsonwebtoken'
import env from '../config/env.js'
import { createAppError } from './githubParser.js'

export function signUserToken(user) {
  if (!env.jwtSecret) {
    throw createAppError(
      'JWT_SECRET is missing. Add it to the server environment before enabling login.',
      500,
      'MISSING_JWT_SECRET',
    )
  }

  return jwt.sign(
    {
      sub: String(user._id),
      login: user.login,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  )
}

export function verifyUserToken(token) {
  if (!env.jwtSecret) {
    throw createAppError('JWT_SECRET is missing.', 500, 'MISSING_JWT_SECRET')
  }

  try {
    return jwt.verify(token, env.jwtSecret)
  } catch {
    throw createAppError('Session expired or invalid. Please sign in again.', 401, 'INVALID_SESSION')
  }
}
