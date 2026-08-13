/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Routes only answer: "Which URL maps to which controller?"
 * No GitHub calls and no response formatting live here.
 */

import { Router } from 'express'
import { analyzeRepository } from '../controllers/repositoryController.js'
import { optionalAuth } from '../middleware/auth.js'

const repositoryRouter = Router()

// POST /api/repository/analyze
repositoryRouter.post('/analyze', optionalAuth, analyzeRepository)

export default repositoryRouter
