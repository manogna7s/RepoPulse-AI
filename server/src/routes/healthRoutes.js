/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Routes answer only: "Which URL maps to which controller?"
 *
 * Keeping routes free of business logic makes the API surface easy to scan
 * and keeps controllers/services independently testable.
 */

import { Router } from 'express'
import { getHealth } from '../controllers/healthController.js'

const healthRouter = Router()

// GET /api/health  (mounted at /api/health in app.js)
healthRouter.get('/', getHealth)

export default healthRouter
