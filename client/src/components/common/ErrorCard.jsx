import Card from '../ui/Card'

// Errors deserve the same visual quality as success states. A dedicated
// component keeps every failure looking consistent across pages.
function ErrorCard({ title, message, code, onRetry }) {
  return (
    <Card className="border-rose-500/30 bg-rose-500/5 p-6 text-left">
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-500/15 text-rose-300">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 8v5M12 16.5v.5" strokeLinecap="round" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </span>

        <div className="min-w-0">
          <h3 className="text-base font-semibold text-rose-200">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-rose-100/80">{message}</p>
          {code && (
            <p className="mt-2 font-mono text-xs uppercase tracking-wide text-rose-300/60">
              {code}
            </p>
          )}
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 text-sm font-semibold text-rose-200 underline-offset-4 hover:underline"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

export default ErrorCard
