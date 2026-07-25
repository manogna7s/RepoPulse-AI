import dotenv from 'dotenv'

// Loading environment variables in one module gives the application a single
// source of truth and keeps secrets out of committed source code.
dotenv.config()

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGODB_URI || '',
}

export default env
