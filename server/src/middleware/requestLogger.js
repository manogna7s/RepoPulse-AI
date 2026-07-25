/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Logging answers: "What happened on the server just now?"
 *
 * When something breaks in production, logs tell you:
 *   - which HTTP method and URL were hit
 *   - what status code was returned
 *   - how long the request took
 *
 * Morgan is a small, battle-tested Express logger. We configure it here
 * so app.js stays focused on wiring middleware, not log format details.
 *
 * WHY LOGGING MATTERS (interview-ready):
 * Without logs you are debugging blind. With request logs you can measure
 * latency, spot failing endpoints, and audit traffic patterns.
 */

import morgan from 'morgan'

// Combined-style output includes method, URL, status, and response time.
// Example: GET /api/health 200 3.2 ms
const requestLogger = morgan(':method :url :status :response-time ms')

export default requestLogger
