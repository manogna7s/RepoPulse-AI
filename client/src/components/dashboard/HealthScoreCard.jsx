import { scoreColor } from '../../utils/format'
import Card from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'

/** The headline number: overall engineering health with grade and category. */
function HealthScoreCard({ engineeringHealth }) {
  if (!engineeringHealth) return null

  const { overallScore, grade, category } = engineeringHealth

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Overall Engineering Health
          </p>
          <div className="mt-3 flex items-end justify-center gap-3 sm:justify-start">
            <span className={`text-6xl font-bold leading-none ${scoreColor(overallScore)}`}>
              {overallScore}
            </span>
            <span className="pb-2 text-lg text-slate-500">/ 100</span>
          </div>
          <p className="mt-3 text-sm text-slate-400">
            Grade <span className="font-semibold text-white">{grade}</span> · {category}
          </p>
        </div>

        <div className="w-full sm:max-w-sm">
          <ProgressBar value={overallScore} />
          <p className="mt-3 text-xs leading-5 text-slate-500">
            Weighted from documentation, community, activity, dependency health,
            and metadata signals. Fully deterministic — no AI involved.
          </p>
        </div>
      </div>
    </Card>
  )
}

export default HealthScoreCard
