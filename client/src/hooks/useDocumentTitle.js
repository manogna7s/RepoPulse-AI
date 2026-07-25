import { useEffect } from 'react'

// Keeping browser-title behavior in a hook lets pages reuse it without
// duplicating lifecycle code.
function useDocumentTitle(title) {
  useEffect(() => {
    document.title = `${title} | RepoPulse AI`
  }, [title])
}

export default useDocumentTitle
