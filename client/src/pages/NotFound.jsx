import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import useDocumentTitle from '../hooks/useDocumentTitle'

function NotFound() {
  useDocumentTitle('Page Not Found')

  return (
    <section className="grid min-h-[60vh] place-items-center text-center" aria-labelledby="not-found-title">
      <div>
        <p className="text-7xl font-bold text-cyan-400" aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title" className="mt-4 text-3xl font-bold text-white">
          Page not found
        </h1>
        <p className="mt-3 text-slate-400">
          The page you requested does not exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button>Return home</Button>
          </Link>
          <Link to="/history">
            <Button variant="secondary">View history</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFound
