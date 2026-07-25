/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Controllers should not know how to parse GitHub URLs.
 * This utility turns a user-pasted link into { owner, repo } so the
 * GitHub service can call the REST API with clean path segments.
 *
 * Keeping parsing here also means we validate once and reuse everywhere
 * (API routes today, cron jobs or CLI tools later).
 */

/**
 * Build a small HTTP-aware Error so Express error middleware can set status.
 * One responsibility: attach statusCode (and optional code) to an Error.
 */
export function createAppError(message, statusCode = 500, code = 'APP_ERROR') {
  const error = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

/**
 * Accept a GitHub repository URL and return { owner, repo }.
 * Supports common forms:
 *   https://github.com/facebook/react
 *   https://github.com/facebook/react/
 *   https://github.com/facebook/react.git
 *   github.com/facebook/react
 *
 * Throws a 400 AppError when the URL is missing or not a GitHub repo link.
 */
export function parseGitHubUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    throw createAppError(
      'Repository URL is required. Example: https://github.com/facebook/react',
      400,
      'INVALID_URL',
    )
  }

  const trimmed = url.trim()

  // Allow users to paste links without the protocol (github.com/owner/repo).
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`

  let parsed
  try {
    parsed = new URL(withProtocol)
  } catch {
    throw createAppError(
      'Invalid URL format. Please provide a valid GitHub repository link.',
      400,
      'INVALID_URL',
    )
  }

  // Only accept github.com (and www.github.com). Reject gist, raw, etc.
  const host = parsed.hostname.toLowerCase()
  if (host !== 'github.com' && host !== 'www.github.com') {
    throw createAppError(
      'URL must be a github.com repository link.',
      400,
      'INVALID_URL',
    )
  }

  // pathname looks like "/facebook/react" or "/facebook/react/tree/main"
  const segments = parsed.pathname.split('/').filter(Boolean)

  if (segments.length < 2) {
    throw createAppError(
      'GitHub URL must include both owner and repository name.',
      400,
      'INVALID_URL',
    )
  }

  const owner = segments[0]
  // Strip optional .git suffix that appears when users copy clone URLs.
  const repo = segments[1].replace(/\.git$/i, '')

  // Basic sanity: GitHub owner/repo names are limited character sets.
  const namePattern = /^[A-Za-z0-9_.-]+$/
  if (!namePattern.test(owner) || !namePattern.test(repo)) {
    throw createAppError(
      'Owner or repository name contains invalid characters.',
      400,
      'INVALID_URL',
    )
  }

  return { owner, repo }
}
