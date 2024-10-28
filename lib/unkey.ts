import { Unkey } from '@unkey/api'
import { Ratelimit } from '@unkey/ratelimit'

if (!process.env.UNKEY_API_KEY) {
  throw new Error('UNKEY_API_KEY is not set')
}

export const unkeyRateLimit = new Ratelimit({
  rootKey: process.env.UNKEY_API_KEY,
  namespace: 'url.shortner',
  limit: 5,
  duration: '10s',
  async: true,
})

export const unkey = new Unkey({
  rootKey: process.env.UNKEY_API_KEY,
})
