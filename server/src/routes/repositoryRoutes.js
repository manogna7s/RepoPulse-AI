/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Repository routes declare the public URLs for analysis features.
 * Controllers are wired here; services are never imported into route files.
 *
 * The analyze endpoint is registered so the module is "plugged in",
 * but it currently returns 501 Not Implemented on purpose.
 */

import { Router } from 'express'
import { analyzeRepository } from '../controllers/repositoryController.js'

const repositoryRouter = Router()

// POST /api/repositories/analyze
// TODO: Add request validation middleware before calling the controller.
repositoryRouter.post('/analyze', analyzeRepository)

export default repositoryRouter
