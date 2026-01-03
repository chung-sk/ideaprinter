/**
 * Deduplication Logic
 *
 * Cross-run deduplication based on canonical URLs and fallback IDs.
 * Per FR-007: User should see a clean list without repeats.
 */

import type { TrendPost } from '@/lib/types/trends';

export type { TrendPost };

/**
 * Deduplicate posts based on canonical URL (primary) or external ID (fallback)
 * Keeps first occurrence and preserves order.
 */
export function deduplicatePosts(posts: TrendPost[]): TrendPost[] {
  const seen = new Set<string>();
  const deduplicated: TrendPost[] = [];

  for (const post of posts) {
    // Build deduplication key
    let key: string | null = null;

    // Primary: canonical URL
    if (post.canonicalUrl) {
      key = `url:${post.canonicalUrl}`;
    }
    // Fallback: external ID + platform
    else if (post.externalId) {
      key = `id:${post.platform}:${post.externalId}`;
    }
    // If neither exists, include the post (can't determine if duplicate)

    if (!key) {
      // No unique identifier - include the post
      deduplicated.push(post);
      continue;
    }

    // Check if we've seen this key before
    if (seen.has(key)) {
      // Skip duplicate
      continue;
    }

    // First occurrence - include and mark as seen
    seen.add(key);
    deduplicated.push(post);
  }

  return deduplicated;
}

/**
 * Merge new posts with existing posts and deduplicate
 * Prioritizes new posts over existing when duplicates are found
 */
export function mergeAndDeduplicatePosts(
  existingPosts: TrendPost[],
  newPosts: TrendPost[]
): TrendPost[] {
  // Combine both sets (NEW posts first to prioritize fresh content)
  const combined = [...newPosts, ...existingPosts];

  // Deduplicate the combined set (keeps first occurrence = new posts)
  return deduplicatePosts(combined);
}
