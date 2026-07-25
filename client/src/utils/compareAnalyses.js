/**
 * Pure comparison helpers — no React, no network.
 * Used by the Compare page to highlight improved / declined / unchanged metrics.
 */

function deltaStatus(current, previous) {
  const diff = Number(current ?? 0) - Number(previous ?? 0)
  if (Math.abs(diff) < 0.05) return { diff: 0, status: 'unchanged' }
  if (diff > 0) return { diff: Number(diff.toFixed(1)), status: 'improved' }
  return { diff: Number(diff.toFixed(1)), status: 'declined' }
}

/**
 * Compare two saved analysis payloads and return a UI-ready summary.
 */
export function compareAnalyses(current, previous) {
  if (!current || !previous) {
    return null
  }

  const scoreKeys = ['documentation', 'community', 'activity', 'dependency', 'metadata']

  const scores = scoreKeys.map((key) => {
    const currentScore = current.scores?.[key]?.score ?? 0
    const previousScore = previous.scores?.[key]?.score ?? 0
    const change = deltaStatus(currentScore, previousScore)

    return {
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      current: currentScore,
      previous: previousScore,
      ...change,
      currentReasons: current.scores?.[key]?.reasons?.slice(0, 3) || [],
      previousReasons: previous.scores?.[key]?.reasons?.slice(0, 3) || [],
    }
  })

  const overall = deltaStatus(
    current.engineeringHealth?.overallScore,
    previous.engineeringHealth?.overallScore,
  )

  const currentDebt = current.technicalDebt || []
  const previousDebt = previous.technicalDebt || []
  const debtAvg = (list) =>
    list.length === 0 ? 0 : list.reduce((sum, item) => sum + (item.debtScore || 0), 0) / list.length

  // For debt, lower is better — invert the status label.
  const debtChangeRaw = deltaStatus(debtAvg(currentDebt), debtAvg(previousDebt))
  const debtChange = {
    ...debtChangeRaw,
    status:
      debtChangeRaw.status === 'improved'
        ? 'declined'
        : debtChangeRaw.status === 'declined'
          ? 'improved'
          : 'unchanged',
  }

  return {
    overall: {
      current: current.engineeringHealth?.overallScore ?? 0,
      previous: previous.engineeringHealth?.overallScore ?? 0,
      gradeCurrent: current.engineeringHealth?.grade,
      gradePrevious: previous.engineeringHealth?.grade,
      ...overall,
    },
    scores,
    technicalDebt: {
      currentCount: currentDebt.length,
      previousCount: previousDebt.length,
      currentAvg: Number(debtAvg(currentDebt).toFixed(1)),
      previousAvg: Number(debtAvg(previousDebt).toFixed(1)),
      ...debtChange,
    },
    meta: {
      currentId: current.id || current._id,
      previousId: previous.id || previous._id,
      currentDate: current.analysisDate,
      previousDate: previous.analysisDate,
      currentRepo: current.repository?.fullName || `${current.owner}/${current.repositoryName}`,
      previousRepo: previous.repository?.fullName || `${previous.owner}/${previous.repositoryName}`,
    },
  }
}
