/**
 * Compatibility re-export.
 * Older code imported connectDatabase from config/db.js.
 * The real implementation now lives in config/database.js.
 */
export { connectDB as connectDatabase, connectDB, isDatabaseConnected } from './database.js'
