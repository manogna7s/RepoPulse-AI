/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Cross-cutting HTTP hardening (Helmet headers + rate limits) should live in
 * middleware, not inside every route. Keeping security knobs centralized makes
 * production readiness reviews much easier.
 */

import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import env from '../config/env.js'

/** Secure HTTP headers (XSS, sniffing, clickjacking defaults). */
export function securityHeaders() {
  return helmet({
    // API-only server: disable CSP that is meant for browser document apps.
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
}

/**
 * General API rate limit.
 * Generous in development so local testing is not blocked.
 */
export function apiRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === 'production' ? 200 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests. Please wait and try again.',
      error: { code: 'RATE_LIMITED' },
    },
  })
}

/**
 * Stricter limit on expensive analyze calls (GitHub + scoring + Gemini).
 */
export function analyzeRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: env.nodeEnv === 'production' ? 30 : 120,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Analyze rate limit reached. Please wait before analyzing again.',
      error: { code: 'ANALYZE_RATE_LIMITED' },
    },
  })
}
