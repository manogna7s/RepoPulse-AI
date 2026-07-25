/**
 * WHY THIS FILE EXISTS
 * --------------------
 * AI calls are slow, paid, and vendor-specific (Gemini today).
 * Isolating them in aiService means the rest of the app does not care
 * whether we use Gemini, another model, or a mock in tests.
 */

/**
 * Generate an AI summary for a repository analysis (PLACEHOLDER).
 * TODO: Accept scored repository data as prompt context.
 * TODO: Call Google Gemini 2.5 Pro with a clear, versioned prompt.
 * TODO: Validate and return only the fields the UI needs.
 * TODO: Handle rate limits and API failures with useful errors.
 */
export async function generateRepositoryInsight(_analysisInput) {
  // TODO: Implement Gemini integration in a later milestone.
  throw new Error('aiService.generateRepositoryInsight is not implemented yet')
}
