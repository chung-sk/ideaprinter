# Data Model: Multi-Source Trend Sourcing

**Date**: 2025-12-30  
**Feature**: [spec.md](spec.md)

This describes the conceptual entities and validation rules (not code).

## Entity: TrendSource

Represents a selectable ingestion source.

**Fields**

- `id`: stable identifier (string)
- `kind`: enum-like value (e.g., `hacker_news`, `tech_news_rss`, `x_twitter`, future: `reddit`)
- `displayName`: human-readable label
- `requiresCredential`: boolean
- `config`: per-source configuration (see below)

**Validation rules**

- `kind` must be one of supported values
- `displayName` must be non-empty
- If `requiresCredential` is true, required credential fields must be present before ingestion starts

## Entity: TrendPost

A normalized representation of a single external item.

**Fields**

- `id`: unique ID within the app (string)
- `platform`: source platform label (`hackernews`, `rss`, `x` / `twitter`, etc.)
- `externalId`: external ID (optional/empty if not available)
- `author`: best-available author identifier (optional)
- `excerpt`: short text excerpt (max 280 chars)
- `postedAt`: ISO timestamp (optional)
- `sourceUrl`: URL to original content (optional but strongly preferred)
- `canonicalUrl`: normalized URL for dedupe (optional)
- `blocked`: boolean (if true, must not be stored/displayed)

**Validation rules**

- `id` must be non-empty
- `excerpt.length <= 280`
- `sourceUrl` should be present if the source provides it; if missing, UI must show “no link available”
- If `blocked` is true: do not persist in local storage and do not display

## Entity: IngestionRun

Represents a single ingestion job/run.

**Fields**

- `id`: job ID
- `trendSourceId`: reference to TrendSource
- `status`: `pending | running | completed | failed`
- `startedAt`: ISO timestamp
- `completedAt`: ISO timestamp (optional)
- `ingestedCount`: number
- `skippedCount`: number
- `error`: string (optional)
- `posts`: `TrendPost[]` (only included when completed)

**State transitions**

- `pending -> running -> completed`
- `pending -> running -> failed`
- `pending -> failed` (if validation fails before starting)

**Validation rules**

- terminal statuses are `completed` and `failed`
- polling MUST stop once terminal status is reached

## Entity: TrendProvenance

Subset of fields stored on a GeneratedIdea.

**Fields**

- `sourceKind` / `platform`
- `sourceUrl`
- `author` (optional)
- `postedAt` (optional)
- `excerpt` (optional)

**Validation rules**

- Must not exceed excerpt cap
- Must always reference the selected TrendPost (by URL or by stored TrendPost id)

## Entity: GeneratedIdea (extension)

Existing GeneratedIdea is extended with optional provenance.

**Fields**

- `trendProvenance`: optional `TrendProvenance`

**Validation rules**

- When generated “from trend post”, `trendProvenance` must be present
