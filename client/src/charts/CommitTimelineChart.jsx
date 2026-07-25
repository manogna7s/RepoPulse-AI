import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../components/ui/Card'

/**
 * Builds a simple commit timeline from the recent-commits sample returned by
 * the backend. If commits are missing, show an honest placeholder.
 */
function CommitTimelineChart({ commits = [] }) {
  if (!commits?.length) {
    return (
      <Card className="flex h-64 flex-col items-center justify-center border-dashed p-6 text-center">
        <p className="text-sm font-semibold text-slate-300">Commit timeline</p>
        <p className="mt-2 text-sm text-slate-500">
          Commit timeline placeholder — recent commit samples were unavailable for this analysis.
        </p>
      </Card>
    )
  }

  // Group commits by day for a readable line chart.
  const byDay = new Map()
  for (const commit of commits) {
    if (!commit.date) continue
    const day = commit.date.slice(0, 10)
    byDay.set(day, (byDay.get(day) || 0) + 1)
  }

  const data = [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([day, count]) => ({ day, count }))

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Commit timeline (recent sample)</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
              }}
            />
            <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default CommitTimelineChart
