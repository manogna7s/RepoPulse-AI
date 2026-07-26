/**
 * Morgan request logging wired through our logger timestamps via stream.
 */

import morgan from 'morgan'
import { logger } from '../utils/logger.js'

const stream = {
  write(message) {
    logger.info(message.trim())
  },
}

const requestLogger = morgan(
  ':method :url :status :response-time ms',
  { stream },
)

export default requestLogger
