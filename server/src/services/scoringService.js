/**
 * WHY THIS FILE EXISTS
 * --------------------
 * This is the Engineering Intelligence Engine.
 * Every score is a DETERMINISTIC HEURISTIC: fixed rules, no AI, no randomness.
 * Same GitHub input always produces the same score — easy to explain in interviews
 * and easy to unit-test without calling Gemini.
 *
 * Controllers must stay thin. All scoring business logic lives here.
 */

// ---------------------------------------------------------------------------
// Shared helpers (tiny, single-purpose)
// ---------------------------------------------------------------------------

/** Clamp a number into [min, max]. */
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/** Round to one decimal so API responses stay readable. */
function round1(value) {
  return Number(Number(value).toFixed(1))
}

/** Days between an ISO date string and now. Returns Infinity when date is missing. */
function daysSince(isoDate) {
  if (!isoDate) return Number.POSITIVE_INFINITY
  const then = new Date(isoDate).getTime()
  if (Number.isNaN(then)) return Number.POSITIVE_INFINITY
  return (Date.now() - then) / (1000 * 60 * 60 * 24)
}

/** Case-insensitive section / keyword detection inside README markdown. */
function readmeHas(content, patterns) {
  if (!content) return false
  return patterns.some((pattern) => pattern.test(content))
}

// ---------------------------------------------------------------------------
// STEP 2 — Documentation Score
// ---------------------------------------------------------------------------
//
// ALGORITHM (max 100)
// --------------------
// Docs quality is one of the strongest signals of engineering maturity.
// We do NOT use AI to "judge writing" — we look for concrete, checkable signals.
//
// Weights (documented so product + interviews stay transparent):
//   README exists ................ 25
//   README length ................ 15   (>= 1500 chars full; partial credit below)
//   Installation section ......... 12
//   Usage / Getting Started ...... 12
//   Contributing section ......... 10
//   License mentioned OR metadata  8
//   API documentation keywords ... 10
//   Screenshots / images .........  8
//                               ----
//                                100

/**
 * Score how well the repository documents itself for new contributors/users.
 */
export function calculateDocumentationScore({ repository, readme }) {
  const maxScore = 100
  const breakdown = {}
  const reasons = []
  let score = 0

  const content = readme?.content || ''
  const hasReadme = Boolean(readme && content.trim().length > 0)

  // --- README exists (25) ---
  if (hasReadme) {
    breakdown.readmeExists = 25
    score += 25
    reasons.push('README exists')
  } else {
    breakdown.readmeExists = 0
    reasons.push('No README found')
  }

  // --- README length (15) ---
  // Short READMEs rarely explain install/usage well; very long ones usually do.
  const length = content.trim().length
  if (!hasReadme) {
    breakdown.readmeLength = 0
  } else if (length >= 1500) {
    breakdown.readmeLength = 15
    score += 15
    reasons.push('README is detailed (1500+ characters)')
  } else if (length >= 500) {
    const partial = round1((length / 1500) * 15)
    breakdown.readmeLength = partial
    score += partial
    reasons.push('README has moderate length')
  } else {
    breakdown.readmeLength = 3
    score += 3
    reasons.push('README is very short')
  }

  // --- Installation section (12) ---
  const hasInstall = readmeHas(content, [
    /##+\s*install/i,
    /##+\s*getting started/i,
    /##+\s*setup/i,
    /\bnpm install\b/i,
    /\bpip install\b/i,
    /\byarn add\b/i,
  ])
  breakdown.installationSection = hasInstall ? 12 : 0
  if (hasInstall) {
    score += 12
    reasons.push('README contains installation guide')
  } else {
    reasons.push('No installation section detected')
  }

  // --- Usage section (12) ---
  const hasUsage = readmeHas(content, [
    /##+\s*usage/i,
    /##+\s*example/i,
    /##+\s*quick start/i,
    /##+\s*how to use/i,
  ])
  breakdown.usageSection = hasUsage ? 12 : 0
  if (hasUsage) {
    score += 12
    reasons.push('README contains usage / examples')
  } else {
    reasons.push('No usage section detected')
  }

  // --- Contributing section (10) ---
  const hasContributing = readmeHas(content, [
    /##+\s*contribut/i,
    /contributing\.md/i,
  ])
  breakdown.contributingSection = hasContributing ? 10 : 0
  if (hasContributing) {
    score += 10
    reasons.push('Contributing guidance found')
  } else {
    reasons.push('No contributing section detected')
  }

  // --- License signal (8) — README heading OR GitHub license metadata ---
  const hasLicenseHeading = readmeHas(content, [/##+\s*license/i])
  const hasLicenseMeta = Boolean(repository?.license)
  const hasLicense = hasLicenseHeading || hasLicenseMeta
  breakdown.licenseSection = hasLicense ? 8 : 0
  if (hasLicense) {
    score += 8
    reasons.push(hasLicenseMeta ? 'License exists' : 'License section found in README')
  } else {
    reasons.push('No license detected')
  }

  // --- API documentation keywords (10) ---
  const hasApiDocs = readmeHas(content, [
    /##+\s*api/i,
    /\bapi reference\b/i,
    /\bendpoints?\b/i,
    /\bswagger\b/i,
    /\bopenapi\b/i,
  ])
  breakdown.apiDocumentation = hasApiDocs ? 10 : 0
  if (hasApiDocs) {
    score += 10
    reasons.push('API documentation keywords found')
  } else {
    reasons.push('No API documentation')
  }

  // --- Screenshots / images (8) ---
  const hasImages = readmeHas(content, [
    /!\[[^\]]*]\([^)]+\)/,
    /<img\s/i,
    /\.png\)/i,
    /\.jpg\)/i,
    /\.gif\)/i,
    /\.webp\)/i,
  ])
  breakdown.screenshots = hasImages ? 8 : 0
  if (hasImages) {
    score += 8
    reasons.push('README includes screenshots or images')
  } else {
    reasons.push('Missing screenshots')
  }

  return {
    score: round1(clamp(score, 0, maxScore)),
    maxScore,
    breakdown,
    reasons,
  }
}

// ---------------------------------------------------------------------------
// STEP 3 — Community Health Score
// ---------------------------------------------------------------------------
//
// ALGORITHM (max 100)
// --------------------
// Healthy projects attract (and keep) people. Stars alone are NOT enough —
// we combine contributor count, topics, releases, size, and age.
//
// Weights:
//   Contributors .............. 25
//   Recent activity ........... 20   (based on pushedAt)
//   Issue signal .............. 15
//   Topics .................... 10
//   Release history ........... 15
//   Community size ............ 10   (stars + forks + watchers)
//   Repository age ............  5
//                             ----
//                              100

/**
 * Score community / collaboration health signals.
 */
export function calculateCommunityScore({ repository, contributors = [], releases = [] }) {
  const maxScore = 100
  const breakdown = {}
  const reasons = []
  let score = 0

  const contributorCount = Array.isArray(contributors) ? contributors.length : 0

  // --- Contributors (25) ---
  // More independent contributors usually means less bus-factor risk.
  if (contributorCount >= 21) {
    breakdown.contributors = 25
    score += 25
    reasons.push(`Strong contributor base (${contributorCount}+ listed)`)
  } else if (contributorCount >= 6) {
    breakdown.contributors = 18
    score += 18
    reasons.push(`Healthy number of contributors (${contributorCount})`)
  } else if (contributorCount >= 2) {
    breakdown.contributors = 12
    score += 12
    reasons.push(`A few contributors (${contributorCount})`)
  } else if (contributorCount === 1) {
    breakdown.contributors = 5
    score += 5
    reasons.push('Only one listed contributor (high bus factor)')
  } else {
    breakdown.contributors = 0
    reasons.push('No contributors listed')
  }

  // --- Recent activity (20) ---
  const daysSincePush = daysSince(repository?.pushedAt)
  if (daysSincePush <= 7) {
    breakdown.recentActivity = 20
    score += 20
    reasons.push('Pushed within the last week')
  } else if (daysSincePush <= 30) {
    breakdown.recentActivity = 15
    score += 15
    reasons.push('Pushed within the last month')
  } else if (daysSincePush <= 90) {
    breakdown.recentActivity = 8
    score += 8
    reasons.push('Pushed within the last 90 days')
  } else if (daysSincePush <= 365) {
    breakdown.recentActivity = 3
    score += 3
    reasons.push('Last push was many months ago')
  } else {
    breakdown.recentActivity = 0
    reasons.push('No meaningful recent push activity')
  }

  // --- Issue signal (15) ---
  // Issues enabled + a non-zero but not overwhelming open count suggests a living project.
  const openIssues = repository?.openIssues ?? 0
  if (!repository?.hasIssues) {
    breakdown.issueSignal = 4
    score += 4
    reasons.push('Issues are disabled')
  } else if (openIssues === 0) {
    breakdown.issueSignal = 8
    score += 8
    reasons.push('Issues enabled with zero open issues')
  } else if (openIssues <= 200) {
    breakdown.issueSignal = 15
    score += 15
    reasons.push(`Active issue tracker (${openIssues} open)`)
  } else if (openIssues <= 1000) {
    breakdown.issueSignal = 10
    score += 10
    reasons.push(`Large open issue backlog (${openIssues})`)
  } else {
    breakdown.issueSignal = 5
    score += 5
    reasons.push(`Very large open issue backlog (${openIssues})`)
  }

  // --- Topics (10) ---
  const topicCount = repository?.topics?.length ?? 0
  if (topicCount >= 3) {
    breakdown.topics = 10
    score += 10
    reasons.push(`Well-tagged with ${topicCount} topics`)
  } else if (topicCount >= 1) {
    breakdown.topics = 5
    score += 5
    reasons.push('Some repository topics present')
  } else {
    breakdown.topics = 0
    reasons.push('No repository topics')
  }

  // --- Release history (15) ---
  const releaseCount = Array.isArray(releases) ? releases.length : 0
  if (releaseCount >= 5) {
    breakdown.releaseHistory = 15
    score += 15
    reasons.push(`Strong release history (${releaseCount} recent releases)`)
  } else if (releaseCount >= 1) {
    breakdown.releaseHistory = 9
    score += 9
    reasons.push(`Has published releases (${releaseCount})`)
  } else {
    breakdown.releaseHistory = 0
    reasons.push('No GitHub releases found')
  }

  // --- Community size (10) — popularity proxy, intentionally low weight ---
  const communitySize =
    (repository?.stars ?? 0) + (repository?.forks ?? 0) + (repository?.watchers ?? 0)
  if (communitySize >= 10000) {
    breakdown.communitySize = 10
    score += 10
    reasons.push('Large community footprint (stars/forks/watchers)')
  } else if (communitySize >= 1000) {
    breakdown.communitySize = 7
    score += 7
    reasons.push('Moderate community footprint')
  } else if (communitySize >= 50) {
    breakdown.communitySize = 4
    score += 4
    reasons.push('Small but visible community footprint')
  } else {
    breakdown.communitySize = 1
    score += 1
    reasons.push('Very small community footprint')
  }

  // --- Repository age (5) ---
  // Established projects get a small trust bonus; brand-new repos stay lower.
  const ageDays = daysSince(repository?.createdAt)
  if (ageDays >= 365 * 3) {
    breakdown.repositoryAge = 5
    score += 5
    reasons.push('Repository is well established (3+ years)')
  } else if (ageDays >= 365) {
    breakdown.repositoryAge = 3
    score += 3
    reasons.push('Repository is over a year old')
  } else if (ageDays >= 90) {
    breakdown.repositoryAge = 2
    score += 2
    reasons.push('Repository is relatively new')
  } else {
    breakdown.repositoryAge = 1
    score += 1
    reasons.push('Repository is very new')
  }

  return {
    score: round1(clamp(score, 0, maxScore)),
    maxScore,
    breakdown,
    reasons,
  }
}

// ---------------------------------------------------------------------------
// STEP 4 — Activity Score
// ---------------------------------------------------------------------------
//
// ALGORITHM (max 100)
// --------------------
// Activity answers: "Is this project alive right now?"
//
// Weights:
//   Last commit / push recency ... 30
//   Recent commit volume ......... 25   (commits in last ~30 days from sample)
//   Updated recently ............. 15   (updatedAt)
//   Recent releases .............. 15
//   Commit frequency ............. 10
//   Inactive-days quality ........  5   (fewer inactive days => higher)
//                                 ----
//                                  100

/**
 * Score how actively the repository is being maintained.
 */
export function calculateActivityScore({ repository, commits = [], releases = [] }) {
  const maxScore = 100
  const breakdown = {}
  const reasons = []
  let score = 0

  const latestCommitDate = commits[0]?.date || repository?.pushedAt
  const daysSinceCommit = daysSince(latestCommitDate)

  // --- Last commit / push recency (30) ---
  if (daysSinceCommit <= 3) {
    breakdown.lastCommitRecency = 30
    score += 30
    reasons.push('Very recent commits (last 3 days)')
  } else if (daysSinceCommit <= 14) {
    breakdown.lastCommitRecency = 24
    score += 24
    reasons.push('Recent commits (last 2 weeks)')
  } else if (daysSinceCommit <= 45) {
    breakdown.lastCommitRecency = 15
    score += 15
    reasons.push('Commits within the last 45 days')
  } else if (daysSinceCommit <= 180) {
    breakdown.lastCommitRecency = 6
    score += 6
    reasons.push('Last commit is several months old')
  } else {
    breakdown.lastCommitRecency = 0
    reasons.push('Repository appears inactive (no recent commits)')
  }

  // --- Monthly-ish commit volume from the recent sample (25) ---
  const commitsLast30 = commits.filter((c) => daysSince(c.date) <= 30).length
  if (commitsLast30 >= 20) {
    breakdown.monthlyCommits = 25
    score += 25
    reasons.push(`High recent commit volume (${commitsLast30} in ~30 days)`)
  } else if (commitsLast30 >= 8) {
    breakdown.monthlyCommits = 18
    score += 18
    reasons.push(`Steady recent commit volume (${commitsLast30} in ~30 days)`)
  } else if (commitsLast30 >= 2) {
    breakdown.monthlyCommits = 10
    score += 10
    reasons.push(`Light recent commit volume (${commitsLast30} in ~30 days)`)
  } else if (commitsLast30 === 1) {
    breakdown.monthlyCommits = 4
    score += 4
    reasons.push('Only one commit in the last ~30 days')
  } else {
    breakdown.monthlyCommits = 0
    reasons.push('No commits in the last ~30 days')
  }

  // --- updatedAt freshness (15) ---
  const daysSinceUpdate = daysSince(repository?.updatedAt)
  if (daysSinceUpdate <= 14) {
    breakdown.updatedRecently = 15
    score += 15
    reasons.push('Repository metadata updated recently')
  } else if (daysSinceUpdate <= 60) {
    breakdown.updatedRecently = 9
    score += 9
    reasons.push('Repository metadata updated within 60 days')
  } else {
    breakdown.updatedRecently = 2
    score += 2
    reasons.push('Repository metadata has not been updated recently')
  }

  // --- Recent releases (15) ---
  const published = (releases || []).filter((r) => !r.draft)
  const newestRelease = published[0]?.publishedAt || published[0]?.createdAt
  const daysSinceRelease = daysSince(newestRelease)
  if (published.length === 0) {
    breakdown.recentReleases = 0
    reasons.push('No recent releases')
  } else if (daysSinceRelease <= 90) {
    breakdown.recentReleases = 15
    score += 15
    reasons.push('Release published within the last 90 days')
  } else if (daysSinceRelease <= 365) {
    breakdown.recentReleases = 8
    score += 8
    reasons.push('Release published within the last year')
  } else {
    breakdown.recentReleases = 3
    score += 3
    reasons.push('Latest release is older than a year')
  }

  // --- Commit frequency across the sample window (10) ---
  // If our 30-commit sample spans few days, frequency is high.
  if (commits.length >= 2) {
    const oldestInSample = commits[commits.length - 1]?.date
    const spanDays = Math.max(daysSince(oldestInSample) - daysSince(commits[0]?.date), 1)
    const perWeek = (commits.length / spanDays) * 7
    if (perWeek >= 5) {
      breakdown.commitFrequency = 10
      score += 10
      reasons.push('High commit frequency in recent history')
    } else if (perWeek >= 1) {
      breakdown.commitFrequency = 6
      score += 6
      reasons.push('Moderate commit frequency in recent history')
    } else {
      breakdown.commitFrequency = 3
      score += 3
      reasons.push('Low commit frequency in recent history')
    }
  } else {
    breakdown.commitFrequency = 0
    reasons.push('Not enough commits to estimate frequency')
  }

  // --- Inactive days quality (5) ---
  // Fewer days since last push => better. This overlaps recency on purpose
  // as a small explicit "staleness" signal for the breakdown UI.
  if (daysSinceCommit <= 7) {
    breakdown.inactiveDays = 5
    score += 5
    reasons.push('Low inactive days')
  } else if (daysSinceCommit <= 30) {
    breakdown.inactiveDays = 3
    score += 3
    reasons.push(`Inactive for about ${Math.round(daysSinceCommit)} days`)
  } else if (daysSinceCommit <= 180) {
    breakdown.inactiveDays = 1
    score += 1
    reasons.push(`Inactive for about ${Math.round(daysSinceCommit)} days`)
  } else {
    breakdown.inactiveDays = 0
    reasons.push(`Long inactivity (~${Math.round(daysSinceCommit)} days)`)
  }

  return {
    score: round1(clamp(score, 0, maxScore)),
    maxScore,
    breakdown,
    reasons,
  }
}

// ---------------------------------------------------------------------------
// STEP 5 — Dependency Health Score
// ---------------------------------------------------------------------------
//
// ALGORITHM (max 100) — HEURISTIC ONLY
// ------------------------------------
// We only DETECT dependency manifests. We do NOT compare package versions yet.
//
// Why multiple ecosystems matter:
//   A repo with package.json + requirements.txt is often a polyglot system
//   (e.g. JS frontend + Python ML). That is not automatically "better", but
//   it shows intentional packaging — so we award a transparency bonus and
//   explain it in reasons.
//
// Weights:
//   At least one manifest .......... 60
//   Each extra ecosystem (max 3) ... 10 each (up to +30)
//   Clear single-ecosystem bonus ... 10
//   No manifest baseline ........... 20  (docs/scripts repos still get something)
//
// Final score is clamped to 100.

const DEPENDENCY_MANIFESTS = [
  { file: 'package.json', ecosystem: 'javascript/node' },
  { file: 'requirements.txt', ecosystem: 'python' },
  { file: 'pyproject.toml', ecosystem: 'python' },
  { file: 'Cargo.toml', ecosystem: 'rust' },
  { file: 'pom.xml', ecosystem: 'java/maven' },
  { file: 'build.gradle', ecosystem: 'java/gradle' },
  { file: 'composer.json', ecosystem: 'php' },
  { file: 'go.mod', ecosystem: 'go' },
]

/**
 * Score whether the repo declares dependencies in a discoverable way.
 */
export function calculateDependencyScore({ rootContents = [] }) {
  const maxScore = 100
  const breakdown = {}
  const reasons = []

  const rootNames = new Set(
    (rootContents || []).filter((item) => item.type === 'file').map((item) => item.name),
  )

  const detected = DEPENDENCY_MANIFESTS.filter((manifest) => rootNames.has(manifest.file))
  const ecosystems = [...new Set(detected.map((item) => item.ecosystem))]

  breakdown.detectedFiles = detected.map((item) => item.file)
  breakdown.ecosystems = ecosystems

  let score = 0

  if (detected.length === 0) {
    score = 20
    breakdown.hasManifest = 20
    breakdown.multiEcosystemBonus = 0
    breakdown.singleEcosystemBonus = 0
    reasons.push('No common dependency manifest detected at repository root')
    reasons.push('Score stays low-but-nonzero because some healthy repos are docs-only or vendored differently')
  } else {
    score += 60
    breakdown.hasManifest = 60
    reasons.push(`Dependency manifest found: ${detected.map((d) => d.file).join(', ')}`)

    const extraEcosystems = Math.max(ecosystems.length - 1, 0)
    const multiBonus = Math.min(extraEcosystems, 3) * 10
    breakdown.multiEcosystemBonus = multiBonus
    score += multiBonus

    if (ecosystems.length >= 2) {
      breakdown.singleEcosystemBonus = 0
      reasons.push(
        `Multiple ecosystems detected (${ecosystems.join(', ')}); polyglot packaging usually means intentional dependency management`,
      )
    } else {
      // Clear single ecosystem is also a positive signal (easy onboarding).
      breakdown.singleEcosystemBonus = 10
      score += 10
      reasons.push(`Single clear ecosystem detected (${ecosystems[0]})`)
    }
  }

  return {
    score: round1(clamp(score, 0, maxScore)),
    maxScore,
    breakdown,
    reasons,
  }
}

// ---------------------------------------------------------------------------
// STEP 6 — Repository Metadata Score
// ---------------------------------------------------------------------------
//
// ALGORITHM (max 100)
// --------------------
// Metadata is the "storefront" of a repository. Incomplete metadata makes
// discovery and trust harder even when the code is excellent.
//
// Weights:
//   License .............. 25
//   Homepage ............. 15
//   Topics ............... 15
//   Description .......... 20
//   Default branch ....... 10   (main/master preferred)
//   Not archived ......... 10
//   Not a fork ...........  5
//                         ----
//                          100
// Visibility is recorded in breakdown but not heavily scored (most analyzed
// repos are public already).

/**
 * Score repository metadata completeness and trust signals.
 */
export function calculateMetadataScore({ repository }) {
  const maxScore = 100
  const breakdown = {}
  const reasons = []
  let score = 0

  // --- License (25) ---
  if (repository?.license) {
    breakdown.license = 25
    score += 25
    reasons.push(`License present (${repository.license.spdxId || repository.license.name})`)
  } else {
    breakdown.license = 0
    reasons.push('No license metadata')
  }

  // --- Homepage (15) ---
  if (repository?.homepage) {
    breakdown.homepage = 15
    score += 15
    reasons.push('Homepage / project URL is set')
  } else {
    breakdown.homepage = 0
    reasons.push('No homepage URL')
  }

  // --- Topics (15) ---
  const topicCount = repository?.topics?.length ?? 0
  if (topicCount >= 3) {
    breakdown.topics = 15
    score += 15
    reasons.push('Topics are well populated')
  } else if (topicCount >= 1) {
    breakdown.topics = 8
    score += 8
    reasons.push('Some topics are set')
  } else {
    breakdown.topics = 0
    reasons.push('No topics set')
  }

  // --- Description (20) ---
  const description = (repository?.description || '').trim()
  if (description.length >= 40) {
    breakdown.description = 20
    score += 20
    reasons.push('Description is informative')
  } else if (description.length >= 10) {
    breakdown.description = 10
    score += 10
    reasons.push('Description is short')
  } else {
    breakdown.description = 0
    reasons.push('Missing or empty description')
  }

  // --- Default branch (10) ---
  const branch = repository?.defaultBranch || ''
  if (branch === 'main' || branch === 'master') {
    breakdown.defaultBranch = 10
    score += 10
    reasons.push(`Standard default branch (${branch})`)
  } else if (branch) {
    breakdown.defaultBranch = 5
    score += 5
    reasons.push(`Non-standard default branch (${branch})`)
  } else {
    breakdown.defaultBranch = 0
    reasons.push('Default branch unknown')
  }

  // --- Archived (10) — archived projects are not actively engineered ---
  // GitHub repo payload uses `archived` on the raw API; our normalized object
  // may not include it yet, so we also accept repository.archived if present.
  const isArchived = Boolean(repository?.archived)
  if (isArchived) {
    breakdown.notArchived = 0
    reasons.push('Repository is archived')
  } else {
    breakdown.notArchived = 10
    score += 10
    reasons.push('Repository is not archived')
  }

  // --- Fork (5) — original repos score slightly higher than copies ---
  if (repository?.isFork) {
    breakdown.notFork = 0
    reasons.push('Repository is a fork')
  } else {
    breakdown.notFork = 5
    score += 5
    reasons.push('Repository is not a fork')
  }

  breakdown.visibility = repository?.visibility || (repository?.isPrivate ? 'private' : 'public')

  return {
    score: round1(clamp(score, 0, maxScore)),
    maxScore,
    breakdown,
    reasons,
  }
}

// ---------------------------------------------------------------------------
// STEP 7 — Overall Engineering Health
// ---------------------------------------------------------------------------
//
// Weighted average (must sum to 100%):
//   Documentation  25%
//   Community      20%
//   Activity       25%
//   Dependency     15%
//   Metadata       15%
//
// Grades:
//   90+  Excellent
//   80+  Very Good
//   70+  Good
//   60+  Average
//   <60  Needs Improvement

const HEALTH_WEIGHTS = {
  documentation: 0.25,
  community: 0.2,
  activity: 0.25,
  dependency: 0.15,
  metadata: 0.15,
}

function gradeFromScore(overallScore) {
  if (overallScore >= 90) {
    return { grade: 'A', category: 'Excellent' }
  }
  if (overallScore >= 80) {
    return { grade: 'B', category: 'Very Good' }
  }
  if (overallScore >= 70) {
    return { grade: 'C', category: 'Good' }
  }
  if (overallScore >= 60) {
    return { grade: 'D', category: 'Average' }
  }
  return { grade: 'F', category: 'Needs Improvement' }
}

/**
 * Combine dimension scores into one overall engineering health result.
 */
export function calculateEngineeringHealth(scores) {
  const overallScore = round1(
    scores.documentation.score * HEALTH_WEIGHTS.documentation +
      scores.community.score * HEALTH_WEIGHTS.community +
      scores.activity.score * HEALTH_WEIGHTS.activity +
      scores.dependency.score * HEALTH_WEIGHTS.dependency +
      scores.metadata.score * HEALTH_WEIGHTS.metadata,
  )

  const { grade, category } = gradeFromScore(overallScore)

  return {
    overallScore,
    grade,
    category,
    weights: HEALTH_WEIGHTS,
  }
}

/**
 * Run every independent scoring function and return the API-ready payload.
 * One responsibility: orchestrate pure scoring (no HTTP, no GitHub calls).
 */
export function calculateRepositoryScores(bundle) {
  const documentation = calculateDocumentationScore(bundle)
  const community = calculateCommunityScore(bundle)
  const activity = calculateActivityScore(bundle)
  const dependency = calculateDependencyScore(bundle)
  const metadata = calculateMetadataScore(bundle)

  const scores = {
    documentation,
    community,
    activity,
    dependency,
    metadata,
  }

  const engineeringHealth = calculateEngineeringHealth(scores)

  return {
    scores,
    engineeringHealth,
  }
}
