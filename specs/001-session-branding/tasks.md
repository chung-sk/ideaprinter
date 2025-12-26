---

description: "Task list for feature implementation"

---

# Tasks: Anonymous Session Limits & Branding

**Note (history preserved)**: Phases 1–6 below reflect the original per-session quota implementation and remain here for audit/history. The feature has since pivoted (per updated spec) to a shared/default-key **global** daily quota; see Phase 7 for the implemented pivot tasks.

**Input**: Design documents from `/specs/001-session-branding/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare test and configuration scaffolding required by the constitution.

- [x] T001 Align env var naming for session signing (use SESSION_SECRET in docs + code; ensure .env.example matches)
- [x] T002 [P] Create test folders tests/unit/, tests/integration/api/, tests/e2e/
- [x] T003 [P] Add Vitest config and setup in vitest.config.ts and tests/setup.ts
- [x] T004 [P] Add Playwright config in playwright.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core session/quota primitives that MUST be complete before user story work.

- [x] T005 Confirm quota concurrency approach and document it in specs/001-session-branding/research.md
- [x] T006 Implement signed session/quota token utilities in lib/auth/sessionToken.ts
- [x] T007 [P] Add unit tests for quota window logic in tests/unit/lib/auth/sessionToken.test.ts
- [x] T008 Implement GET session endpoint in app/api/session/route.ts
- [x] T009 [P] Add integration test for GET /api/session in tests/integration/api/session.test.ts

**Checkpoint**: Session identity + quota state can be issued/read server-side.

---

## Phase 3: User Story 1 - Anonymous Session Tracking + Call Limits (Priority: P1) 🎯 MVP

**Goal**: Enforce per-session call limits for idea generation without requiring login.

**Independent Test**: From a fresh browser session, generate until quota is exceeded; verify refresh keeps the same session ID and the next call remains blocked with a clear retry time.

### Tests for User Story 1 (required by constitution)

- [x] T010 [P] [US1] Add integration test for 429 on quota exceeded in tests/integration/api/generate-idea-quota.test.ts
- [x] T011 [P] [US1] Add E2E test for refresh persistence + limit block in tests/e2e/session-limit.spec.ts

### Additional tests for User Story 1 (close coverage gaps)

- [x] T030 [P] [US1] Add integration test for successful POST /api/generate-idea (200 path) including cookie update in tests/integration/api/generate-idea-success.test.ts

### Implementation for User Story 1

- [x] T012 [US1] Enforce per-session quota pre-check and return 429 payload in app/api/generate-idea/route.ts
- [x] T013 [US1] Increment quota only on successful generation and set updated cookie in app/api/generate-idea/route.ts
- [x] T014 [P] [US1] Surface server-provided rate limit message/retry info in components/printer/PrinterInterface.tsx
- [x] T015 [US1] Document session and rate-limit behaviors in docs/API_DOCS.md

**Checkpoint**: US1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Session Transparency (Priority: P2)

**Goal**: Show the user their current session identifier and remaining allowance.

**Independent Test**: Load the app and observe session ID + remaining quota; refresh and confirm values persist and update after generation.

### Tests for User Story 2 (required by constitution)

- [x] T016 [P] [US2] Add MSW handler for /api/session in tests/mocks/handlers.ts
- [x] T017 [P] [US2] Add component test for session display in tests/unit/components/PrinterInterfaceSession.test.tsx

### Implementation for User Story 2

- [x] T018 [P] [US2] Add client helper for fetching session info in lib/auth/sessionClient.ts
- [x] T019 [US2] Display session ID + remaining allowance (minute/day) in components/printer/PrinterInterface.tsx
- [x] T020 [US2] Refresh displayed allowance after successful generation in components/printer/PrinterInterface.tsx

### UX details for User Story 2

- [x] T031 [US2] Add “Copy session ID” control (clipboard) next to the session identifier in components/printer/PrinterInterface.tsx

**Checkpoint**: US2 is fully functional and independently testable.

---

## Phase 5: User Story 3 - Product Branding (Priority: P3)

**Goal**: Add logo and consistent “ideaprinter powered by rytix.tech” branding across primary screens.

**Independent Test**: Visit /, /config, /history, /share and confirm branding is visible, readable, and consistent on mobile and desktop sizes.

### Tests for User Story 3 (required by constitution)

- [x] T021 [P] [US3] Add E2E check for branding visibility in tests/e2e/branding.spec.ts

### Implementation for User Story 3

- [x] T022 [P] [US3] Add logo asset at public/assets/brand/ideaprinter-logo.svg
- [x] T023 [P] [US3] Create shared branding component in components/common/Branding.tsx
- [x] T024 [US3] Render branding on all primary pages via app/layout.tsx
- [x] T025 [P] [US3] Update site metadata to ideaprinter + powered-by attribution in app/layout.tsx
- [x] T026 [US3] Align PrinterInterface header/footer branding in components/printer/PrinterInterface.tsx

**Checkpoint**: US3 is fully functional and independently testable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Security hardening, docs polish, and validation commands.

- [x] T027 Harden session cookies (HttpOnly/Secure/SameSite) in app/api/session/route.ts and app/api/generate-idea/route.ts
- [x] T028 Update feature docs and env guidance in specs/001-session-branding/quickstart.md and .env.example
- [x] T029 Run validation commands from specs/001-session-branding/quickstart.md: npm run lint, npm run type-check, npm test, npm run test:e2e

---

## Phase 7: Spec Pivot - Global Shared-Key Quota (Daily Only) (Implemented)

**Purpose**: Update the feature from per-session quotas to a shared/default-key global daily quota (30/day), with user-provided keys bypassing shared quota. Keep earlier work intact.

**Clarification**: Best-effort in-memory tracking (Option A) is acceptable; quota may reset on backend reload/cold start.

### Documentation alignment

- [x] T032 Update spec clarifications and requirements for global quota + best-effort persistence in specs/001-session-branding/spec.md
- [x] T033 Update implementation plan to reflect global quota + Option A persistence in specs/001-session-branding/plan.md
- [x] T034 Update data model and research decisions for global shared quota in specs/001-session-branding/data-model.md and specs/001-session-branding/research.md

### Implementation (global quota)

- [x] T035 Implement in-memory shared-key quota module in lib/auth/globalQuota.ts
- [x] T044 Fix dev navigation quota reset by persisting in-memory quota state across Next.js HMR (use globalThis singleton) in lib/auth/globalQuota.ts
- [x] T036 Update POST /api/generate-idea to enforce global quota only for shared key in app/api/generate-idea/route.ts
- [x] T037 Update GET /api/session to return key mode + remaining shared quota (when shared) in app/api/session/route.ts
- [x] T038 Update client quota fetch helper and types in lib/auth/sessionClient.ts
- [x] T039 Update UI to show key mode and shared daily remaining (remove session id + per-minute) in components/printer/PrinterInterface.tsx

### Tests & validation

- [x] T040 Add unit tests for global quota behavior in tests/unit/lib/auth/globalQuota.test.ts
- [x] T041 Update integration tests for /api/session and /api/generate-idea to match global shared quota + user-key bypass in tests/integration/api/session.test.ts, tests/integration/api/generate-idea-quota.test.ts, tests/integration/api/generate-idea-success.test.ts
- [x] T042 Update component and E2E tests for the new UI indicator in tests/unit/components/PrinterInterfaceSession.test.tsx and tests/e2e/session-limit.spec.ts
- [x] T043 Run validation commands: npm run lint, npm run type-check, npm test in repository root

**Checkpoint**: Global shared-key quota behavior matches the updated spec (Option A best-effort), and tests validate shared quota enforcement + user-key bypass.

---

## Dependencies & Execution Order

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 completion.
- **US2 (P2)**: Depends on Phase 2 completion; uses `/api/session` data.
- **US3 (P3)**: Depends on Phase 1 completion; largely independent of US1/US2.

### Recommended MVP Scope

- MVP = **US1 only** (Phases 1–3). Stop and validate before continuing.

**Updated MVP note**: After the pivot, MVP is the global shared-key quota enforcement + UI transparency (Phase 7).

---

## Parallel Execution Examples

### US1

- Run in parallel: T010, T011 (tests)
- Run in parallel: T014, T015 (UI messaging + docs) after quota enforcement exists

### US2

- Run in parallel: T016 and T017 (test scaffolding)
- Run in parallel: T018 (client helper) while tests are being prepared

### US3

- Run in parallel: T022 (logo asset) and T023 (Branding component)
- Run in parallel: T021 (E2E) once UI changes are landed

---

## Implementation Strategy

1. **Phase 1 → Phase 2**: Establish signed session/quota primitives and endpoint.
2. **US1**: Enforce quota on generate-idea and show a clear block message.
3. **US2**: Display session ID and remaining allowance.
4. **US3**: Add logo + powered-by branding via layout.
5. **Polish**: Cookie security and full test/lint/typecheck pass.

**Pivot delivery**: Replace per-session quotas with shared-key global daily quota (Option A best-effort), update API + UI + tests accordingly (Phase 7).
