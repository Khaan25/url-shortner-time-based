import { validateApiKey } from '@/lib/validation'
import { deleteUrl, getOriginalUrl } from '@/utils/db'
import { cookies } from 'next/headers'

import { NextResponse } from 'next/server'

export const revalidate = 0

type Params = Promise<{ shortCode: string }>

export async function GET(request: Request, segmentData: { params: Params }) {
  const params = await segmentData.params
  const shortCode = params.shortCode

  if (!shortCode) {
    return NextResponse.json({ error: 'Short code is required' }, { status: 400 })
  }

  const cookieStore = await cookies()
  const key = cookieStore.get('key')?.value

  if (!key) {
    return NextResponse.json({ message: 'API key is required' }, { status: 400 })
  }

  const validationResult = await validateApiKey(key)

  switch (validationResult.status) {
    case 'INVALID_KEY':
      return NextResponse.json({ message: 'Invalid API key' }, { status: 401 })

    case 'EXPIRED_KEY':
      await deleteUrl(shortCode)
      cookieStore.delete('key')
      return NextResponse.json({ message: 'The link has expired' }, { status: 403 })

    case 'RATE_LIMIT_EXCEEDED':
      return NextResponse.json({ message: 'Too many requests. Please try again later' }, { status: 429 })

    case 'API_ERROR':
      console.error('Key validation API error:', validationResult.error)
      return NextResponse.json({ message: 'Internal server error. Please try again later' }, { status: 500 })

    case 'UNKNOWN_ERROR':
      console.error('Key validation unknown error:', validationResult.error)
      return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 })
  }

  const originalUrl = await getOriginalUrl(shortCode)

  if (originalUrl) {
    // Disable caching for the redirect response
    return NextResponse.redirect(originalUrl, 301).headers.append('Cache-Control', 'no-cache, no-store, must-revalidate')
  } else {
    return NextResponse.json({ error: 'Short URL not found' }, { status: 404 })
  }
}
