import { useEffect, useState } from 'react'
import { useNavigation } from 'react-router-dom'

/**
 * Thin top progress bar during client-side route transitions.
 * Gives immediate feedback without blocking the UI.
 */
function GlobalLoadingBar() {
  const navigation = useNavigation()
  const [visible, setVisible] = useState(false)

  const isNavigating = navigation.state === 'loading' || navigation.state === 'submitting'

  useEffect(() => {
    if (isNavigating) {
      setVisible(true)
      return undefined
    }

    // Keep the bar visible briefly so short navigations still feel intentional.
    const timer = setTimeout(() => setVisible(false), 200)
    return () => clearTimeout(timer)
  }, [isNavigating])

  if (!visible) return null

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-transparent"
      role="progressbar"
      aria-label="Page loading"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full w-1/3 animate-pulse bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
    </div>
  )
}

export default GlobalLoadingBar
