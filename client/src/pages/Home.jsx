import useDocumentTitle from '../hooks/useDocumentTitle'
import useRepositoryAnalysis from '../hooks/useRepositoryAnalysis'
import ErrorCard from '../components/common/ErrorCard'
import RepositoryInput from '../components/repository/RepositoryInput'

const FEATURES = [
  { title: 'Documentation', text: 'README depth, setup and usage guidance.' },
  { title: 'Community', text: 'Contributors, issues, releases and reach.' },
  { title: 'Activity', text: 'Commit recency and maintenance cadence.' },
  { title: 'Technical debt', text: 'Riskiest files ranked by heuristics.' },
]

function Home() {
  useDocumentTitle('Home')

  const { url, updateUrl, submit, isLoading, validationError, requestError } =
    useRepositoryAnalysis()

  return (
    <section className="flex flex-col items-center text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400 sm:text-sm">
        Engineering Intelligence for Every Repository
      </p>

      <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
        RepoPulse <span className="text-cyan-400">AI</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
        Analyze any public GitHub repository to measure engineering quality,
        documentation, community health, development activity, dependency health
        and technical debt.
      </p>

      <div className="mt-10 w-full">
        <RepositoryInput
          url={url}
          onChange={updateUrl}
          onSubmit={submit}
          isLoading={isLoading}
          validationError={validationError}
        />
      </div>

      {requestError && (
        <div className="mt-6 w-full max-w-2xl">
          <ErrorCard
            title={requestError.title}
            message={requestError.message}
            code={requestError.code}
          />
        </div>
      )}

      <div className="mt-16 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-700"
          >
            <h2 className="text-sm font-semibold text-white">{feature.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{feature.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Home
