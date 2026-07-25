/**
 * WHY THIS FILE EXISTS (app.js)
 * -----------------------------
 * Builds the Express application: security, CORS, routes, errors.
 */

import cors from 'cors'
import express from 'express'
import env from './config/env.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'
import { notFound } from './middleware/notFound.js'
import requestLogger from './middleware/requestLogger.js'
import { analyzeRateLimiter, apiRateLimiter, securityHeaders } from './middleware/security.js'
import debugRouter from './routes/debugRoutes.js'
import healthRouter from './routes/healthRoutes.js'
import historyRouter from './routes/historyRoutes.js'
import repositoryRouter from './routes/repositoryRoutes.js'

const app = express()

const allowedOrigins = new Set([
  env.clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
])

app.use(securityHeaders())
app.use(requestLogger)
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
  }),
)
// Hard limit request bodies so oversized payloads cannot exhaust memory.
app.use(express.json({ limit: '1mb' }))
app.use(apiRateLimiter())

app.use('/api/health', healthRouter)
app.use('/api/repository', analyzeRateLimiter(), repositoryRouter)
app.use('/api/history', historyRouter)

// TEMPORARY: remove /api/debug before production (see debugController.js).
if (env.nodeEnv !== 'production') {
  app.use('/api/debug', debugRouter)
}

app.use(notFound)
app.use(errorMiddleware)

export default app
