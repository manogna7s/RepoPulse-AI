import { useContext } from 'react'
import AnalysisContext from './analysisContextObject'

/**
 * Small hook so components never import the raw context object.
 * Lives in its own file so the provider file only exports a component
 * (required for React Fast Refresh to work reliably).
 */
export function useAnalysis() {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error('useAnalysis must be used inside an AnalysisProvider')
  }
  return context
}

export default useAnalysis
