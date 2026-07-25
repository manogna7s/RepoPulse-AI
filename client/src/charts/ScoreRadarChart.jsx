import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import Card from '../components/ui/Card'

function ScoreRadarChart({ scores }) {
  const data = [
    { metric: 'Docs', score: scores?.documentation?.score ?? 0 },
    { metric: 'Community', score: scores?.community?.score ?? 0 },
    { metric: 'Activity', score: scores?.activity?.score ?? 0 },
    { metric: 'Deps', score: scores?.dependency?.score ?? 0 },
    { metric: 'Metadata', score: scores?.metadata?.score ?? 0 },
  ]

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Engineering score radar</h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#22d3ee"
              fill="#22d3ee"
              fillOpacity={0.35}
            />
            <Tooltip
              contentStyle={{
                background: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: 12,
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export default ScoreRadarChart
