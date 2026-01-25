# Tasks: Multi-Source Trend Sourcing

**Input**: Design documents from `/specs/001-multi-source-trends/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-spec.yaml ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `T### [P] [US?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US]**: Which user story this task belongs to (US1/US2/US3)
- Include exact file paths in descriptions

## Test-First Rule (Constitution)

Every task that changes business logic MUST start by adding/updating tests that fail before the implementation and pass after it.

---

## Phase 0: Test Harness & Repo Alignment (Blocking)

- [x] T001 Create/verify `tests/setup.ts` (required by `vitest.config.ts`) and the `tests/unit/`, `tests/integration/`, and `tests/e2e/` directory layout
- [x] T002 Create/verify Playwright tests live in `tests/e2e/` (required by `playwright.config.ts`)
- [x] T003 [P] Add MSW scaffolding for deterministic tests (e.g., `tests/msw/server.ts`, `tests/msw/handlers.ts`) and wire it from `tests/setup.ts`

---

## Phase 1: Shared Foundations (Blocking)

### Tests (write first)

- [x] T010 [P] Unit tests for excerpt capping + HTML stripping + URL normalization in `tests/unit/trends/normalize.test.ts` (targets `lib/trends/normalize.ts`)
- [x] T011 [P] Unit tests for safety filtering in `tests/unit/trends/safety.test.ts` (targets `lib/trends/safety.ts`, per FR-006 definition in spec)
- [x] T012 [P] Unit tests for dedupe logic in `tests/unit/trends/dedupe.test.ts` (targets `lib/trends/dedupe.ts`)
- [x] T013 [P] Unit tests for ingestion job store behavior (TTL, terminal states) in `tests/unit/trends/ingestionJobStore.test.ts` (targets `lib/trends/ingestionJobStore.ts`)

### Implementation (after tests)

- [x] T014 Define trend types in `lib/types/trends.ts` (TrendSourceKind, TrendPost, IngestionRun; include `blocked` and optional metadata fields)
- [x] T015 [P] Implement excerpt capping + HTML stripping + canonical URL helpers in `lib/trends/normalize.ts`
- [x] T016 [P] Implement safety filtering helper in `lib/trends/safety.ts` (blocked items are never stored/displayed; do not persist blocked content)
- [x] T017 [P] Implement dedupe helper in `lib/trends/dedupe.ts` (canonical URL-based + fallback id)
- [x] T018 Define source interfaces in `lib/trends/sources/types.ts` and registry/factory in `lib/trends/sources/registry.ts`
- [x] T019 Implement an HMR-safe in-memory ingestion job store with TTL in `lib/trends/ingestionJobStore.ts` (globalThis singleton)
- [x] T020 Add/verify storage helpers for ingestion runs and trend posts in `lib/utils/storage.ts` (ensure blocked posts are never stored)

---

## Phase 2: User Story 1 (P1) — Free Source Ingestion End-to-End

### Tests (write first)

- [x] T030 [US1] Integration tests for ingestion routes using deterministic mocks (MSW) in `tests/integration/api/trends-ingest.test.ts` (include: happy path, timeouts, empty results, blocked/unsafe filtering)

### Sources

- [x] T031 [US1] Implement Hacker News source in `lib/trends/sources/hackerNews.ts`
- [x] T032 [US1] Implement RSS bundle source in `lib/trends/sources/rssBundle.ts` (curated feed list)
- [x] T033 [US1] Use the RSS/Atom parsing dependency (`fast-xml-parser`) in `lib/trends/sources/rssBundle.ts`

### API routes

- [x] T034 [US1] Implement `POST /api/trends/ingest` in `app/api/trends/ingest/route.ts` (validate request, create job, start async ingestion, return 202 + jobId)
- [x] T035 [US1] Implement `GET /api/trends/ingest/{jobId}` in `app/api/trends/ingest/[jobId]/route.ts` (return status; include posts on completed; terminal states stop polling)
- [x] T036 [US1] Ensure outbound fetches have timeouts and errors are non-sensitive (no credentials/logging)

### UI flow

- [x] T037 [US1] Update config UI to select a trend source (HN / RSS) in `components/config/CredentialsForm.tsx`
- [x] T038 [US1] Update printer UI to start ingestion, poll status, show results, and allow selecting one post in `components/printer/PrinterInterface.tsx`
- [x] T039 [US1] Ensure missing metadata display rules (FR-011) are applied consistently in the selection list and printout
- [x] T040 [US1] Ensure provenance is visible in the printout and in history (verify `components/printer/IdeaPrintout.tsx` + history components)

### Accessibility (WCAG 2.1 AA)

- [x] T041 [US1] Verify keyboard navigation + visible focus for source selection, ingestion controls, and post selection; add screen-reader-friendly status updates for ingestion progress/errors (per NFR-001)

### E2E (after UI)

- [x] T042 [US1] E2E test for the P1 journey (free ingest → select → generate → provenance) in `tests/e2e/trends.spec.ts` (confirm polling stops on terminal states)

---

## Phase 3: User Story 2 (P2) — X/Twitter (Credentialed)

### Tests (write first)

- [x] T050 [US2] Integration tests for credential missing/invalid flows in `tests/integration/api/trends-ingest.test.ts` (include: missing token, invalid token, upstream 401/429)

### Implementation (after tests)

- [x] T051 [US2] Extend config UI to accept X bearer token + query in `components/config/CredentialsForm.tsx`
- [x] T052 [US2] Implement X source in `lib/trends/sources/xTwitter.ts` (query-based ingestion)
- [x] T053 [US2] Enforce "credential required" behavior (clear 401/400 errors, no ingestion starts without config; do not leak credential details)

---

## Phase 4: User Story 3 (P3) — Add Sources Without UX Changes

- [x] T060 [US3] Document source contract and "how to add a new source" in `specs/001-multi-source-trends/quickstart.md`
- [x] T061 [US3] Add a minimal source template (code-only) under `lib/trends/sources/` (no UX changes)

---

## Phase 5: Quality Gates

- [x] T070 Run `npm run lint` and fix issues related to this feature
- [x] T071 Run `npm run type-check` and fix issues related to this feature
- [x] T072 Run unit + integration tests; ensure business-logic coverage stays >= 80%
- [x] T073 Run Playwright E2E for P1 journey and confirm no infinite polling loops
