import { createContext } from 'react'

// The context object lives alone so both the provider component and the
// consumer hook can import it without creating a circular dependency.
const AnalysisContext = createContext(null)

export default AnalysisContext
