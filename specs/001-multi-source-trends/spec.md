# Feature Specification: Multi-Source Trend Sourcing

**Feature Branch**: `001-multi-source-trends`  
**Created**: 2025-12-30  
**Status**: Draft  
**Input**: User description: "Option B: Multi-source trend sourcing. Replace Apify-only ingestion with a provider-based approach supporting Twitter/X via official API, plus free tech-news sources (Hacker News and RSS feeds) with a path to add Reddit and other sources. Keep existing TrendPost normalization, safety (excerpt-only), dedupe, provenance, and UI flows (config -> ingest -> select -> generate -> history)."

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Ingest Free Tech Trends (Priority: P1)

In order to generate better ideas without paid scrapers, as a user I want to ingest trend posts from at least one free tech/news source (e.g., Hacker News and tech-news feeds) so I can select a trend post and generate an idea with clear provenance.

**Why this priority**: This provides an MVP that works with no paid plans and minimal setup, proving the end-to-end value (trend → idea) immediately.

**Independent Test**: Can be fully tested by ingesting from a free source, selecting one post, generating an idea, and verifying the printout includes provenance back to that post.

**Acceptance Scenarios**:

1. **Given** the app has no saved trend posts, **When** the user chooses a free source and starts ingestion, **Then** the system shows ingestion progress and eventually displays a list of ingested posts.
2. **Given** ingested posts are available, **When** the user selects a post and generates an idea, **Then** the idea output includes provenance pointing to the selected post (source, author, date/time when available, and link).
3. **Given** the same ingestion is run multiple times, **When** results contain repeats, **Then** duplicates are removed so the user is not shown repeated posts.
4. **Given** the source returns long content, **When** posts are stored and displayed, **Then** only a short excerpt is stored and shown (never full content).

---

### User Story 2 - Ingest X/Twitter Trends With Credential (Priority: P2)

As a user who has access to an official X/Twitter credential, I want to ingest trend posts from X/Twitter so I can generate ideas grounded in real-time social signals while still using the same workflow.

**Why this priority**: X offers the fastest-moving “trend” signal, but it requires credentials; keeping it as P2 preserves a usable free MVP while enabling higher-signal ingestion for users who can configure it.

**Independent Test**: Can be tested by configuring valid credentials, ingesting posts from X, selecting a post, generating an idea, and verifying provenance.

**Acceptance Scenarios**:

1. **Given** the user has not configured an X credential, **When** they attempt to ingest from X, **Then** the system clearly indicates configuration is required and does not start ingestion.
2. **Given** the user has configured an X credential, **When** they ingest from X, **Then** the system ingests posts and displays them in the same normalized list view as other sources.
3. **Given** the user provides an invalid X credential, **When** they attempt ingestion, **Then** the system fails gracefully with a user-friendly error and does not expose sensitive credential details.

---

### User Story 3 - Add More Sources Without UX Changes (Priority: P3)

As a user, I want the system to be able to add new trend sources (such as Reddit or additional tech/news feeds) without changing how I interact with the feature so the app can evolve beyond X.

**Why this priority**: This ensures the approach is scalable and avoids a repeat of vendor lock-in; it is valuable but not required for the MVP.

**Independent Test**: Can be tested by enabling a new source, ingesting posts, and verifying they appear and behave identically to existing sources (ingest → select → generate → history).

**Acceptance Scenarios**:

1. **Given** a new source is enabled, **When** the user ingests from that source, **Then** ingested posts appear in the same normalized list view and can be selected to generate an idea.
2. **Given** different sources return different metadata, **When** posts are displayed, **Then** the UI shows best-available fields and remains usable even when some fields are missing.

---

### Edge Cases

- Source returns zero results (e.g., too-narrow query or no current items).
- Source is temporarily unavailable or times out.
- Credential is missing/invalid/expired (credentialed sources only).
- Source returns duplicate items across runs.
- Source returns malformed items (missing URL, missing author, missing timestamp).
- Source content includes unsafe/blocked content that must not be stored.
- User starts ingestion and refreshes the page while ingestion is in progress.
- User initiates ingestion repeatedly (spam-click).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support ingestion from at least one free source that requires no paid plan (including at least Hacker News and at least one tech-news feed bundle).
- **FR-002**: System MUST support ingestion from at least one credentialed social source (X/Twitter) using an official credential.
- **FR-003**: System MUST present a single, consistent user workflow across all sources: configure (if needed) → ingest → view/select post → generate idea → view history.
- **FR-004**: System MUST normalize all ingested items into a consistent “Trend Post” shape containing, at minimum: unique identifier, source/platform, excerpt, and source link (or a clearly indicated absence).
- **FR-005**: System MUST store and display only short excerpts of source content (never full content) for trend posts.
- **FR-006**: System MUST apply safety filtering so blocked/unsafe items are not stored or displayed.
- **FR-007**: System MUST deduplicate ingested posts across runs so the user sees a clean list.
- **FR-008**: System MUST allow the user to select a single trend post to use as the basis for generating an idea.
- **FR-009**: System MUST attach provenance to generated ideas that references the selected trend post (source, author when available, posted time when available, and link when available).
- **FR-010**: System MUST show provenance in the idea output and in idea history.
- **FR-011**: System MUST handle missing optional metadata (author, timestamp, etc.) gracefully without breaking ingestion, selection, or generation.
- **FR-012**: System MUST provide clear, non-sensitive error messages when ingestion fails (e.g., invalid credential, unavailable source, timeouts).
- **FR-013**: System MUST prevent infinite polling loops by surfacing terminal job states (completed/failed) and stopping polling on terminal states.

#### Safety filtering definition (FR-006)

For this feature, “blocked/unsafe” means a trend post that the system determines should not be shown to the user or used as an input to idea generation. The system MUST treat a post as blocked if any of the following are true:

- The content appears to contain disallowed categories such as: hate/harassment, explicit sexual content, sexual content involving minors, instructions for wrongdoing/illegal activity, or self-harm content.
- The content appears to include secrets/credentials/PII that should not be persisted or displayed.

When a post is blocked:

- It MUST NOT be stored or displayed.
- It MUST NOT be selectable for idea generation.
- The ingestion run may record it only as a skipped count (or equivalent), without storing the blocked content itself.

#### Missing metadata display rules (FR-011)

When a source does not provide optional fields (such as author, timestamp, or link), the system MUST:

- Continue ingestion and allow selection/generation normally.
- Display best-available information without breaking layout.
- Use clear placeholders when needed:
  - Missing author: display “Unknown author” (or omit the author row entirely).
  - Missing timestamp: display “Unknown time” (or omit the timestamp row entirely).
  - Missing link/URL: display “No link available” and do not render a clickable link.

### Non-Functional Requirements

- **NFR-001 (Accessibility)**: Any new or changed UI for this feature (config, ingestion flow, selection UI, status messages) MUST meet WCAG 2.1 AA expectations: keyboard navigable, visible focus, non-color-only affordances, and screen-reader-friendly status updates for ingestion progress/errors.

### Key Entities *(include if feature involves data)*

- **Trend Source**: A selectable source category representing where posts come from (e.g., X/Twitter, Hacker News, Tech News Feeds, Reddit).
- **Trend Ingestion Run**: A record of a single ingestion attempt, including selected source, timestamps, status (queued/running/completed/failed), and a count of posts ingested.
- **Trend Post**: A normalized representation of a single trend item with: id, source/platform, external reference (when available), author (when available), excerpt, postedAt (when available), and sourceUrl.
- **Trend Provenance**: A subset of Trend Post information attached to a generated idea that allows users to trace the idea back to the original trend item.
- **Generated Idea**: An idea object that includes the core idea output plus optional trend provenance.

## Assumptions & Dependencies

- The MVP free sources do not require user accounts or paid plans to fetch public content.
- “Trend posts” are defined per source as a reasonable, user-facing list of timely items (not necessarily a location-based “trending” algorithm).
- For tech-news feeds, the MVP uses a small curated bundle rather than requiring users to manage arbitrary feed URLs.
- For credentialed sources (X/Twitter), the user is responsible for obtaining and providing valid credentials.
- The existing safety and excerpt-only constraints remain in effect for all sources.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can complete the end-to-end flow (ingest → select → generate) in under 3 minutes using a free source.
- **SC-002**: Ingestion from free sources completes successfully in at least 95% of attempts under normal network conditions.
- **SC-003**: Generated ideas include provenance for 100% of trend-driven generations (even if some provenance fields are “unknown” due to missing metadata).
- **SC-004**: Duplicate trend posts shown to the user after repeated ingestion runs are reduced to near-zero (no more than 1 duplicate per 50 posts displayed).
- **SC-005**: No stored trend post excerpt exceeds 280 characters (0 instances above the cap when sampling 1,000 stored posts).

