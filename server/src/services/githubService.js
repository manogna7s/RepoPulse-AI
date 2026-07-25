/**
 * WHY THIS FILE EXISTS
 * --------------------
 * All GitHub REST API calls live here — never inside controllers.
 * Controllers ask for data; this service knows HOW to talk to GitHub.
 *
 * Benefits of this separation:
 *   - Controllers stay thin and easy to read
 *   - We can unit-test GitHub logic without spinning up Express
 *   - If GitHub changes an endpoint, we update ONE file
 */

import axios from 'axios'
import env from '../config/env.js'
import { createAppError } from '../utils/githubParser.js'

const GITHUB_API_BASE = 'https://api.github.com'

/**
 * Shared Axios client for every GitHub request.
 * Sets auth + required GitHub headers in one place so we never hardcode tokens.
 */
function createGitHubClient() {
  if (!env.githubToken) {
    throw createAppError(
      'GitHub token is missing. Add GITHUB_TOKEN to your server .env file.',
      500,
      'MISSING_TOKEN',
    )
  }

  return axios.create({
    baseURL: GITHUB_API_BASE,
    timeout: 15000,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.githubToken}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'RepoPulse-AI',
    },
  })
}

/**
 * Turn Axios / network failures into clear AppErrors for the API client.
 * One responsibility: map low-level failures to user-facing messages.
 */
function handleGitHubError(error, owner, repo) {
  // No response usually means DNS / offline / timeout.
  if (!error.response) {
    throw createAppError(
      'Unable to reach the GitHub API. Check your network connection and try again.',
      503,
      'NETWORK_FAILURE',
    )
  }

  const { status, headers, data } = error.response
  const githubMessage = data?.message || ''

  // Rate limit: GitHub uses 403 (remaining=0) or 429.
  const remaining = headers?.['x-ratelimit-remaining']
  const isRateLimited =
    status === 429 ||
    (status === 403 && (remaining === '0' || /rate limit/i.test(githubMessage)))

  if (isRateLimited) {
    throw createAppError(
      'GitHub API rate limit exceeded. Please wait and try again later.',
      429,
      'RATE_LIMIT',
    )
  }

  if (status === 404) {
    throw createAppError(
      `Repository not found: ${owner}/${repo}. Check the URL or whether the repo is private.`,
      404,
      'REPO_NOT_FOUND',
    )
  }

  if (status === 401) {
    throw createAppError(
      'GitHub rejected the access token. Verify GITHUB_TOKEN in your .env file.',
      401,
      'INVALID_TOKEN',
    )
  }

  throw createAppError(
    `GitHub API error (${status}): ${githubMessage || 'Unexpected response from GitHub.'}`,
    status >= 400 && status < 600 ? status : 502,
    'GITHUB_API_ERROR',
  )
}

/**
 * Fetch core repository metadata and return a clean internal object.
 * No frontend formatting — only structured raw fields the product needs.
 */
export async function getRepositoryData(owner, repo) {
  const client = createGitHubClient()

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}`)

    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      owner: {
        login: data.owner?.login ?? null,
        id: data.owner?.id ?? null,
        avatarUrl: data.owner?.avatar_url ?? null,
        profileUrl: data.owner?.html_url ?? null,
        type: data.owner?.type ?? null,
      },
      description: data.description,
      htmlUrl: data.html_url,
      homepage: data.homepage,
      stars: data.stargazers_count,
      forks: data.forks_count,
      watchers: data.subscribers_count ?? data.watchers_count,
      openIssues: data.open_issues_count,
      language: data.language,
      topics: data.topics ?? [],
      license: data.license
        ? {
            key: data.license.key,
            name: data.license.name,
            spdxId: data.license.spdx_id,
          }
        : null,
      defaultBranch: data.default_branch,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      pushedAt: data.pushed_at,
      size: data.size,
      isPrivate: data.private,
      isFork: data.fork,
      hasIssues: data.has_issues,
      visibility: data.visibility,
    }
  } catch (error) {
    // Re-throw AppErrors we already created; map Axios failures otherwise.
    if (error.statusCode) throw error
    handleGitHubError(error, owner, repo)
  }
}

/**
 * Fetch top contributors for a repository.
 * Returns login, contribution count, avatar, and profile URL.
 */
export async function getContributors(owner, repo, { perPage = 10 } = {}) {
  const client = createGitHubClient()

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}/contributors`, {
      params: { per_page: perPage },
    })

    // GitHub may return an empty array for empty/new repos.
    if (!Array.isArray(data)) {
      return []
    }

    return data.map((contributor) => ({
      login: contributor.login,
      contributions: contributor.contributions,
      avatarUrl: contributor.avatar_url,
      profileUrl: contributor.html_url,
      type: contributor.type,
    }))
  } catch (error) {
    if (error.statusCode) throw error
    // Some repos disable the contributors list (204 / empty). Treat as empty.
    if (error.response?.status === 204) {
      return []
    }
    handleGitHubError(error, owner, repo)
  }
}

/**
 * Fetch language byte counts and convert them to percentages.
 * Example output: [{ language: "JavaScript", bytes: 1200, percentage: 80.0 }, ...]
 */
export async function getLanguages(owner, repo) {
  const client = createGitHubClient()

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}/languages`)

    const entries = Object.entries(data || {})
    const totalBytes = entries.reduce((sum, [, bytes]) => sum + bytes, 0)

    if (totalBytes === 0) {
      return []
    }

    return entries
      .map(([language, bytes]) => ({
        language,
        bytes,
        // One decimal place keeps the UI readable without fake precision.
        percentage: Number(((bytes / totalBytes) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.bytes - a.bytes)
  } catch (error) {
    if (error.statusCode) throw error
    handleGitHubError(error, owner, repo)
  }
}

/**
 * Convenience orchestrator used by the controller.
 * Fetches repository + contributors + languages in parallel for speed.
 */
export async function fetchRepositoryBundle(owner, repo) {
  const [repository, contributors, languages] = await Promise.all([
    getRepositoryData(owner, repo),
    getContributors(owner, repo),
    getLanguages(owner, repo),
  ])

  return {
    repository,
    contributors,
    languages,
  }
}
