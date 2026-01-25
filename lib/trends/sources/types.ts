/**
 * Trend Source Types and Interfaces
 *
 * Defines the contract for trend source providers.
 */

import type { TrendSourceKind } from '@/lib/types/trends';

export interface TrendSourceProvider {
  /**
   * Source kind identifier
   */
  kind: TrendSourceKind;

  /**
   * Human-readable display name
   */
  displayName: string;

  /**
   * Whether this source requires credentials
   */
  requiresCredential: boolean;

  /**
   * Fetch trend posts from this source
   *
   * @param options - Fetch options (limit, credentials, etc.)
   * @returns Array of raw trend posts
   * @throws Error if fetch fails or credentials are invalid
   */
  fetch(options: FetchOptions): Promise<RawTrendPost[]>;
}

export interface FetchOptions {
  limit?: number;
  xBearerToken?: string;
  xQuery?: string;
}

export interface RawTrendPost {
  externalId?: string;
  author?: string | null;
  content: string;
  postedAt?: string | null;
  sourceUrl?: string | null;
}
