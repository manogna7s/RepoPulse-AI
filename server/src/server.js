/**
 * WHY THIS FILE EXISTS (server.js)
 * --------------------------------
 * server.js is the PROCESS entry point. It:
 *   1) loads configuration (via config/env.js)
 *   2) connects MongoDB
 *   3) starts listening on a PORT
 */

import app from './app.js'
import { connectDB } from './config/database.js'
import env from './config/env.js'

async function startServer() {
  const connected = await connectDB()

  app.listen(env.port, () => {
    console.log(`RepoPulse API listening on port ${env.port}`)
    console.log(`Environment: ${env.nodeEnv}`)
    console.log(`Database: ${connected ? 'connected' : 'unavailable (history disabled)'}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start RepoPulse API:', error)
  process.exit(1)
})
