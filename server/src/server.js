import app from './app.js'
import env from './config/env.js'

// Keeping network startup separate from app configuration makes the Express
// application easier to test without opening a real port.
app.listen(env.port, () => {
  console.log(`RepoPulse API listening on port ${env.port}`)
})
