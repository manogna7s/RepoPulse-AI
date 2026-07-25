import { useEffect, useState } from 'react'
import { LOADING_MESSAGES } from '../constants'

/**
 * Rotates through progress messages while a request is running.
 * Keeping this in a hook means the UI component stays declarative.
 */
function useLoadingMessage(isLoading, intervalMs = 2500) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!isLoading) {
      setIndex(0)
      return
    }

    const timer = setInterval(() => {
      // Stop at the last message instead of looping, so "Almost done..."
      // stays on screen for long analyses.
      setIndex((current) => Math.min(current + 1, LOADING_MESSAGES.length - 1))
    }, intervalMs)

    return () => clearInterval(timer)
  }, [isLoading, intervalMs])

  return LOADING_MESSAGES[index]
}

export default useLoadingMessage
