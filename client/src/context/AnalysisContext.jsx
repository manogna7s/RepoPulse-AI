import { useCallback, useMemo, useState } from 'react'
import AnalysisContext from './analysisContextObject'

/**
 * WHY CONTEXT INSTEAD OF PROP DRILLING?
 * The analysis result is produced on the Home page but consumed on the
 * Dashboard page. Those pages are siblings under the router, so there is no
 * parent to pass props through. Context lets any component read the result
 * without threading props through layouts and unrelated components.
 *
 * It also guarantees we do NOT call the backend a second time after navigation.
 */
export function AnalysisProvider({ children }) {
  const [analysis, setAnalysis] = useState(null)

  const saveAnalysis = useCallback((result) => {
    setAnalysis(result)
  }, [])

  const clearAnalysis = useCallback(() => {
    setAnalysis(null)
  }, [])

  // useMemo keeps the context value stable so consumers do not re-render
  // on every provider render.
  const value = useMemo(
    () => ({
      analysis,
      repository: analysis?.repository ?? null,
      scores: analysis?.scores ?? null,
      engineeringHealth: analysis?.engineeringHealth ?? null,
      technicalDebt: analysis?.technicalDebt ?? [],
      saveAnalysis,
      clearAnalysis,
    }),
    [analysis, saveAnalysis, clearAnalysis],
  )

  return <AnalysisContext.Provider value={value}>{children}</AnalysisContext.Provider>
}

export default AnalysisProvider
