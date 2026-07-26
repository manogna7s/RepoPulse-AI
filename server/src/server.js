/**
 * WHY THIS FILE EXISTS (server.js)
 * --------------------------------
 * Process entry: load config → connect MongoDB → listen → shut down cleanly.
 */

import mongoose from 'mongoose'
import app from './app.js'
import { connectDB } from './config/database.js'
import env from './config/env.js'
import { logger } from './utils/logger.js'

let httpServer

async function startServer() {
  const connected = await connectDB()

  httpServer = app.listen(env.port, () => {
    logger.info(`RepoPulse API listening on port ${env.port}`)
    logger.info(`Environment: ${env.nodeEnv}`)
    logger.info(`Database: ${connected ? 'connected' : 'unavailable (history disabled)'}`)
  })
}

/**
 * Production decision: finish in-flight work, then close Mongo before exit.
 * Platforms like Render send SIGTERM during deploys — ignoring it causes
 * abrupt disconnects and orphaned connections.
 */
async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`)

  const forceExit = setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
  forceExit.unref()

  try {
    if (httpServer) {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => (error ? reject(error) : resolve()))
      })
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close()
      logger.info('MongoDB connection closed')
    }
    logger.info('Shutdown complete')
    process.exit(0)
  } catch (error) {
    logger.error('Error during shutdown', { message: error.message })
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    message: reason instanceof Error ? reason.message : String(reason),
  })
})

startServer().catch((error) => {
  logger.error('Failed to start RepoPulse API', { message: error.message })
  process.exit(1)
})
