import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { APP_NAME, GITHUB_REPO_URL } from '../../constants'
import { useAuth } from '../../context/useAuth'
import Button from '../ui/Button'
import GitHubIcon from '../ui/GitHubIcon'

const getLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-cyan-400 text-slate-950'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)
  const { user, isSignedIn, isReady, login, logout } = useAuth()

  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/history', label: 'History' },
    { to: '/compare', label: 'Compare' },
  ]

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6"
      >
        <NavLink
          to="/"
          onClick={closeMenu}
          className="flex items-center gap-2"
          aria-label={`${APP_NAME} home`}
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-400 font-bold text-slate-950"
            aria-hidden="true"
          >
            R
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            RepoPulse <span className="text-cyan-400">AI</span>
          </span>
        </NavLink>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={getLinkClass}>
              {link.label}
            </NavLink>
          ))}
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="ml-2 inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:text-white"
          >
            <GitHubIcon className="h-4 w-4" />
            GitHub
          </a>
          {isReady &&
            (isSignedIn ? (
              <div className="ml-2 flex items-center gap-2">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=""
                    className="h-8 w-8 rounded-full ring-1 ring-slate-700"
                  />
                ) : null}
                <span className="max-w-28 truncate text-sm text-slate-300" title={user.login}>
                  {user.login}
                </span>
                <Button variant="secondary" className="px-3 py-2 text-xs" onClick={logout}>
                  Sign out
                </Button>
              </div>
            ) : (
              <Button className="ml-2 px-3 py-2 text-xs" onClick={login}>
                <GitHubIcon className="h-4 w-4" />
                Sign in
              </Button>
            ))}
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-nav"
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
        <div id="mobile-nav" className="border-t border-slate-800 px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3" role="menu" aria-label="Mobile navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={closeMenu}
                className={getLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <GitHubIcon className="h-4 w-4" />
              {APP_NAME} on GitHub
            </a>
            {isReady &&
              (isSignedIn ? (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  onClick={() => {
                    closeMenu()
                    logout()
                  }}
                >
                  Sign out ({user.login})
                </button>
              ) : (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-cyan-300 hover:bg-slate-800"
                  onClick={() => {
                    closeMenu()
                    login()
                  }}
                >
                  Sign in with GitHub
                </button>
              ))}
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
