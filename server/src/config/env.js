/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Environment variables change between development, staging, and production.
 * Loading them in ONE module gives the app a single source of truth and
 * keeps secrets out of committed source code.
 */

import dotenv from 'dotenv'

dotenv.config()

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || '',
  // Read from .env so the GitHub token is never hardcoded in source files.
  githubToken: process.env.GITHUB_TOKEN || '',
}

export default env
