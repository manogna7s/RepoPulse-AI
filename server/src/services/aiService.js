/**
 * WHY THIS FILE EXISTS
 * --------------------
 * AI calls are slow, paid, and vendor-specific (Gemini today).
 * Isolating them here means controllers never talk to Google directly, and
 * heuristic scores stay independent of the LLM.
 *
 * WHY GEMINI EXPLAINS INSTEAD OF SCORING
 * -------------------------------------
 * Our Engineering Intelligence Engine already produces deterministic numbers.
 * Gemini should NOT recalculate scores — that would make results non-reproducible.
 * Instead we send compact structured metrics and ask for human-readable insights.
 *
 * WHY NOT RAW REPOSITORY CODE
 * ---------------------------
 * Sending full source would leak private IP, burn tokens, and overwhelm the model.
 * Metrics + top debt files are enough for useful executive guidance.
 */

import { GoogleGenAI } from '@google/genai'
import env from '../config/env.js'

const UNAVAILABLE = {
  available: false,
  message: 'AI insights unavailable.',
  executiveSummary: 'AI insights unavailable.',
  strengths: [],
  weaknesses: [],
  recommendations: [],
  futureRisks: [],
  productionReadiness: 'AI insights unavailable.',
}

/**
 * Build a compact prompt payload — never the full repository contents.
 */
function buildInsightPayload({ repository, scores, engineeringHealth, technicalDebt }) {
  return {
    repository: {
      fullName: repository?.fullName || `${repository?.owner?.login}/${repository?.name}`,
      description: repository?.description || null,
      language: repository?.language || null,
      stars: repository?.stars ?? 0,
      forks: repository?.forks ?? 0,
      openIssues: repository?.openIssues ?? 0,
      topics: (repository?.topics || []).slice(0, 8),
      license: repository?.license?.spdxId || null,
      homepage: repository?.homepage || null,
      topLanguages: (repository?.languages || []).slice(0, 5),
    },
    engineeringHealth: {
      overallScore: engineeringHealth?.overallScore,
      grade: engineeringHealth?.grade,
      category: engineeringHealth?.category,
    },
    scores: {
      documentation: {
        score: scores?.documentation?.score,
        reasons: (scores?.documentation?.reasons || []).slice(0, 4),
      },
      community: {
        score: scores?.community?.score,
        reasons: (scores?.community?.reasons || []).slice(0, 4),
      },
      activity: {
        score: scores?.activity?.score,
        reasons: (scores?.activity?.reasons || []).slice(0, 4),
      },
      dependency: {
        score: scores?.dependency?.score,
        reasons: (scores?.dependency?.reasons || []).slice(0, 4),
      },
      metadata: {
        score: scores?.metadata?.score,
        reasons: (scores?.metadata?.reasons || []).slice(0, 4),
      },
    },
    technicalDebtTop: (technicalDebt || []).slice(0, 5).map((item) => ({
      file: item.file,
      debtScore: item.debtScore,
      riskLevel: item.riskLevel,
      reasons: (item.reasons || []).slice(0, 2),
    })),
  }
}

function buildPrompt(payload) {
  // Deterministic instructions: same metrics → similar structured JSON shape.
  return `You are RepoPulse AI, an engineering advisor for engineering managers.
You receive structured repository metrics. Do NOT invent scores. Do NOT recalculate scores.
Explain the metrics and recommend practical next steps.

Return ONLY valid JSON with this exact shape:
{
  "executiveSummary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "recommendations": ["string"],
  "futureRisks": ["string"],
  "productionReadiness": "string"
}

Rules:
- Keep each list to 3-5 concise bullet strings.
- productionReadiness should be 1-3 sentences about launch readiness.
- Be specific to the provided metrics and debt hotspots.
- Do not mention that you are an AI model.

METRICS JSON:
${JSON.stringify(payload)}`
}

function parseInsightsJson(text) {
  if (!text) return null

  // Models sometimes wrap JSON in ```json fences — strip them safely.
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  try {
    return JSON.parse(cleaned)
  } catch {
    // Last resort: extract the first {...} block.
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1))
      } catch {
        return null
      }
    }
    return null
  }
}

function normalizeInsights(parsed) {
  if (!parsed || typeof parsed !== 'object') return null

  const asList = (value) =>
    Array.isArray(value) ? value.map((item) => String(item)).filter(Boolean).slice(0, 6) : []

  return {
    available: true,
    message: 'AI insights generated',
    executiveSummary: String(parsed.executiveSummary || '').trim() || 'No summary provided.',
    strengths: asList(parsed.strengths),
    weaknesses: asList(parsed.weaknesses),
    recommendations: asList(parsed.recommendations),
    futureRisks: asList(parsed.futureRisks),
    productionReadiness:
      String(parsed.productionReadiness || '').trim() || 'No production readiness notes provided.',
  }
}

/**
 * Ask Gemini to explain structured RepoPulse metrics.
 * Never throws to callers — returns a safe unavailable object on failure.
 */
export async function generateRepositoryInsights(analysisInput) {
  if (!env.geminiApiKey || /your_gemini|changeme|placeholder/i.test(env.geminiApiKey)) {
    console.warn('Gemini: GEMINI_API_KEY missing or still a placeholder — skipping AI insights')
    return { ...UNAVAILABLE }
  }

  try {
    const payload = buildInsightPayload(analysisInput)
    const ai = new GoogleGenAI({ apiKey: env.geminiApiKey })

    const response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: buildPrompt(payload),
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    })

    const text = response?.text || ''
    const normalized = normalizeInsights(parseInsightsJson(text))

    if (!normalized) {
      console.warn('Gemini: could not parse structured insights JSON')
      return { ...UNAVAILABLE }
    }

    return normalized
  } catch (error) {
    console.warn(`Gemini: insights unavailable — ${error.message}`)
    return { ...UNAVAILABLE }
  }
}

// Backward-compatible alias used by older placeholders.
export async function generateRepositoryInsight(analysisInput) {
  return generateRepositoryInsights(analysisInput)
}
