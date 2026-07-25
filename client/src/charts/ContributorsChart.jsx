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

function ContributorsChart({ contributors = [] }) {
  const data = (contributors || []).slice(0, 8).map((person) => ({
    name: person.login,
    contributions: person.contributions,
  }))

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Top contributors</h3>
      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">No contributor data available.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="contributions" fill="#a78bfa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

export default ContributorsChart
