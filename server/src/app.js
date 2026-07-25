import cors from 'cors'
import express from 'express'
import env from './config/env.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import healthRouter from './routes/healthRoutes.js'

const app = express()

// Middleware configures cross-cutting HTTP behavior before requests reach
// routes. Restricting CORS to the frontend URL is safer than allowing all sites.
app.use(cors({ origin: env.clientUrl }))
app.use(express.json())

// Version-neutral /api grouping leaves room for additional resource routes.
app.use('/api/health', healthRouter)

// Error middleware must be registered after routes so it catches unmatched
// requests and errors passed forward by future controllers.
app.use(notFound)
app.use(errorHandler)

export default app
