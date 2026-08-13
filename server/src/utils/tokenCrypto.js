/**
 * Encrypt GitHub OAuth access tokens before they hit MongoDB.
 * AES-256-GCM: even if the database leaks, tokens are not usable without TOKEN_ENCRYPTION_KEY.
 */

import crypto from 'node:crypto'
import env from '../config/env.js'
import { createAppError } from './githubParser.js'

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12

function getKey() {
  const secret = env.tokenEncryptionKey
  if (!secret || secret.length < 16) {
    throw createAppError(
      'TOKEN_ENCRYPTION_KEY is missing or too short. Add a 32+ character secret to the server environment.',
      500,
      'MISSING_ENCRYPTION_KEY',
    )
  }
  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptSecret(plainText) {
  if (!plainText) return ''
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptSecret(payload) {
  if (!payload) return ''
  const [ivHex, tagHex, dataHex] = String(payload).split(':')
  if (!ivHex || !tagHex || !dataHex) {
    throw createAppError('Stored GitHub token is corrupt. Please sign in again.', 401, 'INVALID_STORED_TOKEN')
  }

  const decipher = crypto.createDecipheriv(ALGO, getKey(), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()])
  return decrypted.toString('utf8')
}
