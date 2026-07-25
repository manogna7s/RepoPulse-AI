// Simple CSS spinner — no extra library needed for one loading state.
function Spinner({ className = 'h-5 w-5' }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400 ${className}`}
    />
  )
}

export default Spinner
