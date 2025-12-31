/**
 * X/Twitter Trend Source
 * Credentialed source - requires bearer token (implemented in Phase 3 / US2)
 */

import type { TrendSourceProvider, RawTrendPost, FetchOptions } from './types'

/**
 * X/Twitter source provider
 * Uses X API v2 recent search endpoint with bearer token authentication
 */
export const XTwitterSource: TrendSourceProvider = {
  kind: 'x_twitter',
  displayName: 'X (Twitter)',
  requiresCredential: true,

  async fetch(options: FetchOptions = {}): Promise<RawTrendPost[]> {
    const { xBearerToken, xQuery = 'AI trends', limit = 30 } = options

    // Validate required credentials
    if (!xBearerToken) {
      throw new Error('X bearer token is required for X/Twitter source')
    }

    // X API v2 endpoint for recent search
    // https://developer.x.com/en/docs/twitter-api/tweets/search/api-reference/get-tweets-search-recent
    const url = new URL('https://api.x.com/2/tweets/search/recent')
    url.searchParams.set('query', xQuery)
    url.searchParams.set('max_results', Math.min(limit, 100).toString())
    url.searchParams.set('tweet.fields', 'created_at,author_id,public_metrics')
    url.searchParams.set('expansions', 'author_id')
    url.searchParams.set('user.fields', 'username')

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${xBearerToken}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000), // 10s timeout
      })

      if (!response.ok) {
        // Handle auth errors
        if (response.status === 401) {
          throw new Error('X API authentication failed - invalid or expired bearer token')
        }
        if (response.status === 429) {
          throw new Error('X API rate limit exceeded - please try again later')
        }
        throw new Error(`X API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // X API v2 response structure
      interface XApiResponse {
        data?: Array<{
          id: string
          text: string
          author_id: string
          created_at?: string
        }>
        includes?: {
          users?: Array<{
            id: string
            username: string
          }>
        }
      }

      const apiData = data as XApiResponse
      if (!apiData.data || apiData.data.length === 0) {
        return []
      }

      // Create username lookup map
      const userMap = new Map<string, string>()
      if (apiData.includes?.users) {
        for (const user of apiData.includes.users) {
          userMap.set(user.id, user.username)
        }
      }

      // Transform to RawTrendPost format
      const posts: RawTrendPost[] = apiData.data.map((tweet) => ({
        externalId: tweet.id,
        author: userMap.get(tweet.author_id) || tweet.author_id,
        content: tweet.text,
        postedAt: tweet.created_at || new Date().toISOString(),
        sourceUrl: `https://twitter.com/${userMap.get(tweet.author_id) || 'i'}/status/${tweet.id}`,
      }))

      return posts
    } catch (error) {
      // Re-throw with sanitized error message (no token leakage)
      if (error instanceof Error) {
        // Remove any potential token from error message
        const sanitizedMessage = error.message.replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]')
        throw new Error(sanitizedMessage)
      }
      throw new Error('Failed to fetch from X/Twitter')
    }
  },
}
