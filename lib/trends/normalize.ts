/**
 * Normalization Helpers
 *
 * Excerpt capping, HTML stripping, and URL canonicalization for trend posts.
 * Per SC-005: No excerpt may exceed 280 characters.
 */

import type { TrendSourceKind, TrendPost } from '@/lib/types/trends';
import type { RawTrendPost } from './sources/types';

const MAX_EXCERPT_LENGTH = 280;

/**
 * Cap excerpt to maximum 280 characters
 */
export function capExcerpt(text: string): string {
  if (text.length <= MAX_EXCERPT_LENGTH) {
    return text;
  }
  return text.substring(0, MAX_EXCERPT_LENGTH);
}

/**
 * Strip HTML tags and decode entities
 */
export function stripHtml(html: string): string {
  if (!html) return '';

  // Ensure html is a string (guard against non-string values)
  const htmlStr = typeof html === 'string' ? html : String(html);

  // Remove HTML tags
  let text = htmlStr.replace(/<[^>]*>/g, ' ');

  // Decode common HTML entities
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  };

  Object.entries(entities).forEach(([entity, char]) => {
    text = text.replace(new RegExp(entity, 'g'), char);
  });

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Canonicalize URL for deduplication
 * - Normalize protocol (http/https → https)
 * - Lowercase domain
 * - Remove trailing slashes
 * - Remove query parameters
 * - Remove fragment identifiers
 */
export function canonicalizeUrl(url: string): string {
  if (!url) return '';

  try {
    const urlObj = new URL(url);

    // Normalize to HTTPS
    const protocol = 'https:';

    // Build canonical form
    const canonical = `${protocol}//${urlObj.hostname.toLowerCase()}${urlObj.pathname}`;

    // Remove trailing slash
    return canonical.replace(/\/$/, '');
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Normalize a raw trend post from a source provider
 */
export function normalizeTrendPost(rawPost: RawTrendPost, sourceKind: TrendSourceKind): TrendPost {
  const strippedContent = stripHtml(rawPost.content);
  const excerpt = capExcerpt(strippedContent);

  const canonicalUrl = rawPost.sourceUrl ? canonicalizeUrl(rawPost.sourceUrl) : null;

  // Generate a unique ID based on external ID or canonical URL
  const id =
    rawPost.externalId ||
    (canonicalUrl
      ? `url-${Buffer.from(canonicalUrl).toString('base64').substring(0, 20)}`
      : `tmp-${Date.now()}`);

  return {
    id,
    platform: sourceKind,
    externalId: rawPost.externalId,
    author: rawPost.author,
    excerpt,
    postedAt: rawPost.postedAt,
    sourceUrl: rawPost.sourceUrl,
    canonicalUrl: canonicalUrl || undefined,
    sourceKind,
    blocked: false,
  };
}
