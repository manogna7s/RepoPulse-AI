import mongoose from 'mongoose'
import env from './env.js'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000
const DEFAULT_DB_NAME = 'repopulse'

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Atlas URIs often omit the database name (/?retryWrites=...).
 * Without one, Mongoose silently uses "test". Force /repopulse instead.
 */
export function normalizeMongoUri(uri, dbName = DEFAULT_DB_NAME) {
  if (!uri) return uri

  const match = uri.match(/^(mongodb(?:\+srv)?:\/\/[^/?]+)(\/[^?]*)?(\?.*)?$/i)
  if (!match) return uri

  const base = match[1]
  const path = match[2]
  const query = match[3] || ''

  // Missing path, bare "/", or empty path → inject default database name.
  if (!path || path === '/' ) {
    return `${base}/${dbName}${query}`
  }

  return uri
}

/**
 * Connect to MongoDB Atlas (or any MongoDB URI).
 * One responsibility: open the database connection with simple retries.
 *
 * Returns true when connected, false when skipped (no URI configured).
 */
export async function connectDB() {
  if (!env.mongoUri) {
    console.warn(
      'Database: MONGODB_URI is missing. Analysis will still work, but history will not be saved.',
    )
    return false
  }

  // Avoid noisy reconnect attempts if already connected (e.g. hot reload).
  if (mongoose.connection.readyState === 1) {
    console.log('Database: already connected')
    return true
  }

  mongoose.set('strictQuery', true)

  const uri = normalizeMongoUri(env.mongoUri)
  let lastError

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(uri)
      console.log(`Database: connected to MongoDB (${mongoose.connection.name})`)
      return true
    } catch (error) {
      lastError = error
      console.error(
        `Database: connection attempt ${attempt}/${MAX_RETRIES} failed — ${error.message}`,
      )

      if (attempt < MAX_RETRIES) {
        await wait(RETRY_DELAY_MS * attempt)
      }
    }
  }

  // Soft-fail so the API can still serve GitHub analysis without persistence.
  console.error('Database: could not connect after retries.', lastError?.message)
  return false
}

/** True when Mongoose currently has an open connection. */
export function isDatabaseConnected() {
  return mongoose.connection.readyState === 1
}

export default connectDB
