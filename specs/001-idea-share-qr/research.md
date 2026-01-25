# Research: Shareable Idea QR

**Feature**: `001-idea-share-qr`  
**Date**: 2026-01-02

## Question 1: URL-safe compression approach for share payload

**Decision**: Use browser-native APIs only (no additional dependencies)

**Rationale**:

- **Target**: Share URL max 1000 characters (from clarifications session 2026-01-02)
- **Current data**: Typical idea JSON is ~500-800 bytes; with query param overhead, base64 encoding adds ~33% size
- **Approach**:
  - Base64url encoding via `btoa()` + `atob()` (browser-native)
  - No compression library needed unless real-world testing shows we exceed 1000 chars consistently
  - If needed later, `lz-string` (6KB gzipped) is a lightweight option
- **Bundle impact**: Zero additional bytes (browser APIs only)
- **Implementation**: Use `btoa(encodeURIComponent(JSON.stringify(payload)))` pattern with error handling

**Alternative Rejected**: Adding `lz-string` or similar upfront. Reason: Adds bundle size before validating necessity. Spec requires enforcement via guard + error state (FR-011/SC-006), so exceeding 1000 chars will show clear error instead of silently failing.

**Follow-up**: T023 will implement the 1000-char guard; if real-world usage hits the limit frequently, revisit compression in a future iteration.

---

## Question 2: Support "share to other people" + "history view on same device"

**Decision**: Single payload-based share URL pattern for both use cases

**Rationale**:

- Share link uses `?data=<encoded_payload>` (self-contained; works cross-device/incognito)
- History "View" action reuses the same share URL format (navigates to `/share?data=...`)
- No separate "ideaId" lookup needed; simplifies implementation and reduces maintenance
- Payload includes all fields needed for view + export (name, category, concept, gap, fix, timestamp, sourceUrl)

**Legacy support**: Share page will attempt to decode both new versioned payload and legacy raw JSON (if any old links exist).

---

## Question 3: Source and display the "Source URL"

**Decision**: Add `sourceUrl` to idea data model and exports

**Rationale**:

- Ideas generated from trends already have provenance data (see `lib/types/idea.ts`)
- Extend or use existing `provenance.sourceUrl` field
- Exports (`.md`/`.txt`) include "Source URL: <url>" or "Source URL: Not available"
- Share view displays Source URL when present

**Implementation**: T008/T009 will add Source URL to export formatting; T015 will ensure share page displays it.

---

## Question 4: Share base URL shows `ideaprinter.rytix.tech` in production

**Decision**: Use `NEXT_PUBLIC_SITE_ORIGIN` env var with runtime fallback

**Rationale**:

- Production deployments set `NEXT_PUBLIC_SITE_ORIGIN=https://ideaprinter.rytix.tech`
- Local dev: when env var is unset, fall back to `window.location.origin` (e.g., `http://localhost:3000`)
- Ensures exports and displayed URLs show the correct domain context-aware
- No hardcoded production domain in code (satisfies constitution principle I: no hardcoded env-specific config)

**Implementation**: T004 will implement `lib/share/siteOrigin.ts` with this logic + unit tests.
