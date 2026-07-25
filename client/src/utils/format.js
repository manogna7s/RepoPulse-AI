// Pure helper functions. "Pure" means no React and no network calls, which
// makes them trivial to reason about and reuse.

/**
 * Validate a GitHub repository URL before we spend a network request on it.
 * Returns { valid, message } so the caller decides how to display errors.
 */
export function validateGitHubUrl(rawUrl) {
  const url = (rawUrl || '').trim()

  if (!url) {
    return { valid: false, message: 'Please paste a GitHub repository URL.' }
  }

  // Allow users to omit the protocol (github.com/owner/repo).
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`

  let parsed
  try {
    parsed = new URL(withProtocol)
  } catch {
    return { valid: false, message: 'That does not look like a valid URL.' }
  }

  const host = parsed.hostname.toLowerCase()
  if (host !== 'github.com' && host !== 'www.github.com') {
    return { valid: false, message: 'Only github.com repository links are supported.' }
  }

  const segments = parsed.pathname.split('/').filter(Boolean)
  if (segments.length < 2) {
    return {
      valid: false,
      message: 'Include both owner and repository, e.g. github.com/facebook/react',
    }
  }

  return { valid: true, message: '' }
}

/** Format large counts as 1.2k / 3.4M so cards stay compact. */
export function formatCount(value) {
  const number = Number(value) || 0
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`
  if (number >= 1_000) return `${(number / 1_000).toFixed(1)}k`
  return String(number)
}

/** Format an ISO date as a short readable date. */
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Colour for a 0-100 score, used by progress bars and score badges. */
export function scoreColor(score) {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-amber-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-rose-400'
}

/** Matching bar fill colour for the same score thresholds. */
export function scoreBarColor(score) {
  if (score >= 80) return 'bg-emerald-400'
  if (score >= 60) return 'bg-amber-400'
  if (score >= 40) return 'bg-orange-400'
  return 'bg-rose-400'
}
