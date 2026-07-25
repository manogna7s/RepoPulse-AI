/**
 * WHY THIS FILE EXISTS
 * --------------------
 * External API clients belong in the service layer — not in controllers.
 * Later this module will talk to the GitHub REST API (and maybe GraphQL).
 *
 * Controllers will call these functions; they will never call GitHub directly.
 */

/**
 * Fetch public repository metadata from GitHub (PLACEHOLDER).
 * TODO: Accept owner and repo name.
 * TODO: Call GitHub REST API with axios / fetch.
 * TODO: Normalize the response into a clean internal shape.
 * TODO: Throw a clear error when the repository is private or missing.
 */
export async function fetchRepositoryMetadata(_owner, _repo) {
  // TODO: Implement GitHub REST API integration in a later milestone.
  throw new Error('githubService.fetchRepositoryMetadata is not implemented yet')
}

/**
 * Fetch recent repository activity signals (PLACEHOLDER).
 * TODO: Pull commits, issues, pull requests, and contributors as needed.
 */
export async function fetchRepositoryActivity(_owner, _repo) {
  // TODO: Implement activity aggregation later.
  throw new Error('githubService.fetchRepositoryActivity is not implemented yet')
}
