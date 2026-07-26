/**
 * Centralized logging keeps timestamps and severity consistent.
 * Production hosts (Render) scrape stdout/stderr — structured lines help.
 */

function stamp() {
  return new Date().toISOString()
}

export const logger = {
  info(message, meta) {
    if (meta !== undefined) {
      console.log(`[${stamp()}] INFO  ${message}`, meta)
      return
    }
    console.log(`[${stamp()}] INFO  ${message}`)
  },

  warn(message, meta) {
    if (meta !== undefined) {
      console.warn(`[${stamp()}] WARN  ${message}`, meta)
      return
    }
    console.warn(`[${stamp()}] WARN  ${message}`)
  },

  error(message, meta) {
    if (meta !== undefined) {
      console.error(`[${stamp()}] ERROR ${message}`, meta)
      return
    }
    console.error(`[${stamp()}] ERROR ${message}`)
  },
}

export default logger
