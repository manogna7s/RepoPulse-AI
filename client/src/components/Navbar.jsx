import { NavLink } from 'react-router-dom'

const getLinkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-cyan-400 text-slate-950'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  }`

function Navbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"
      >
        <NavLink to="/" className="text-lg font-bold tracking-tight text-white">
          RepoPulse <span className="text-cyan-400">AI</span>
        </NavLink>

        <div className="flex gap-2">
          <NavLink to="/" className={getLinkClass}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={getLinkClass}>
            Dashboard
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
