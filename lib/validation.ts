import { verifyKey } from '@unkey/api'

export type ApiKeyValidationResult = { status: 'VALID_KEY' } | { status: 'INVALID_KEY' } | { status: 'EXPIRED_KEY' } | { status: 'RATE_LIMIT_EXCEEDED' } | { status: 'API_ERROR'; error: string } | { status: 'UNKNOWN_ERROR'; error: string }

export const validateApiKey = async (key: string): Promise<ApiKeyValidationResult> => {
  try {
    const { result, error } = await verifyKey(key)

    if (error) {
      return { status: 'API_ERROR', error: error.message }
    }

    if (result.code === 'EXPIRED') {
      return { status: 'EXPIRED_KEY' }
    } else if (result.code === 'RATE_LIMITED') {
      return { status: 'RATE_LIMIT_EXCEEDED' }
    }

    if (result.valid) {
      return { status: 'VALID_KEY' }
    }

    return { status: 'INVALID_KEY' }
  } catch (error) {
    console.log('error :', error)

    return {
      status: 'UNKNOWN_ERROR',
      error: 'An error occurred while validating the API key.',
    }
  }
}
