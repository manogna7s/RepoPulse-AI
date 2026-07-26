/**
 * WHY THIS FILE EXISTS (app.js)
 * -----------------------------
 * Builds the Express application: security, CORS, routes, errors.
 */

import compression from 'compression'
import cors from 'cors'
import express from 'express'
import env from './config/env.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'
import { notFound } from './middleware/notFound.js'
import requestLogger from './middleware/requestLogger.js'
import { requestTimeout } from './middleware/requestTimeout.js'
import { analyzeRateLimiter, apiRateLimiter, securityHeaders } from './middleware/security.js'
import debugRouter from './routes/debugRoutes.js'
import healthRouter from './routes/healthRoutes.js'
import historyRouter from './routes/historyRoutes.js'
import repositoryRouter from './routes/repositoryRoutes.js'
import { logger } from './utils/logger.js'

const app = express()

/**
 * Production decision: only trust configured origins in production.
 * Localhost variants stay allowed in development for Vite's rotating ports.
 */
function buildAllowedOrigins() {
  const origins = new Set([env.clientUrl])

  if (env.nodeEnv !== 'production') {
    ;[
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
    ].forEach((origin) => origins.add(origin))
  }

  // Optional comma-separated extras (preview URLs, staging).
  if (env.extraCorsOrigins) {
    env.extraCorsOrigins
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((origin) => origins.add(origin))
  }

  return origins
}

const allowedOrigins = buildAllowedOrigins()

// Trust Render/Vercel reverse proxies so rate-limit and IPs stay accurate.
app.set('trust proxy', 1)

app.use(securityHeaders())
// gzip JSON responses — cheap win for dashboard payloads.
app.use(compression())
app.use(requestLogger)
app.use(requestTimeout(env.requestTimeoutMs))

app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (curl, health checks) send no Origin header.
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }
      logger.warn('CORS blocked origin', { origin })
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

// Debug routes stay off in production to avoid leaking token diagnostics.
if (env.nodeEnv !== 'production') {
  app.use('/api/debug', debugRouter)
}

app.use(notFound)
app.use(errorMiddleware)

export default app
