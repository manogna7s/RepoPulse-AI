import { EXAMPLE_REPO_URL } from '../../constants'
import useLoadingMessage from '../../hooks/useLoadingMessage'
import Button from '../ui/Button'
import Card from '../ui/Card'
import GitHubIcon from '../ui/GitHubIcon'
import Spinner from '../ui/Spinner'

/**
 * Presentational form. All state and submission logic is passed in from the
 * page's hook, which keeps this component easy to reuse and test.
 */
function RepositoryInput({ url, onChange, onSubmit, isLoading, validationError }) {
  const loadingMessage = useLoadingMessage(isLoading)

  return (
    <Card className="mx-auto w-full max-w-2xl p-6 sm:p-8">
      <form onSubmit={onSubmit} className="space-y-4">
        <label htmlFor="repo-url" className="block text-left text-sm font-medium text-slate-300">
          GitHub repository URL
        </label>

        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <GitHubIcon className="h-5 w-5" />
          </span>
          <input
            id="repo-url"
            type="text"
            value={url}
            disabled={isLoading}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Paste GitHub Repository URL"
            aria-invalid={Boolean(validationError)}
            aria-describedby={validationError ? 'repo-url-error' : undefined}
            className={`w-full rounded-xl border bg-slate-950/70 py-4 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-500 transition focus:outline-none disabled:opacity-60 ${
              validationError
                ? 'border-rose-500/60 focus:border-rose-400'
                : 'border-slate-700 focus:border-cyan-400'
            }`}
          />
        </div>

        {validationError ? (
          <p id="repo-url-error" className="text-left text-sm text-rose-300">
            {validationError}
          </p>
        ) : (
          <p className="text-left text-xs text-slate-500">
            Example: <span className="font-mono text-slate-400">{EXAMPLE_REPO_URL}</span>
          </p>
        )}

        <Button type="submit" disabled={isLoading} className="w-full py-4 text-base">
          {isLoading ? (
            <>
              <Spinner className="h-5 w-5" />
              Analyzing...
            </>
          ) : (
            <>
              <GitHubIcon className="h-5 w-5" />
              Analyze Repository
            </>
          )}
        </Button>

        {isLoading && (
          <p className="animate-pulse text-center text-sm text-cyan-300" aria-live="polite">
            {loadingMessage}
          </p>
        )}
      </form>
    </Card>
  )
}

export default RepositoryInput
