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
 * Create a per-analysis GitHub context with request caching.
 *
 * WHY CACHE?
 * During one analysis we may ask for the same tree/file twice.
 * Caching inside a single run avoids duplicate rate-limit spend.
 * The cache is NOT shared across HTTP requests (keeps data fresh).
 */
export function createGitHubAnalysisContext() {
  const client = createGitHubClient()
  const cache = new Map()

  return {
    client,
    async get(path, config = {}) {
      const key = `${path}::${JSON.stringify(config.params || {})}`
      if (cache.has(key)) {
        return cache.get(key)
      }

      const pending = client
        .get(path, config)
        .then((response) => response.data)
        .catch((error) => {
          // Do not poison the cache with a failed promise forever for this key.
          cache.delete(key)
          throw error
        })

      cache.set(key, pending)
      return pending
    },
  }
}

/**
 * Run async work over a list with a hard concurrency cap.
 *
 * WHY?
 * Unlimited Promise.all on hundreds of GitHub calls can burn the hourly
 * rate limit in seconds and overwhelm both our server and GitHub.
 */
export async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex
      nextIndex += 1
      results[current] = await mapper(items[current], current)
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length || 1))
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

/**
 * STEP 2 — Repository File Scanner
 * --------------------------------
 * GitHub Trees API:
 *   GET /repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=1
 *
 * The tree_sha is usually the commit SHA of the default branch tip.
 * With recursive=1 GitHub flattens the whole repo into one list of blobs/trees.
 * We keep only blobs (files). Folders are type === "tree" and are ignored.
 *
 * Note: very large repos may return truncated:true. We still score what we get.
 */
export async function getRepositoryTree(owner, repo, { branch, context } = {}) {
  const ctx = context || createGitHubAnalysisContext()

  try {
    // Resolve branch → commit SHA so the tree matches the branch tip.
    const branchName = branch || 'main'
    let treeSha = branchName

    try {
      const branchData = await ctx.get(`/repos/${owner}/${repo}/branches/${encodeURIComponent(branchName)}`)
      treeSha = branchData.commit?.sha || branchName
    } catch {
      // Fall back to using the branch name directly if the branch lookup fails.
      treeSha = branchName
    }

    const treeData = await ctx.get(`/repos/${owner}/${repo}/git/trees/${treeSha}`, {
      params: { recursive: 1 },
    })

    const entries = Array.isArray(treeData.tree) ? treeData.tree : []

    const files = entries
      // Ignore folders — only files ("blob") matter for debt scanning.
      .filter((entry) => entry.type === 'blob')
      .map((entry) => {
        const path = entry.path || ''
        const parts = path.split('/')
        const fileName = parts[parts.length - 1] || path
        const dot = fileName.lastIndexOf('.')
        const extension = dot > 0 ? fileName.slice(dot + 1).toLowerCase() : ''

        return {
          path,
          fileName,
          fileSize: entry.size ?? 0,
          fileExtension: extension,
          sha: entry.sha,
        }
      })

    return {
      files,
      truncated: Boolean(treeData.truncated),
      treeSha,
    }
  } catch (error) {
    if (error.statusCode) throw error
    handleGitHubError(error, owner, repo)
  }
}

/**
 * Fetch one file's text content via the Contents API.
 * GET /repos/{owner}/{repo}/contents/{path}
 */
export async function getFileContent(owner, repo, path, { context, ref } = {}) {
  const ctx = context || createGitHubAnalysisContext()

  try {
    const data = await ctx.get(
      `/repos/${owner}/${repo}/contents/${path
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/')}`,
      { params: ref ? { ref } : undefined },
    )

    // Directories accidentally requested would return an array — skip them.
    if (Array.isArray(data) || !data.content) {
      return { path, content: '', size: 0, encoding: null }
    }

    const encoding = data.encoding || 'base64'
    const content =
      encoding === 'base64'
        ? Buffer.from(data.content || '', 'base64').toString('utf8')
        : String(data.content || '')

    return {
      path: data.path || path,
      content,
      size: data.size ?? content.length,
      encoding,
      sha: data.sha,
    }
  } catch (error) {
    if (error.statusCode) throw error
    if (error.response?.status === 404) {
      return { path, content: '', size: 0, encoding: null }
    }
    // Files larger than ~1MB are not returned by Contents API as base64.
    if (error.response?.status === 403) {
      return { path, content: '', size: 0, encoding: null, skipped: true }
    }
    handleGitHubError(error, owner, repo)
  }
}

/**
 * STEP 6 — Commit history for a single file path.
 * GET /repos/{owner}/{repo}/commits?path={path}
 *
 * Returns recent commits touching that file so we can estimate churn.
 */
export async function getCommitHistoryForFile(owner, repo, path, { context, perPage = 30 } = {}) {
  const ctx = context || createGitHubAnalysisContext()

  try {
    const data = await ctx.get(`/repos/${owner}/${repo}/commits`, {
      params: { path, per_page: perPage },
    })

    if (!Array.isArray(data)) {
      return []
    }

    return data.map((commit) => ({
      sha: commit.sha,
      date: commit.commit?.author?.date || commit.commit?.committer?.date || null,
      authorLogin: commit.author?.login || commit.commit?.author?.name || null,
      message: commit.commit?.message || '',
    }))
  } catch (error) {
    if (error.statusCode) throw error
    if (error.response?.status === 409 || error.response?.status === 404) {
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
