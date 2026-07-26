import { Link, useRouteError } from 'react-router-dom'
import Button from '../components/ui/Button'
import useDocumentTitle from '../hooks/useDocumentTitle'

/**
 * Rendered when a route throws (React Router errorElement).
 */
function ServerError() {
  useDocumentTitle('Something went wrong')
  const error = useRouteError()

  const detail =
    import.meta.env.DEV && error
      ? error.statusText || error.message || String(error)
      : null

  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 px-4 text-center">
      <section role="alert" aria-labelledby="server-error-title">
        <p className="text-7xl font-bold text-rose-400" aria-hidden="true">
          500
        </p>
        <h1 id="server-error-title" className="mt-4 text-3xl font-bold text-white">
          Something went wrong
        </h1>
        <p className="mx-auto mt-3 max-w-md text-slate-400">
          An unexpected error occurred while loading this page. You can retry or return home.
        </p>
        {detail && (
          <p className="mx-auto mt-4 max-w-lg break-words font-mono text-xs text-rose-300/70">
            {detail}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => window.location.reload()}>
            Retry
          </Button>
          <Link to="/">
            <Button variant="secondary">Return home</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default ServerError
