/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Database connection is infrastructure, not business logic.
 * Keeping it in config/ lets server.js start the app without caring
 * how MongoDB is connected later.
 *
 * This is a PLACEHOLDER only — we do not connect to MongoDB yet.
 */

import env from './env.js'

/**
 * Future MongoDB Atlas connection.
 * One responsibility: open (or skip) the database connection.
 */
export async function connectDatabase() {
  // TODO: When database work begins, use mongoose.connect(env.mongoUri)
  // and throw a clear error if MONGODB_URI is missing.
  if (!env.mongoUri) {
    console.log('Database: skipped (MONGODB_URI not required for this milestone)')
    return
  }

  console.log('Database: connection placeholder ready (not connected yet)')
}
