import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card from '../components/ui/Card'

function StarsForksBarChart({ repository }) {
  const data = [
    { name: 'Stars', value: repository?.stars ?? 0 },
    { name: 'Forks', value: repository?.forks ?? 0 },
    { name: 'Watchers', value: repository?.watchers ?? 0 },
  ]

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Stars vs forks</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
              }}
            />
            <Bar dataKey="value" fill="#34d399" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default StarsForksBarChart
