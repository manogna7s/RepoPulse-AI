import useDocumentTitle from '../hooks/useDocumentTitle'
import useRepositoryAnalysis from '../hooks/useRepositoryAnalysis'
import ErrorCard from '../components/common/ErrorCard'
import NetworkError from '../components/common/NetworkError'
import RepositoryInput from '../components/repository/RepositoryInput'
import Button from '../components/ui/Button'
import GitHubIcon from '../components/ui/GitHubIcon'
import { useAuth } from '../context/useAuth'

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
  const { isSignedIn, login, user, isReady } = useAuth()

  const isNetworkError =
    requestError?.code === 'NETWORK_ERROR' || requestError?.code === 'TIMEOUT'

  return (
    <section className="flex flex-col items-center text-center" aria-labelledby="home-heading">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400 sm:text-sm">
        Engineering Intelligence for Every Repository
      </p>

      <h1
        id="home-heading"
        className="max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        RepoPulse <span className="text-cyan-400">AI</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
        Analyze public GitHub repositories for engineering quality, documentation,
        community health, activity, dependency hygiene, and technical debt.
        Sign in with GitHub to analyze private repos you can access and save personal history.
      </p>

      {isReady && (
        <div className="mt-6">
          {isSignedIn ? (
            <p className="text-sm text-emerald-300">
              Signed in as <span className="font-semibold">{user.login}</span> — private repos you can access are included.
            </p>
          ) : (
            <Button variant="secondary" onClick={login}>
              <GitHubIcon className="h-4 w-4" />
              Sign in with GitHub for private repos
            </Button>
          )}
        </div>
      )}

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
          {isNetworkError ? (
            <NetworkError
              title={requestError.title}
              message={requestError.message}
              code={requestError.code}
              onRetry={submit}
            />
          ) : (
            <ErrorCard
              title={requestError.title}
              message={requestError.message}
              code={requestError.code}
              onRetry={submit}
            />
          )}
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
