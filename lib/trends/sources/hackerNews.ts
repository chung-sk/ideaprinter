/**
 * Hacker News Trend Source
 * Free source - fetches top stories from Hacker News API
 */

import type { TrendSourceProvider, RawTrendPost, FetchOptions } from './types';

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';
const DEFAULT_LIMIT = 30;
const REQUEST_TIMEOUT = 15000; // 15 seconds (increased for production/cold starts)

interface HNItem {
  id: number;
  title?: string;
  url?: string;
  by?: string;
  time?: number;
  text?: string;
}

/**
 * Fetch with timeout wrapper
 */
async function fetchWithTimeout(url: string, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Fetch a single HN item
 */
async function fetchItem(id: number): Promise<HNItem | null> {
  try {
    const response = await fetchWithTimeout(`${HN_API_BASE}/item/${id}.json`, REQUEST_TIMEOUT);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch HN item ${id}:`, error);
    return null;
  }
}

/**
 * Hacker News source provider implementation
 */
export const HackerNewsSource: TrendSourceProvider = {
  kind: 'hackernews',
  displayName: 'Hacker News',
  requiresCredential: false,

  async fetch(options: FetchOptions = {}): Promise<RawTrendPost[]> {
    const limit = options.limit ?? DEFAULT_LIMIT;

    try {
      // Fetch top story IDs
      const response = await fetchWithTimeout(`${HN_API_BASE}/topstories.json`, REQUEST_TIMEOUT);
      if (!response.ok) {
        throw new Error(`HN API returned status ${response.status}`);
      }

      const storyIds: number[] = await response.json();
      const topIds = storyIds.slice(0, limit);

      // Fetch details for each story (in parallel)
      const items = await Promise.all(topIds.map((id) => fetchItem(id)));

      // Filter out nulls and convert to RawTrendPost
      const posts: RawTrendPost[] = items
        .filter((item): item is HNItem => item !== null)
        .filter((item) => item.title) // Must have a title
        .map((item) => ({
          externalId: `hn-${item.id}`,
          content: item.text || item.title!, // Use text for Ask HN, otherwise title
          author: item.by,
          postedAt: item.time ? new Date(item.time * 1000).toISOString() : null,
          sourceUrl: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
        }));

      return posts;
    } catch (error) {
      // Don't leak internal error details
      if (error instanceof Error && error.message === 'Request timeout') {
        throw new Error('Hacker News API timeout - please try again');
      }
      throw new Error('Failed to fetch from Hacker News');
    }
  },
};
