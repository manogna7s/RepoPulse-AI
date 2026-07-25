import { scoreBarColor } from '../../utils/format'

// A score is easier to read as a bar than a number alone. Width is clamped so
// unexpected values cannot break the layout.
function ProgressBar({ value = 0, max = 100 }) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ${scoreBarColor(value)}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  )
}

export default ProgressBar
