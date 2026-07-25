/**
 * WHY THIS FILE EXISTS
 * --------------------
 * Technical Debt Predictor — deterministic heuristics only (no AI / ML).
 * GitHub I/O stays in githubService.js. Scoring / filtering / ranking live here
 * so controllers stay thin and unit tests do not need the network.
 */

import {
  createGitHubAnalysisContext,
  getCommitHistoryForFile,
  getFileContent,
  getRepositoryTree,
  mapWithConcurrency,
} from './githubService.js'

// Hard limits protect the GitHub hourly rate limit during one analysis.
const MAX_IMPORTANT_FILES = 30
const MAX_CONTENT_CONCURRENCY = 10
const MAX_COMMIT_CONCURRENCY = 20
const TOP_DEBT_FILES = 10

/** Source extensions we treat as "engineerable" code for debt scanning. */
const IMPORTANT_EXTENSIONS = new Set([
  'js',
  'ts',
  'jsx',
  'tsx',
  'java',
  'cpp',
  'c',
  'cs',
  'py',
  'go',
  'php',
  'rb',
  'kt',
  'swift',
  'rs',
])

/** Path fragments that are generated, vendored, or non-source noise. */
const IGNORED_PATH_PARTS = [
  'node_modules/',
  '/dist/',
  '/build/',
  '/coverage/',
  '/.git/',
  '/vendor/',
  '/.next/',
  '/out/',
]

const IGNORED_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'ico',
  'mp4',
  'mov',
  'webm',
  'mp3',
  'wav',
  'woff',
  'woff2',
  'ttf',
  'otf',
  'eot',
  'pdf',
  'zip',
  'gz',
  'map',
])

function round1(value) {
  return Number(Number(value).toFixed(1))
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function daysSince(isoDate) {
  if (!isoDate) return Number.POSITIVE_INFINITY
  const then = new Date(isoDate).getTime()
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY
  return (Date.now() - then) / (1000 * 60 * 60 * 24)
}

function countMatches(content, pattern) {
  if (!content) return 0
  const matches = content.match(pattern)
  return matches ? matches.length : 0
}

// ---------------------------------------------------------------------------
// STEP 3 — Important File Filtering
// ---------------------------------------------------------------------------
//
// WHY IGNORE GENERATED ASSETS?
// node_modules, dist/, lockfiles, images, and fonts are not authored the same
// way as application code. Counting them would inflate "debt" with noise that
// engineers do not refactor by hand. We focus on source files humans maintain.
//
// Markdown: we keep README only (product docs signal), skip other .md noise.

/**
 * Keep only human-maintained source files that matter for debt heuristics.
 */
export function filterImportantFiles(files = []) {
  return (files || []).filter((file) => {
    const path = (file.path || '').replace(/\\/g, '/')
    const lowerPath = path.toLowerCase()
    const fileName = (file.fileName || path.split('/').pop() || '').toLowerCase()
    const extension = (file.fileExtension || '').toLowerCase()

    if (!path || path.endsWith('/')) return false

    // Ignore known generated / vendored directories.
    if (IGNORED_PATH_PARTS.some((part) => lowerPath.includes(part))) return false
    if (lowerPath.startsWith('dist/') || lowerPath.startsWith('build/') || lowerPath.startsWith('coverage/')) {
      return false
    }

    // Ignore lockfiles (auto-generated dependency graphs).
    if (fileName.endsWith('.lock') || fileName === 'package-lock.json' || fileName === 'yarn.lock' || fileName === 'pnpm-lock.yaml') {
      return false
    }

    // Ignore binary / media / font assets.
    if (IGNORED_EXTENSIONS.has(extension)) return false

    // Markdown: keep README only.
    if (extension === 'md' || extension === 'markdown') {
      return /^readme(\.md|\.markdown)?$/i.test(fileName)
    }

    return IMPORTANT_EXTENSIONS.has(extension)
  })
}

// ---------------------------------------------------------------------------
// STEP 4 — TODO / FIXME Scanner
// ---------------------------------------------------------------------------
//
// WHY THESE COMMENTS INCREASE RISK
// TODO/FIXME/HACK/BUG/XXX are explicit "we know this is unfinished or fragile"
// markers left by authors. A cluster of them usually means deferred cleanup —
// classic technical debt that future maintainers must pay.

/**
 * Count debt-marker comments inside a file's text content.
 */
export function scanDebtMarkers(content = '') {
  const todoCount = countMatches(content, /\bTODO\b/g)
  const fixmeCount = countMatches(content, /\bFIXME\b/g)
  const hackCount = countMatches(content, /\bHACK\b/g)
  const bugCount = countMatches(content, /\bBUG\b/g)
  const xxxCount = countMatches(content, /\bXXX\b/g)

  return {
    todoCount,
    fixmeCount,
    hackCount,
    bugCount,
    xxxCount,
    totalMarkers: todoCount + fixmeCount + hackCount + bugCount + xxxCount,
  }
}

// ---------------------------------------------------------------------------
// STEP 5 — File Size Risk
// ---------------------------------------------------------------------------
//
// WHY LARGE FILES ARE HARDER TO MAINTAIN
// Cognitive load grows with size. A 1,000-line module is harder to test,
// review, and safely change than several small focused modules.
//
// Heuristic buckets (by estimated line count):
//   <150        Low
//   150–400     Medium
//   400–800     High
//   800+        Very High

/**
 * Estimate line-count risk for one file from its text content.
 */
export function calculateFileSizeRisk(file = {}) {
  const content = file.content || ''
  const lineCount =
    typeof file.lineCount === 'number'
      ? file.lineCount
      : content.length === 0
        ? 0
        : content.split(/\r?\n/).length

  let riskLevel = 'Low'
  let sizeScore = 10

  if (lineCount >= 800) {
    riskLevel = 'Very High'
    sizeScore = 100
  } else if (lineCount >= 400) {
    riskLevel = 'High'
    sizeScore = 75
  } else if (lineCount >= 150) {
    riskLevel = 'Medium'
    sizeScore = 45
  } else if (lineCount > 0) {
    riskLevel = 'Low'
    sizeScore = 15
  } else {
    riskLevel = 'Low'
    sizeScore = 5
  }

  return {
    lineCount,
    riskLevel,
    sizeScore,
  }
}

// ---------------------------------------------------------------------------
// Change-frequency + contributor helpers (from commit history)
// ---------------------------------------------------------------------------

/**
 * Derive churn signals from commits that touched a file.
 *
 * WHY FREQUENT EDITS → DEBT RISK
 * Files that change constantly are hotspots: more merge conflicts, more
 * partial refactors, and more chances for shortcuts to accumulate.
 */
export function summarizeCommitChurn(commits = []) {
  const list = Array.isArray(commits) ? commits : []
  const commitCount = list.length
  const latestModification = list[0]?.date || null
  const uniqueContributors = new Set(
    list.map((commit) => commit.authorLogin).filter(Boolean),
  ).size

  // changeFrequency: commits per week across the sampled history window.
  let changeFrequency = 0
  if (commitCount >= 2) {
    const newest = daysSince(list[0]?.date)
    const oldest = daysSince(list[list.length - 1]?.date)
    const spanDays = Math.max(oldest - newest, 1)
    changeFrequency = round1((commitCount / spanDays) * 7)
  } else if (commitCount === 1) {
    changeFrequency = 0.2
  }

  const oldestCommitDate = list[list.length - 1]?.date || null
  const fileAgeDays = Number.isFinite(daysSince(oldestCommitDate))
    ? round1(daysSince(oldestCommitDate))
    : null

  return {
    commitCount,
    latestModification,
    uniqueContributors,
    changeFrequency,
    fileAgeDays,
    oldestCommitDate,
  }
}

function scoreCommitFrequency(changeFrequency, commitCount) {
  if (commitCount >= 20 || changeFrequency >= 5) return 100
  if (commitCount >= 10 || changeFrequency >= 2) return 75
  if (commitCount >= 5 || changeFrequency >= 0.5) return 50
  if (commitCount >= 2) return 25
  if (commitCount === 1) return 10
  return 0
}

function scoreMarkerDensity(totalMarkers, lineCount) {
  if (totalMarkers <= 0) return 0
  const density = lineCount > 0 ? totalMarkers / lineCount : totalMarkers
  if (totalMarkers >= 15 || density >= 0.05) return 100
  if (totalMarkers >= 8 || density >= 0.02) return 75
  if (totalMarkers >= 3) return 50
  if (totalMarkers >= 1) return 25
  return 0
}

function scoreUniqueContributors(count) {
  if (count >= 10) return 100
  if (count >= 6) return 75
  if (count >= 3) return 50
  if (count === 2) return 30
  if (count === 1) return 10
  return 0
}

function scoreFileAge(fileAgeDays) {
  if (fileAgeDays == null || !Number.isFinite(fileAgeDays)) return 20
  if (fileAgeDays >= 365 * 3) return 100
  if (fileAgeDays >= 365) return 70
  if (fileAgeDays >= 180) return 45
  if (fileAgeDays >= 30) return 25
  return 10
}

function riskLevelFromScore(debtScore) {
  if (debtScore >= 81) return 'Critical'
  if (debtScore >= 61) return 'High'
  if (debtScore >= 31) return 'Medium'
  return 'Low'
}

// ---------------------------------------------------------------------------
// STEP 7 — Technical Debt Score (per file)
// ---------------------------------------------------------------------------
//
// Weighted combination (sums to 100%):
//   File Size .............. 30%
//   TODO/FIXME markers ..... 20%
//   Commit Frequency ....... 20%
//   Unique Contributors .... 15%
//   File Age ............... 15%

/**
 * Combine file metrics into one debtScore with explainable reasons.
 */
export function calculateTechnicalDebt(fileMetrics = {}) {
  const {
    file,
    lineCount = 0,
    sizeScore = 0,
    sizeRiskLevel = 'Low',
    markers = {},
    commitCount = 0,
    changeFrequency = 0,
    uniqueContributors = 0,
    fileAgeDays = null,
    latestModification = null,
  } = fileMetrics

  const markerScore = scoreMarkerDensity(markers.totalMarkers || 0, lineCount)
  const frequencyScore = scoreCommitFrequency(changeFrequency, commitCount)
  const contributorScore = scoreUniqueContributors(uniqueContributors)
  const ageScore = scoreFileAge(fileAgeDays)

  const debtScore = round1(
    clamp(
      sizeScore * 0.3 +
        markerScore * 0.2 +
        frequencyScore * 0.2 +
        contributorScore * 0.15 +
        ageScore * 0.15,
      0,
      100,
    ),
  )

  const riskLevel = riskLevelFromScore(debtScore)
  const reasons = []

  reasons.push(`File size risk is ${sizeRiskLevel} (~${lineCount} lines)`)
  if ((markers.totalMarkers || 0) > 0) {
    reasons.push(
      `Found ${markers.todoCount || 0} TODO, ${markers.fixmeCount || 0} FIXME, ${markers.hackCount || 0} HACK markers`,
    )
  } else {
    reasons.push('No TODO/FIXME/HACK markers detected')
  }
  reasons.push(`${commitCount} recent commits touch this file (freq ~${changeFrequency}/week)`)
  reasons.push(`${uniqueContributors} unique contributor(s) in recent history`)
  if (fileAgeDays != null) {
    reasons.push(`Sampled file history spans ~${Math.round(fileAgeDays)} days`)
  }
  if (latestModification) {
    reasons.push(`Last touched ~${Math.round(daysSince(latestModification))} days ago`)
  }

  return {
    file,
    debtScore,
    riskLevel,
    breakdown: {
      sizeScore,
      markerScore,
      frequencyScore,
      contributorScore,
      ageScore,
      weights: {
        fileSize: 0.3,
        todoFixme: 0.2,
        commitFrequency: 0.2,
        uniqueContributors: 0.15,
        fileAge: 0.15,
      },
      lineCount,
      markers,
      commitCount,
      changeFrequency,
      uniqueContributors,
      fileAgeDays,
      latestModification,
    },
    reasons,
  }
}

// ---------------------------------------------------------------------------
// STEP 8 — Ranking
// ---------------------------------------------------------------------------

/**
 * Sort by debtScore descending and keep the top N riskiest files.
 */
export function rankTechnicalDebt(fileDebts = [], limit = TOP_DEBT_FILES) {
  return [...fileDebts]
    .sort((a, b) => b.debtScore - a.debtScore)
    .slice(0, limit)
    .map((item) => ({
      file: item.file,
      debtScore: item.debtScore,
      riskLevel: item.riskLevel,
      breakdown: item.breakdown,
      reasons: item.reasons,
    }))
}

/**
 * Orchestrate the full Technical Debt Predictor for one repository.
 *
 * Performance guards (STEP 10):
 *   - scan at most 30 important files (largest first — likelier hotspots)
 *   - cap content fetches and commit-history fetches with concurrency limits
 *   - reuse one cached GitHub context for the whole analysis
 */
export async function analyzeTechnicalDebt(owner, repo, { defaultBranch } = {}) {
  const context = createGitHubAnalysisContext()

  const tree = await getRepositoryTree(owner, repo, {
    branch: defaultBranch,
    context,
  })

  const important = filterImportantFiles(tree.files || [])

  // Prefer larger files first — size is a strong debt prior and keeps the
  // 30-file budget focused on likely hotspots instead of tiny utilities.
  const candidates = [...important]
    .sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0))
    .slice(0, MAX_IMPORTANT_FILES)

  // Fetch file contents (bounded concurrency).
  const withContent = await mapWithConcurrency(
    candidates,
    MAX_CONTENT_CONCURRENCY,
    async (file) => {
      const contentResult = await getFileContent(owner, repo, file.path, {
        context,
        ref: defaultBranch,
      })
      return {
        ...file,
        content: contentResult.content || '',
        skipped: Boolean(contentResult.skipped),
      }
    },
  )

  // Fetch per-file commit history (max 20 concurrent — STEP 10).
  const withCommits = await mapWithConcurrency(
    withContent,
    MAX_COMMIT_CONCURRENCY,
    async (file) => {
      const commits = await getCommitHistoryForFile(owner, repo, file.path, {
        context,
        perPage: 30,
      })
      return { ...file, commits }
    },
  )

  const fileDebts = withCommits.map((file) => {
    const markers = scanDebtMarkers(file.content)
    const sizeRisk = calculateFileSizeRisk(file)
    const churn = summarizeCommitChurn(file.commits)

    return calculateTechnicalDebt({
      file: file.path,
      lineCount: sizeRisk.lineCount,
      sizeScore: sizeRisk.sizeScore,
      sizeRiskLevel: sizeRisk.riskLevel,
      markers,
      commitCount: churn.commitCount,
      changeFrequency: churn.changeFrequency,
      uniqueContributors: churn.uniqueContributors,
      fileAgeDays: churn.fileAgeDays,
      latestModification: churn.latestModification,
    })
  })

  const technicalDebt = rankTechnicalDebt(fileDebts, TOP_DEBT_FILES)

  return {
    technicalDebt,
    meta: {
      treeTruncated: Boolean(tree.truncated),
      totalFilesInTree: (tree.files || []).length,
      importantFilesFound: important.length,
      filesScanned: candidates.length,
      limits: {
        maxImportantFiles: MAX_IMPORTANT_FILES,
        maxCommitConcurrency: MAX_COMMIT_CONCURRENCY,
        topResults: TOP_DEBT_FILES,
      },
    },
  }
}
