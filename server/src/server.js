/**
 * WHY THIS FILE EXISTS (server.js)
 * --------------------------------
 * server.js is the PROCESS entry point. It:
 *   1) loads configuration (via config/env.js)
 *   2) connects infrastructure (database placeholder for now)
 *   3) starts listening on a PORT
 *
 * WHY SEPARATE FROM app.js?
 * - app.js = "what the API does"
 * - server.js = "how the process boots"
 * This separation is standard in professional Node APIs and makes testing easier.
 */

import app from './app.js'
import { connectDatabase } from './config/db.js'
import env from './config/env.js'

async function startServer() {
  // Future MongoDB connection lives here so routes never open DB sockets.
  await connectDatabase()

  app.listen(env.port, () => {
    console.log(`RepoPulse API listening on port ${env.port}`)
    console.log(`Environment: ${env.nodeEnv}`)
  })
}

// Top-level startup errors should crash loudly so process managers restart us.
startServer().catch((error) => {
  console.error('Failed to start RepoPulse API:', error)
  process.exit(1)
})
