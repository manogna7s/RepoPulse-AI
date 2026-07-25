import { scoreColor } from '../../utils/format'
import Card from '../ui/Card'
import ProgressBar from '../ui/ProgressBar'

/** One of the five engineering dimensions, with its reasons list. */
function ScoreCard({ title, description, score }) {
  if (!score) return null

  return (
    <Card hoverable className="flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <span className={`text-2xl font-bold ${scoreColor(score.score)}`}>
          {score.score}
        </span>
      </div>

      <div className="mt-4">
        <ProgressBar value={score.score} max={score.maxScore} />
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-400">{description}</p>

      {score.reasons?.length > 0 && (
        <ul className="mt-4 space-y-2 border-t border-slate-800 pt-4 text-sm text-slate-400">
          {score.reasons.slice(0, 5).map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
              <span className="leading-6">{reason}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default ScoreCard
