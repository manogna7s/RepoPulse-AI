import { Router } from 'express'
import { getHealth } from '../controllers/healthController.js'

// Routes map URLs to controllers without containing response logic themselves.
const healthRouter = Router()

healthRouter.get('/', getHealth)

export default healthRouter
