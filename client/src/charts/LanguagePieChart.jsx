import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import Card from '../components/ui/Card'

const COLORS = ['#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#60a5fa', '#f472b6']

function LanguagePieChart({ languages = [] }) {
  const data = (languages || []).slice(0, 7).map((item) => ({
    name: item.language,
    value: item.percentage,
  }))

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Language distribution</h3>
      {data.length === 0 ? (
        <p className="py-16 text-center text-sm text-slate-500">No language data available.</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, 'Share']}
                contentStyle={{
                  background: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: 12,
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  )
}

export default LanguagePieChart
