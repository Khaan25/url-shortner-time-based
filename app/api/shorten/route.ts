import { unkey, unkeyRateLimit } from '@/lib/unkey'
import { createShortUrl } from '@/utils/db'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

const unkeyApiKey = process.env.UNKEY_API_KEY

if (!unkeyApiKey) {
  throw new Error('UNKEY_API_KEY is not set')
}

const getClientIp = (req: NextRequest): string => {
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip
}

export async function POST(request: NextRequest) {
  // Get the client's IP address
  const ip = getClientIp(request)

  // Check the rate limit
  const rateLimitResponse = await unkeyRateLimit.limit(ip, { cost: 2 })

  // If the rate limit is exceeded, respond with an error
  if (!rateLimitResponse.success) {
    return NextResponse.json({ message: 'Rate limit exceeded. Please try again later.' }, { status: 429 })
  }

  const requestBody = await request.json()

  // Check if the request body contains the required fields
  if (!requestBody || typeof requestBody !== 'object' || requestBody === null) {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400 })
  }

  const { url, tier, ownerId = 'OWNER_ID', guestId = 'GUEST_ID' } = requestBody

  // Check if URL is provided and is a string
  if (!url || typeof url !== 'string') {
    return new Response(JSON.stringify({ error: 'URL is required and must be a string' }), { status: 400 })
  }

  // Check if tier is provided and is a string
  if (!tier || typeof tier !== 'string') {
    return new Response(JSON.stringify({ error: 'Tier is required and must be a string' }), { status: 400 })
  }

  const { error, key } = await handleKeys(ownerId, guestId)

  if (error) {
    return NextResponse.json({ message: error }, { status: 400 })
  }

  // Generate short URL based on the user's tier
  let shortCode

  if (tier === 'premium') {
    shortCode = await createShortUrl(url, 5) // Shorter URLs for premium users
  } else if (tier === 'basic') {
    shortCode = await createShortUrl(url, 8) // Longer URLs for basic users
  } else {
    return new Response(JSON.stringify({ error: 'Invalid tier. Only "premium" and "basic" are accepted.' }), { status: 400 })
  }

  return new Response(JSON.stringify({ shortUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/${shortCode}`, key }), { status: 200 })
}

async function handleKeys(ownerId: string, guestId: string) {
  const cookieStore = await cookies()
  const oldKey = cookieStore.get('key')?.value

  if (oldKey) {
    // Delete the old key
    await unkey.keys.delete({ keyId: oldKey })
  }

  if (!process.env.UNKEY_API_ID) {
    throw new Error('UNKEY_API_ID is not set')
  }

  // Create a new API key
  const newKey = await unkey.keys.create({
    apiId: process.env.UNKEY_API_ID,
    prefix: 'url',
    byteLength: 16,
    ownerId,
    meta: { guestId },
    expires: Date.now() + 1 * 60 * 1000, // two minutes since now
    ratelimit: {
      duration: 3000,
      limit: 1,
    },
    enabled: true,
  })

  if (newKey.error) {
    return { error: newKey.error.message, key: null }
  }

  return { error: null, key: newKey.result.key }
}
