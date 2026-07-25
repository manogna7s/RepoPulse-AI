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

function TechnicalDebtBarChart({ technicalDebt = [] }) {
  const data = (technicalDebt || []).slice(0, 8).map((item) => ({
    // Keep labels short so the axis stays readable.
    name: (item.file || '').split('/').pop() || item.file,
    fullPath: item.file,
    score: item.debtScore,
  }))

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Technical debt by file</h3>
      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">No debt hotspots to chart.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
              />
              <Tooltip
                formatter={(value, _name, props) => [value, props.payload.fullPath]}
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 12,
                }}
              />
              <Bar dataKey="score" fill="#fb7185" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

export default TechnicalDebtBarChart
