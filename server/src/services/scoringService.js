/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Scoring is pure business logic: numbers in, scores out.
 * Keeping it separate from GitHub fetching and AI writing means we can
 * unit-test scoring without network calls.
 */

/**
 * Compute repository health / activity scores (PLACEHOLDER).
 * TODO: Accept normalized repository + activity data.
 * TODO: Apply transparent scoring rules (stars, recency, issues, etc.).
 * TODO: Return a small score object the controller can send to the client.
 */
export async function calculateRepositoryScores(_repositoryData) {
  // TODO: Implement scoring rules in a later milestone.
  throw new Error('scoringService.calculateRepositoryScores is not implemented yet')
}
