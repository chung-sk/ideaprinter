# Research: Multi-Source Trend Sourcing

**Date**: 2025-12-30  
**Feature**: [spec.md](spec.md)

This document resolves technical decisions needed to implement the feature while keeping the spec technology-agnostic.

## Decision 1: Use a Provider Registry (“Source Providers”)

- **Decision**: Implement a small provider interface (one module per source) and a registry/factory that selects a provider by `trendSourceKind`.
- **Rationale**: Minimizes coupling and makes it easy to add sources like Reddit later without changing UX flows.
- **Alternatives considered**:
  - One monolithic ingestion function: rejected because new sources would increase complexity and risk regressions.
  - Vendor-only (Apify): rejected due to reliability/cost issues and plan restrictions.

## Decision 2: Free MVP Sources

- **Decision**: MVP supports:
  - **Hacker News** (public API) for tech discussion signal.
  - **Tech News RSS bundle** (curated list of feeds) for editorial/industry signal.
- **Rationale**: Both are free, stable, and relevant to market/tech gaps.
- **Alternatives considered**:
  - Reddit first: possible, but a curated RSS bundle is simpler and less brittle as an MVP.
  - Google Trends: often limited/region-specific and less “post-like” for provenance.

## Decision 3: Credentialed Social Source (P2)

- **Decision**: Support **X/Twitter** using an official credential (bearer token) via a stable, documented endpoint for “recent posts” matching a user-provided query.
- **Rationale**: True “trending” endpoints vary and may require elevated access; query-based ingestion still provides timely signals and supports provenance.
- **Alternatives considered**:
  - “Trending topics by location” endpoints: rejected for uncertainty and access constraints.

## Decision 4: RSS Parsing

- **Decision**: Use a lightweight RSS/Atom XML parsing library in server-side ingestion, plus basic HTML stripping for descriptions.
- **Rationale**: Node/Next route handlers do not have browser DOM parsers; a small parser is more robust than regex parsing.
- **Alternatives considered**:
  - Regex-based XML parsing: rejected as brittle.

## Decision 5: Shared Normalization + Safety Pipeline

- **Decision**: All providers return raw items that are normalized into the existing TrendPost-ish shape via shared helpers:
  - enforce **excerpt cap** (280 chars)
  - remove HTML from feed content
  - compute canonical URL when possible
  - apply safety/blocked filtering
- **Rationale**: Keeps safety/performance constraints consistent across sources.
- **Alternatives considered**:
  - Provider-specific normalization: rejected because it duplicates safety/cap logic.

## Decision 6: Job Model and Polling

- **Decision**: Use async ingestion jobs with immediate `202 Accepted` response; client polls status until terminal state.
- **Rationale**: Meets performance requirements and avoids long request times.
- **Alternatives considered**:
  - Synchronous ingestion: rejected due to variable latency and risk of serverless timeouts.

## Decision 7: In-Memory Job Store (with HMR-safe Singleton)

- **Decision**: Keep an in-memory job store with TTL, implemented as a singleton via `globalThis` so it behaves predictably in dev.
- **Rationale**: Avoids adding DB/Redis for this app’s scope while preventing dev-mode “job not found” issues.
- **Alternatives considered**:
  - Redis: rejected as unnecessary operational complexity for MVP.

## Decision 8: Credential Handling

- **Decision**:
  - Store credentials encrypted in the browser (consistent with existing app).
  - Decrypt on the client and send to the ingestion route over HTTPS.
  - Never log credentials.
- **Rationale**: Server cannot access browser session secrets; client-side decrypt avoids server decryption pitfalls.
- **Alternatives considered**:
  - Server-side decrypt with browser-derived key: rejected (no sessionStorage on server).

## Decision 9: Testing Strategy

- **Decision**:
  - Unit tests for normalization/dedupe.
  - Integration tests for API routes using request/response objects and mocked provider fetches.
  - E2E test for P1 flow.
- **Rationale**: Meets constitution testing requirements and avoids external dependencies.
- **Alternatives considered**:
  - Live tests against real sources: rejected (flaky, rate limits, non-deterministic).
