import { redis } from '@/lib/redis'
import { nanoid } from 'nanoid'

const urlsKey = 'urls'

// Function to create a short URL
export async function createShortUrl(originalUrl: string, length: number) {
  const shortCode = nanoid(length)
  const urls = (await redis.get(urlsKey)) as Record<string, string>

  if (urls) {
    urls[shortCode] = originalUrl
    await redis.set(urlsKey, JSON.stringify(urls))
  } else {
    await redis.set(urlsKey, JSON.stringify({ [shortCode]: originalUrl }))
  }
  return shortCode
}

// Function to get the original URL from the short code
export async function getOriginalUrl(shortCode: string) {
  const urls = (await redis.get(urlsKey)) as Record<string, string>

  if (urls) {
    return urls[shortCode]
  }

  return null
}

export async function deleteUrl(shortCode: string) {
  const urls = (await redis.get(urlsKey)) as Record<string, string>
  delete urls[shortCode]
  await redis.set(urlsKey, JSON.stringify(urls))
}
