/**
 * WHY THIS FILE EXISTS (app.js)
 * -----------------------------
 * app.js builds the Express APPLICATION:
 *   - middleware (JSON, CORS, logging)
 *   - route registration
 *   - global error handling
 *
 * It does NOT open a network port. That keeps the app easy to test:
 * tests can import `app` and fire fake requests without starting a server.
 */

import cors from 'cors'
import express from 'express'
import env from './config/env.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'
import { notFound } from './middleware/notFound.js'
import requestLogger from './middleware/requestLogger.js'
import debugRouter from './routes/debugRoutes.js'
import healthRouter from './routes/healthRoutes.js'
import historyRouter from './routes/historyRoutes.js'
import repositoryRouter from './routes/repositoryRoutes.js'

const app = express()

// Allow the configured client URL plus common Vite ports during local work.
const allowedOrigins = new Set([
  env.clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
])

app.use(requestLogger)
app.use(
  cors({
    origin(origin, callback) {
      // Non-browser tools (curl/Postman) send no Origin header.
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }
      callback(null, false)
    },
  }),
)
app.use(express.json({ limit: '2mb' }))

app.use('/api/health', healthRouter)
app.use('/api/repository', repositoryRouter)
app.use('/api/history', historyRouter)

// TEMPORARY: remove /api/debug before production (see debugController.js).
app.use('/api/debug', debugRouter)

app.use(notFound)
app.use(errorMiddleware)

export default app
