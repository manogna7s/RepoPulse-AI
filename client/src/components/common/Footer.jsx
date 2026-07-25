import { GITHUB_REPO_URL } from '../../constants'
import GitHubIcon from '../ui/GitHubIcon'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-400 sm:px-6 md:flex-row">
        <p>© {year} RepoPulse AI — Engineering intelligence for every repository.</p>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 transition hover:text-white"
        >
          <GitHubIcon className="h-4 w-4" />
          View source
        </a>
      </div>
    </footer>
  )
}

export default Footer
