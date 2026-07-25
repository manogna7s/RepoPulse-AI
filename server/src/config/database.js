/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Database connection is infrastructure, not business logic.
 * Controllers/services should ask Mongoose for documents — they should never
 * call mongoose.connect themselves. That keeps startup concerns in one place
 * and makes the API easier to test.
 */

import mongoose from 'mongoose'
import env from './env.js'

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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

  let lastError

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri)
      console.log('Database: connected to MongoDB')
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
