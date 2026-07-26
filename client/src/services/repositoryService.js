import api from './api'
import { toFriendlyError } from '../utils/apiErrors'

/**
 * POST /api/repository/analyze
 * Returns the `data` object from our standard API envelope.
 */
export async function analyzeRepository(url) {
  try {
    const response = await api.post('/repository/analyze', { url })
    return response.data.data
  } catch (error) {
    throw toFriendlyError(error)
  }
}
