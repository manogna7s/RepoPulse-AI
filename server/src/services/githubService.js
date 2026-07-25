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
      archived: data.archived,
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
 * Fetch README markdown (decoded). Returns null when the repo has no README.
 * Needed by documentation scoring — fetching stays here, scoring stays in scoringService.
 */
export async function getReadme(owner, repo) {
  const client = createGitHubClient()

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}/readme`)
    const encoding = data.encoding || 'base64'
    const content =
      encoding === 'base64'
        ? Buffer.from(data.content || '', 'base64').toString('utf8')
        : String(data.content || '')

    return {
      name: data.name,
      path: data.path,
      size: data.size,
      content,
    }
  } catch (error) {
    if (error.statusCode) throw error
    // 404 means "no README" — that is valid input for documentation scoring.
    if (error.response?.status === 404) {
      return null
    }
    handleGitHubError(error, owner, repo)
  }
}

/**
 * List root-level files/folders so dependency scoring can detect manifests
 * like package.json or requirements.txt without cloning the repo.
 */
export async function getRootContents(owner, repo) {
  const client = createGitHubClient()

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}/contents/`)
    if (!Array.isArray(data)) {
      return []
    }

    return data.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      size: item.size ?? 0,
    }))
  } catch (error) {
    if (error.statusCode) throw error
    if (error.response?.status === 404) {
      return []
    }
    handleGitHubError(error, owner, repo)
  }
}

/**
 * Fetch recent commits for activity scoring (date of newest + rough frequency).
 */
export async function getRecentCommits(owner, repo, { perPage = 30 } = {}) {
  const client = createGitHubClient()

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}/commits`, {
      params: { per_page: perPage },
    })

    if (!Array.isArray(data)) {
      return []
    }

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.commit?.message ?? '',
      date: commit.commit?.author?.date || commit.commit?.committer?.date || null,
      authorLogin: commit.author?.login ?? commit.commit?.author?.name ?? null,
    }))
  } catch (error) {
    if (error.statusCode) throw error
    // Empty / blocked commit lists should not crash analysis.
    if (error.response?.status === 409 || error.response?.status === 404) {
      return []
    }
    handleGitHubError(error, owner, repo)
  }
}

/**
 * Fetch recent releases for community + activity scoring.
 */
export async function getReleases(owner, repo, { perPage = 10 } = {}) {
  const client = createGitHubClient()

  try {
    const { data } = await client.get(`/repos/${owner}/${repo}/releases`, {
      params: { per_page: perPage },
    })

    if (!Array.isArray(data)) {
      return []
    }

    return data.map((release) => ({
      id: release.id,
      tagName: release.tag_name,
      name: release.name,
      draft: release.draft,
      prerelease: release.prerelease,
      createdAt: release.created_at,
      publishedAt: release.published_at,
    }))
  } catch (error) {
    if (error.statusCode) throw error
    if (error.response?.status === 404) {
      return []
    }
    handleGitHubError(error, owner, repo)
  }
}

/**
 * Convenience orchestrator used by the controller.
 * Fetches everything scoring needs in parallel for speed.
 */
export async function fetchRepositoryBundle(owner, repo) {
  const [repository, contributors, languages, readme, rootContents, commits, releases] =
    await Promise.all([
      getRepositoryData(owner, repo),
      // More contributors improves community heuristics (GitHub max page size is 100).
      getContributors(owner, repo, { perPage: 100 }),
      getLanguages(owner, repo),
      getReadme(owner, repo),
      getRootContents(owner, repo),
      getRecentCommits(owner, repo),
      getReleases(owner, repo),
    ])

  return {
    repository,
    contributors,
    languages,
    readme,
    rootContents,
    commits,
    releases,
  }
}
