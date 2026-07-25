import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { APP_NAME, GITHUB_REPO_URL } from '../../constants'
import GitHubIcon from '../ui/GitHubIcon'

const getLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-cyan-400 text-slate-950'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`

function Navbar() {
  // Mobile menus need local open/closed state; nothing else needs to know.
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"
      >
        <NavLink to="/" onClick={closeMenu} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400 font-bold text-slate-950">
            R
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            RepoPulse <span className="text-cyan-400">AI</span>
          </span>
        </NavLink>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-2 md:flex">
          <NavLink to="/" className={getLinkClass}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={getLinkClass}>
            Dashboard
          </NavLink>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-2 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          className="rounded-lg border border-slate-700 p-2 text-slate-200 md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            {isMenuOpen ? (
              <path d="M6 6l12 12M18 6l-12 12" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {isMenuOpen && (
        <div className="border-t border-slate-800 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3">
            <NavLink to="/" onClick={closeMenu} className={getLinkClass}>
              Home
            </NavLink>
            <NavLink to="/dashboard" onClick={closeMenu} className={getLinkClass}>
              Dashboard
            </NavLink>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <GitHubIcon className="h-4 w-4" />
              {APP_NAME} on GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
