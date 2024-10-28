'use client'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function Home() {
  const [url, setUrl] = useState('')
  const [tier, setTier] = useState('basic')
  const [shortUrl, setShortUrl] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setShortUrl('')
    setError('')
    setIsLoading(true)

    try {
      if (!url) {
        throw new Error('URL is required')
      }

      if (!tier || typeof tier !== 'string') {
        throw new Error('Tier is required and must be a string')
      }

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, tier }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to shorten URL')
      }

      const data = await response.json()
      if (!data || !data.shortUrl || !data.key) {
        throw new Error('Invalid response data')
      }

      setShortUrl(data.shortUrl)
      document.cookie = `key=${data.key}; path=/;`
    } catch (err: unknown) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const [isPremium, setIsPremium] = useState(false)

  const handleToggle = () => {
    setIsPremium(!isPremium)
    setTier(isPremium ? 'basic' : 'premium')
  }

  return (
    <div className="container flex justify-center items-center h-screen mx-auto p-4">
      <div>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>URL Shortener</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter URL to shorten" className="mb-4" required disabled={isLoading} />
              <div className="mb-4">
                <div className="flex items-center">
                  <span className="mr-2">Basic</span>
                  <Switch checked={isPremium} onCheckedChange={handleToggle} disabled={isLoading} />
                  <span className="ml-2">Premium</span>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Shorten URL'}
              </Button>
            </form>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {shortUrl && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold">Shortened URL:</h2>
                <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                  {shortUrl}
                </a>
                <p className="text-sm text-gray-500 mt-2">This shortened URL is valid for 1 minute.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="mt-4">
          <p>As a premium user, you get the shortest URLs. Basic users get normal length URLs.</p>
        </div>
      </div>
    </div>
  )
}
