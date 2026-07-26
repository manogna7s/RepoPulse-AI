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
  // Optional comma-separated origins for preview / staging frontends.
  extraCorsOrigins: process.env.EXTRA_CORS_ORIGINS || '',
  mongoUri: process.env.MONGODB_URI || '',
  githubToken: process.env.GITHUB_TOKEN || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-pro',
  // Analyze can take 30–90s on large repos; keep under hosting limits.
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS) || 120000,
}

export default env
