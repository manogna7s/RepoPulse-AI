import ErrorCard from './ErrorCard'

/**
 * Dedicated network/offline failure UI with an optional retry action.
 */
function NetworkError({
  title = 'Network error',
  message = 'We could not reach the RepoPulse API. Check your connection and try again.',
  code = 'NETWORK_ERROR',
  onRetry,
}) {
  return <ErrorCard title={title} message={message} code={code} onRetry={onRetry} />
}

export default NetworkError
