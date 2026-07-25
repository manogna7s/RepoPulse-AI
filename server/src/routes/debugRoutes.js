/**
 * TEMPORARY DEBUG ROUTES — remove before production (see debugController.js).
 */

import { Router } from 'express'
import { getGitHubDebug } from '../controllers/debugController.js'

const debugRouter = Router()

// GET /api/debug/github
debugRouter.get('/github', getGitHubDebug)

export default debugRouter
