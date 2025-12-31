/**
 * Trend Source Registry
 * 
 * Factory for selecting and instantiating trend source providers.
 */

import type { TrendSourceKind } from '@/lib/types/trends'
import type { TrendSourceProvider } from './types'
import { HackerNewsSource } from './hackerNews'
import { RssBundleSource } from './rssBundle'
import { XTwitterSource } from './xTwitter'

const SOURCES: Record<TrendSourceKind, TrendSourceProvider> = {
  hackernews: HackerNewsSource,
  rss_bundle: RssBundleSource,
  x_twitter: XTwitterSource,
}

/**
 * Get a source provider by kind
 */
export function getSource(kind: TrendSourceKind): TrendSourceProvider {
  const source = SOURCES[kind]
  
  if (!source) {
    throw new Error(`Unknown source kind: ${kind}`)
  }
  
  return source
}

/**
 * List all available sources
 */
export function listSources(): TrendSourceProvider[] {
  return Object.values(SOURCES)
}

/**
 * Check if a source kind is valid
 */
export function isValidSourceKind(kind: string): kind is TrendSourceKind {
  return kind in SOURCES
}
