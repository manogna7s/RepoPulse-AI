import { Link } from 'react-router-dom'
import useDocumentTitle from '../hooks/useDocumentTitle'

function Home() {
  useDocumentTitle('Home')

  return (
    <section className="grid min-h-[60vh] place-items-center text-center">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">
          Understand your repositories
        </p>
        <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Clear engineering insights, powered by AI.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          RepoPulse AI will help teams understand code health and repository
          activity. Repository analysis is not part of this initial setup.
        </p>
        <Link
          to="/dashboard"
          className="mt-8 inline-flex rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          View dashboard
        </Link>
      </div>
    </section>
  )
}

export default Home
