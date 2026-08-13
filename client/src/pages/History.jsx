import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorCard from '../components/common/ErrorCard'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Skeleton from '../components/ui/Skeleton'
import { useAnalysis } from '../context/useAnalysis'
import { useAuth } from '../context/useAuth'
import useDocumentTitle from '../hooks/useDocumentTitle'
import { deleteHistoryById, fetchHistory, fetchHistoryById } from '../services/historyService'
import { formatDate } from '../utils/format'

function History() {
  useDocumentTitle('History')
  const navigate = useNavigate()
  const { saveAnalysis } = useAnalysis()
  const { isSignedIn, isReady, login } = useAuth()

  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const [search, setSearch] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('')
  const [sort, setSort] = useState('newest')

  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchHistory({
        search: search.trim() || undefined,
        owner: ownerFilter.trim() || undefined,
        sort,
      })
      setItems(data || [])
    } catch (err) {
      setError(err)
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }, [search, ownerFilter, sort])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory()
    }, 250)
    return () => clearTimeout(timer)
  }, [loadHistory])

  const owners = useMemo(() => {
    const set = new Set(items.map((item) => item.owner).filter(Boolean))
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [items])

  const replayAnalysis = (analysis) => {
    saveAnalysis({
      repository: analysis.repository,
      scores: analysis.scores,
      engineeringHealth: analysis.engineeringHealth,
      technicalDebt: analysis.technicalDebt,
      technicalDebtMeta: analysis.technicalDebtMeta,
      aiInsights: analysis.aiInsights,
      persistence: {
        saved: true,
        analysisId: analysis.id,
        analysisDate: analysis.analysisDate,
      },
    })
  }

  const handleView = async (id) => {
    setBusyId(id)
    try {
      const analysis = await fetchHistoryById(id)
      replayAnalysis(analysis)
      navigate('/dashboard')
    } catch (err) {
      setError(err)
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Delete this saved analysis?')
    if (!confirmed) return

    setBusyId(id)
    try {
      await deleteHistoryById(id)
      setItems((current) => current.filter((item) => item._id !== id))
    } catch (err) {
      setError(err)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analysis history</h1>
          <p className="mt-2 text-sm text-slate-400">
            Search, filter, and reopen past runs without calling GitHub again.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/compare">
            <Button variant="secondary">Compare</Button>
          </Link>
          <Link to="/">
            <Button>Analyze another repo</Button>
          </Link>
        </div>
      </div>

      <Card className="grid gap-3 p-4 sm:grid-cols-3">
        <label className="text-left text-xs text-slate-400">
          Search repository
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="react, next.js..."
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="text-left text-xs text-slate-400">
          Filter by owner
          <input
            list="owner-options"
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value)}
            placeholder="facebook"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          />
          <datalist id="owner-options">
            {owners.map((owner) => (
              <option key={owner} value={owner} />
            ))}
          </datalist>
        </label>
        <label className="text-left text-xs text-slate-400">
          Sort by
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest score</option>
            <option value="lowest">Lowest score</option>
          </select>
        </label>
      </Card>

      {isReady && !isSignedIn ? (
        <Card className="p-10 text-center" role="status">
          <h2 className="text-xl font-semibold text-white">Sign in to view history</h2>
          <p className="mt-2 text-sm text-slate-400">
            Saved analyses are private to your GitHub account, including private repositories you analyzed.
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
          onRetry={loadHistory}
        />
      )}

      {isSignedIn && isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : isSignedIn && items.length === 0 ? (
        <Card className="p-10 text-center" role="status">
          <h2 className="text-xl font-semibold text-white">No saved analyses yet</h2>
          <p className="mt-2 text-sm text-slate-400">
            {search || ownerFilter
              ? 'No results match your search or filters. Try clearing them.'
              : 'Run an analysis from the home page. Results are stored when MongoDB is connected.'}
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button>Analyze a repository</Button>
            </Link>
          </div>
        </Card>
      ) : isSignedIn ? (
        <>
          <Card className="hidden overflow-hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-950/50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Repository</th>
                    <th className="px-6 py-4 font-medium">Owner</th>
                    <th className="px-6 py-4 font-medium">Engineering score</th>
                    <th className="px-6 py-4 font-medium">Analyzed</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {items.map((item) => (
                    <tr key={item._id} className="transition hover:bg-slate-800/30">
                      <td className="px-6 py-4 font-medium text-white">
                        {item.repositoryName || item.repository?.name}
                      </td>
                      <td className="px-6 py-4 text-slate-400">{item.owner}</td>
                      <td className="px-6 py-4 text-cyan-300">
                        {item.engineeringHealth?.overallScore ?? '—'}
                        {item.engineeringHealth?.grade
                          ? ` · ${item.engineeringHealth.grade}`
                          : ''}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {formatDate(item.analysisDate || item.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            className="px-3 py-2"
                            disabled={busyId === item._id}
                            onClick={() => handleView(item._id)}
                          >
                            View
                          </Button>
                          <Button
                            variant="secondary"
                            className="px-3 py-2 text-rose-300"
                            disabled={busyId === item._id}
                            onClick={() => handleDelete(item._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-3 lg:hidden">
            {items.map((item) => (
              <Card key={item._id} className="p-5">
                <h2 className="text-base font-semibold text-white">
                  {item.repositoryName || item.repository?.name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {item.owner} · Score {item.engineeringHealth?.overallScore ?? '—'} ·{' '}
                  {formatDate(item.analysisDate || item.createdAt)}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="secondary"
                    className="flex-1 px-3 py-2"
                    disabled={busyId === item._id}
                    onClick={() => handleView(item._id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1 px-3 py-2 text-rose-300"
                    disabled={busyId === item._id}
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}

export default History
