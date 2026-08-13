import useDocumentTitle from '../hooks/useDocumentTitle'
import useRepositoryAnalysis from '../hooks/useRepositoryAnalysis'
import ErrorCard from '../components/common/ErrorCard'
import NetworkError from '../components/common/NetworkError'
import MeetRepoPulse from '../components/home/MeetRepoPulse'
import RepositoryInput from '../components/repository/RepositoryInput'
import Button from '../components/ui/Button'
import GitHubIcon from '../components/ui/GitHubIcon'
import { useAuth } from '../context/useAuth'

function Home() {
  useDocumentTitle('Home')

  const { url, updateUrl, submit, isLoading, validationError, requestError } =
    useRepositoryAnalysis()
  const { isSignedIn, login, user } = useAuth()

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

      <MeetRepoPulse />
    </section>
  )
}

export default Home
