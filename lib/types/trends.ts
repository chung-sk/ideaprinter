/**
 * Trend Types
 *
 * Core types for multi-source trend ingestion per data-model.md.
 */

export type TrendSourceKind = 'hackernews' | 'rss_bundle' | 'x_twitter';

export interface TrendPost {
  id: string;
  platform: string;
  externalId?: string;
  author?: string | null;
  excerpt: string;
  postedAt?: string | null;
  sourceUrl?: string | null;
  canonicalUrl?: string | null;
  sourceKind?: TrendSourceKind;
  blocked?: boolean;
}

export interface TrendSource {
  id: string;
  kind: TrendSourceKind;
  displayName: string;
  requiresCredential: boolean;
  config?: Record<string, unknown>;
}

export type IngestionStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface IngestionRun {
  id: string;
  trendSourceId: string;
  source: TrendSourceKind;
  status: IngestionStatus;
  startedAt: string;
  completedAt?: string | null;
  ingestedCount: number;
  skippedCount: number;
  error?: string | null;
  posts?: TrendPost[];
  xQuery?: string;
  limit?: number;
}

export interface TrendProvenance {
  sourceKind: TrendSourceKind;
  platform: string;
  sourceUrl?: string | null;
  author?: string | null;
  postedAt?: string | null;
  excerpt?: string;
}
