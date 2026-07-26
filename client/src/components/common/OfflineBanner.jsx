import { useEffect, useState } from 'react'

/**
 * Shows a non-blocking banner when the browser reports offline status.
 */
function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false,
  )

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)
    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-500/40 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-100"
    >
      You appear to be offline. Some features will not work until your connection returns.
    </div>
  )
}

export default OfflineBanner
