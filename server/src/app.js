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
 *
 * WHY SEPARATE FROM server.js?
 * Companies split "configure the app" from "start listening" so:
 *   1) unit/integration tests stay fast and isolated
 *   2) startup concerns (env, DB) stay in one place (server.js)
 */

import cors from 'cors'
import express from 'express'
import env from './config/env.js'
import { errorMiddleware } from './middleware/errorMiddleware.js'
import { notFound } from './middleware/notFound.js'
import requestLogger from './middleware/requestLogger.js'
import healthRouter from './routes/healthRoutes.js'
import repositoryRouter from './routes/repositoryRoutes.js'

const app = express()

// --- Cross-cutting middleware (runs for every request) ---
app.use(requestLogger)
app.use(cors({ origin: env.clientUrl }))
app.use(express.json())

// --- Feature routes (each module owns its own router) ---
app.use('/api/health', healthRouter)
// Singular path matches the product API: POST /api/repository/analyze
app.use('/api/repository', repositoryRouter)

// --- Fallback handlers (must stay AFTER routes) ---
app.use(notFound)
app.use(errorMiddleware)

export default app
