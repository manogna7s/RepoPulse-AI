import { Link } from 'react-router-dom'
import Button from '../ui/Button'
import Card from '../ui/Card'

/**
 * Consistent empty-screen pattern used when there is nothing to show yet.
 */
function EmptyState({
  title,
  message,
  actionLabel = 'Go home',
  actionTo = '/',
  secondaryLabel,
  secondaryTo,
}) {
  return (
    <Card className="mx-auto max-w-xl p-10 text-center" role="status">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link to={actionTo}>
          <Button>{actionLabel}</Button>
        </Link>
        {secondaryLabel && secondaryTo && (
          <Link to={secondaryTo}>
            <Button variant="secondary">{secondaryLabel}</Button>
          </Link>
        )}
      </div>
    </Card>
  )
}

export default EmptyState
