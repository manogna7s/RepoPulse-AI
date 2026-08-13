import { Router } from 'express'
import { getCurrentUser, handleGitHubCallback, logout, startGitHubOAuth } from '../controllers/authController.js'
import { optionalAuth } from '../middleware/auth.js'

const authRouter = Router()

authRouter.get('/github', startGitHubOAuth)
authRouter.get('/github/callback', handleGitHubCallback)
authRouter.get('/me', optionalAuth, getCurrentUser)
authRouter.post('/logout', logout)

export default authRouter
