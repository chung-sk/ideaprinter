/**
 * RSS Bundle Trend Source
 * Free source - aggregates posts from curated RSS/Atom feeds
 */

import { XMLParser } from 'fast-xml-parser'
import type { TrendSourceProvider, RawTrendPost, FetchOptions } from './types'

const REQUEST_TIMEOUT = 5000 // 5 seconds
const DEFAULT_LIMIT = 30

/**
 * Curated list of tech news RSS feeds
 */
const CURATED_FEEDS = [
  'https://techcrunch.com/feed/',
  'https://www.theverge.com/rss/index.xml',
  'https://www.wired.com/feed/rss',
  'https://feeds.arstechnica.com/arstechnica/index',
]

interface RSSItem {
  title?: string
  link?: string
  description?: string
  pubDate?: string
  'dc:creator'?: string
  author?: string
}

interface RSSChannel {
  item?: RSSItem | RSSItem[]
}

interface RSSFeed {
  rss?: {
    channel?: RSSChannel
  }
  feed?: {
    entry?: RSSItem | RSSItem[]
  }
}

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if ((error as Error).name === 'AbortError') {
      throw new Error('Request timeout')
    }
    throw error
  }
}

/**
 * Parse RSS/Atom feed and extract items
 */
function parseFeed(xml: string): RSSItem[] {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })

  const feed: RSSFeed = parser.parse(xml)

  // Handle RSS 2.0
  if (feed.rss?.channel?.item) {
    const items = feed.rss.channel.item
    return Array.isArray(items) ? items : [items]
  }

  // Handle Atom
  if (feed.feed?.entry) {
    const entries = feed.feed.entry
    return Array.isArray(entries) ? entries : [entries]
  }

  return []
}

/**
 * Fetch posts from a single RSS feed
 */
async function fetchFeed(feedUrl: string): Promise<RawTrendPost[]> {
  try {
    const response = await fetchWithTimeout(feedUrl, REQUEST_TIMEOUT)
    if (!response.ok) {
      console.error(`Feed ${feedUrl} returned status ${response.status}`)
      return []
    }

    const xml = await response.text()
    const items = parseFeed(xml)

    return items
      .filter(item => item.title) // Must have a title
      .map(item => {
        // Extract link safely (handle Atom objects or simple strings)
        let link = item.link
        if (typeof link === 'object' && link !== null) {
          // Atom link might be { "@_href": "..." } or similar depending on parser options
          // But fast-xml-parser with ignoreAttributes: false puts attributes in properties prefixed with @_
          // However, if it's an array of links, we take the first one
          // If it's a simple object, we look for href
          // For now, let's try to find a string value or href
          link = link['@_href'] || link['href'] || link['url'] || undefined
        }
        
        if (typeof link !== 'string') {
          link = undefined
        }

        // Ensure content is always a string (XML parser may return objects)
        const content = item.description || item.title
        const contentStr = typeof content === 'string' ? content : String(content || '')
        
        return {
          externalId: link ? `rss-${Buffer.from(link).toString('base64').substring(0, 20)}` : undefined,
          content: contentStr,
          author: item['dc:creator'] || item.author || null,
          postedAt: item.pubDate || null,
          sourceUrl: link,
        }
      })
  } catch (error) {
    console.error(`Failed to fetch feed ${feedUrl}:`, error)
    return []
  }
}

/**
 * RSS Bundle source provider implementation
 */
export const RssBundleSource: TrendSourceProvider = {
  kind: 'rss_bundle',
  displayName: 'Tech News (RSS)',
  requiresCredential: false,

  async fetch(options: FetchOptions = {}): Promise<RawTrendPost[]> {
    const limit = options.limit ?? DEFAULT_LIMIT

    try {
      // Fetch all feeds in parallel
      const feedResults = await Promise.all(
        CURATED_FEEDS.map(feedUrl => fetchFeed(feedUrl))
      )

      // Flatten and limit
      const allPosts = feedResults.flat()
      return allPosts.slice(0, limit)
    } catch {
      // Don't leak internal error details
      throw new Error('Failed to fetch from RSS feeds')
    }
  },
}
