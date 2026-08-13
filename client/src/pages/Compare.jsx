import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ErrorCard from '../components/common/ErrorCard'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../context/useAuth'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { fetchHistory, fetchHistoryById } from '../services/historyService'
import { compareAnalyses } from '../utils/compareAnalyses'
import { formatDate } from '../utils/format'

const STATUS_STYLES = {
  improved: 'bg-emerald-500/10 text-emerald-300 ring-emerald-500/30',
  declined: 'bg-rose-500/10 text-rose-300 ring-rose-500/30',
  unchanged: 'bg-slate-500/10 text-slate-300 ring-slate-500/30',
}

function StatusBadge({ status, diff }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${STATUS_STYLES[status]}`}>
      {status}
      {diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff})` : ''}
    </span>
  )
}

function Compare() {
  useDocumentTitle('Compare')

  const [history, setHistory] = useState([])
  const [currentId, setCurrentId] = useState('')
  const [previousId, setPreviousId] = useState('')
  const [comparison, setComparison] = useState(null)
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isComparing, setIsComparing] = useState(false)
  const [error, setError] = useState(null)
  const { isSignedIn, isReady, login } = useAuth()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setIsLoadingList(true)
      try {
        const items = await fetchHistory({ sort: 'newest', limit: 100 })
        if (!cancelled) {
          setHistory(items || [])
          if (items?.[0]?._id) setCurrentId(items[0]._id)
          if (items?.[1]?._id) setPreviousId(items[1]._id)
        }
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setIsLoadingList(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const options = useMemo(
    () =>
      history.map((item) => ({
        id: item._id,
        label: `${item.owner}/${item.repositoryName} · ${formatDate(item.analysisDate)} · ${item.engineeringHealth?.overallScore ?? '—'}`,
      })),
    [history],
  )

  const runCompare = async () => {
    if (!currentId || !previousId) {
      setError({
        title: 'Select two analyses',
        message: 'Choose a current and previous analysis to compare.',
        code: 'COMPARE_SELECTION',
      })
      return
    }
    if (currentId === previousId) {
      setError({
        title: 'Same analysis selected',
        message: 'Pick two different saved analyses.',
        code: 'COMPARE_SAME',
      })
      return
    }

    setIsComparing(true)
    setError(null)
    try {
      const [current, previous] = await Promise.all([
        fetchHistoryById(currentId),
        fetchHistoryById(previousId),
      ])
      setComparison(compareAnalyses(current, previous))
    } catch (err) {
      setError(err)
      setComparison(null)
    } finally {
      setIsComparing(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Compare analyses</h1>
          <p className="mt-2 text-sm text-slate-400">
            Highlight what improved, declined, or stayed the same between two saved runs.
          </p>
        </div>
        <Link to="/history">
          <Button variant="secondary">Back to history</Button>
        </Link>
      </div>

      {isReady && !isSignedIn ? (
        <Card className="p-10 text-center">
          <h2 className="text-xl font-semibold text-white">Sign in to compare analyses</h2>
          <p className="mt-2 text-sm text-slate-400">
            Comparison uses your saved history, including private repositories.
          </p>
          <div className="mt-6">
            <Button onClick={login}>Sign in with GitHub</Button>
          </div>
        </Card>
      ) : null}

      {error && isSignedIn && (
        <ErrorCard
          title={error.title}
          message={error.message}
          code={error.code}
          onRetry={history.length >= 2 ? runCompare : undefined}
        />
      )}

      {isSignedIn && isLoadingList ? (
        <Skeleton className="h-40 w-full" />
      ) : isSignedIn && history.length < 2 ? (
        <Card className="p-10 text-center">
          <h2 className="text-xl font-semibold text-white">Need at least two analyses</h2>
          <p className="mt-2 text-sm text-slate-400">
            Analyze the same or different repositories twice, then return here to compare.
          </p>
          <Link to="/" className="mt-6 inline-block">
            <Button>Analyze a repository</Button>
          </Link>
        </Card>
      ) : isSignedIn ? (
        <Card className="grid gap-4 p-5 sm:grid-cols-2">
          <label className="text-xs text-slate-400">
            Current analysis
            <select
              value={currentId}
              onChange={(event) => setCurrentId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-400">
            Previous analysis
            <select
              value={previousId}
              onChange={(event) => setPreviousId(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <Button onClick={runCompare} disabled={isComparing} className="w-full sm:w-auto">
              {isComparing ? 'Comparing...' : 'Compare'}
            </Button>
          </div>
        </Card>
      ) : null}

      {isSignedIn && comparison && (
        <div className="space-y-5">
          <Card className="p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">Overall engineering health</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <p className="text-3xl font-bold text-white">
                {comparison.overall.previous} → {comparison.overall.current}
              </p>
              <StatusBadge status={comparison.overall.status} diff={comparison.overall.diff} />
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {comparison.meta.previousRepo} ({formatDate(comparison.meta.previousDate)}) vs{' '}
              {comparison.meta.currentRepo} ({formatDate(comparison.meta.currentDate)})
            </p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {comparison.scores.map((score) => (
              <Card key={score.key} hoverable className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-white">{score.label}</h3>
                  <StatusBadge status={score.status} diff={score.diff} />
                </div>
                <p className="mt-3 text-sm text-slate-400">
                  {score.previous} → <span className="text-white">{score.current}</span>
                </p>
                {score.currentReasons.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-slate-500">
                    {score.currentReasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                )}
              </Card>
            ))}
          </div>

          <Card className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-white">Technical debt</h3>
              <StatusBadge
                status={comparison.technicalDebt.status}
                diff={Number(
                  (comparison.technicalDebt.previousAvg - comparison.technicalDebt.currentAvg).toFixed(1),
                )}
              />
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Avg debt {comparison.technicalDebt.previousAvg} → {comparison.technicalDebt.currentAvg}{' '}
              · Files tracked {comparison.technicalDebt.previousCount} →{' '}
              {comparison.technicalDebt.currentCount}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              For debt, lower averages are treated as improvements.
            </p>
          </Card>
        </div>
      )}
    </section>
  )
}

export default Compare
