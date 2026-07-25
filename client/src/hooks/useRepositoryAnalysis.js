import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAnalysis } from '../context/useAnalysis'
import { analyzeRepository } from '../services/repositoryService'
import { validateGitHubUrl } from '../utils/format'

/**
 * Owns the "analyze a repository" workflow: validation, request state, errors,
 * saving to context, and navigation. Pages stay focused on layout.
 */
function useRepositoryAnalysis() {
  const [url, setUrl] = useState('')
  const [validationError, setValidationError] = useState('')
  const [requestError, setRequestError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { saveAnalysis } = useAnalysis()
  const navigate = useNavigate()

  const updateUrl = (value) => {
    setUrl(value)
    // Clear stale messages as soon as the user edits the field.
    if (validationError) setValidationError('')
    if (requestError) setRequestError(null)
  }

  const submit = async (event) => {
    event?.preventDefault()

    // Guard against double submits while a request is in flight.
    if (isLoading) return

    const { valid, message } = validateGitHubUrl(url)
    if (!valid) {
      setValidationError(message)
      return
    }

    setIsLoading(true)
    setRequestError(null)

    try {
      const result = await analyzeRepository(url.trim())
      saveAnalysis(result)
      // Dashboard reads from context, so it never re-requests the analysis.
      navigate('/dashboard')
    } catch (error) {
      setRequestError(error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    url,
    updateUrl,
    submit,
    isLoading,
    validationError,
    requestError,
    clearRequestError: () => setRequestError(null),
  }
}

export default useRepositoryAnalysis
