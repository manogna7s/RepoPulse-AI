import { formatCount, formatDate } from '../../utils/format'
import Card from '../ui/Card'
import GitHubIcon from '../ui/GitHubIcon'

function Stat({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

/** Top section of the dashboard: identity, description, and key counts. */
function RepositoryHeader({ repository }) {
  if (!repository) return null

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {repository.owner?.avatarUrl && (
              <img
                src={repository.owner.avatarUrl}
                alt={`${repository.owner.login} avatar`}
                className="h-12 w-12 rounded-xl border border-slate-800"
              />
            )}
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
                {repository.name}
              </h1>
              <p className="text-sm text-slate-400">by {repository.owner?.login}</p>
            </div>
          </div>

          {repository.description && (
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">
              {repository.description}
            </p>
          )}

          {repository.topics?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {repository.topics.slice(0, 8).map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300 ring-1 ring-cyan-400/20"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
            {repository.htmlUrl && (
              <a
                href={repository.htmlUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <GitHubIcon className="h-4 w-4" />
                Repository
              </a>
            )}
            {repository.homepage && (
              <a
                href={repository.homepage}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white"
              >
                Homepage
              </a>
            )}
            <span>License: {repository.license?.spdxId || 'None'}</span>
            <span>Created {formatDate(repository.createdAt)}</span>
            <span>Updated {formatDate(repository.updatedAt)}</span>
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[420px]">
          <Stat label="Stars" value={formatCount(repository.stars)} />
          <Stat label="Forks" value={formatCount(repository.forks)} />
          <Stat label="Watchers" value={formatCount(repository.watchers)} />
          <Stat label="Language" value={repository.language || '—'} />
        </div>
      </div>
    </Card>
  )
}

export default RepositoryHeader
