// A single Card shell keeps rounding, borders, and shadows consistent
// everywhere instead of repeating long Tailwind strings.
function Card({ children, className = '', hoverable = false, ...rest }) {
  return (
    <div
      {...rest}
      className={`rounded-2xl border border-slate-800 bg-slate-900/60 shadow-lg shadow-slate-950/40 ${
        hoverable ? 'transition hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-xl' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
