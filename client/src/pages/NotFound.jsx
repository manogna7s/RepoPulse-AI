import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

function NotFound() {
  useDocumentTitle('Page Not Found')

  return (
    <section className="grid min-h-[60vh] place-items-center text-center">
      <div>
        <p className="text-7xl font-bold text-cyan-400">404</p>
        <h1 className="mt-4 text-3xl font-bold text-white">Page not found</h1>
        <p className="mt-3 text-slate-400">
          The page you requested does not exist.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block font-semibold text-cyan-400 hover:text-cyan-300"
        >
          Return home
        </Link>
      </div>
    </section>
  )
}

export default NotFound
