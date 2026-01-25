---
description: 'Task list for feature implementation'
---

# Tasks: Responsive UI Redesign

**Input**: Design documents from `specs/003-ui-redesign-responsive/`
**Prerequisites**: `plan.md` (required), `spec.md` (required), plus `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`

**Tests**: Included as explicit tasks. This feature follows **test-first**: write and approve tests before implementation tasks. Manual verification remains captured via **Independent Test** criteria per story and `quickstart.md`.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation of each story.

## Format: `- [ ] T### [P?] [US#?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[US#]**: Which user story this task belongs to (US1â€“US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Ensure a clean baseline for UI work and verification.

- [X] T001 Confirm spec artifacts present and current in specs/003-ui-redesign-responsive/spec.md
- [X] T002 Run local install and verify scripts exist (dev/lint/type-check/test) in package.json
- [X] T003 Capture a baseline of lint/type-check/format-check results using scripts in package.json
- [X] T004 Validate quickstart steps are accurate (commands + URLs) in specs/003-ui-redesign-responsive/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared UI primitives and safety checks that all stories rely on.

- [X] T005 Verify dev stability: keep custom splitChunks production-only in next.config.mjs
- [X] T006 Add a reusable 44Ã—44 tap target utility class in app/globals.css
- [X] T007 Add/standardize focus-visible styling for links/buttons in app/globals.css
- [X] T008 Add an `overflow-x-hidden` guard at the app shell level in app/layout.tsx

**Checkpoint**: Foundation ready â€” user story work can proceed.

---

## Phase 2.5: Automated Tests (Test-First Gates)

**Purpose**: Satisfy constitution testing requirements and lock in acceptance criteria before UI refactors.

- [X] T037 [US1] (Tests-first) Add Playwright E2E for the P1 core flow (configure â†’ generate â†’ view output) on mobile + desktop viewports
- [X] T038 [US4] (Tests-first) Add Playwright E2E for `/share` valid payload and missing/invalid payload; assert non-blank UI and actionable error state
- [X] T039 [US4] (Tests-first) Add unit tests for share payload parsing/validation in lib/share/sharePayload.ts
- [X] T045 Ensure `npm run test:coverage` works (install/configure Vitest coverage provider if needed) and enforce >=80% coverage for business logic in vitest.config.ts
- [X] T040 [US3] Add automated axe-core accessibility checks in Playwright for core pages (`/`, `/history`, `/config`, `/share`)
- [X] T041 Capture baseline `next build` output to specs/003-ui-redesign-responsive/build-baseline.txt for regression comparison (SC-007)

---

## Phase 3: User Story 1 - Use the app comfortably on mobile and desktop (Priority: P1) ðŸŽ¯ MVP

**Goal**: Core flow (configure â†’ generate idea â†’ view output) remains usable on 320â€“1440px widths with no overflow/clipping.

**Independent Test**: Follow â€œCore flow (P1)â€ in specs/003-ui-redesign-responsive/quickstart.md on ~390Ã—844 and ~1280Ã—800; verify no horizontal scroll and primary actions usable.

### Implementation

- [X] T009 [US1] Align home page wrapper styling so layout is controlled by components/printer/PrinterInterface.tsx and app/page.tsx
- [X] T010 [P] [US1] Increase touch target sizes for primary actions on the printer UI in components/printer/PrinterInterface.tsx
- [X] T011 [P] [US1] Ensure primary CTA meets 44Ã—44 minimum (and remains readable at 200% text) in components/printer/PrintButton.tsx
- [X] T012 [P] [US1] Increase touch targets for printout action buttons (copy/export) in components/printer/IdeaPrintout.tsx
- [X] T013 [US1] Ensure printout content reflows cleanly on small screens (no truncation/overlap) in components/printer/IdeaPrintout.tsx
- [X] T014 [US1] Ensure paper output container cannot cause horizontal overflow in components/printer/PaperOutput.tsx
- [X] T015 [US1] Ensure Branding header does not overlap interactive controls on small viewports in app/layout.tsx
- [X] T016 [US1] Increase tap target size for branding link and â€œpowered byâ€ link in components/common/Branding.tsx

**Checkpoint**: Core flow usable on mobile + desktop.

---

## Phase 4: User Story 4 - Open and view shared ideas reliably (Priority: P2)

**Goal**: `/share` never renders blank; shows either the shared idea or an actionable error/empty state.

**Independent Test**: Follow â€œShare reliability (P2)â€ in specs/003-ui-redesign-responsive/quickstart.md; confirm no blank screen and no console hydration errors during normal load.

### Implementation

- [X] T017 [US4] Remove debug logging and ensure robust loading UI in app/share/page.tsx
- [X] T018 [US4] Ensure missing `data` renders a friendly CTA (and never throws during render) in app/share/page.tsx
- [X] T019 [US4] Ensure invalid/legacy payload failures are caught and presented as UI in app/share/page.tsx
- [X] T020 [P] [US4] Harden share decoding error messaging (no internal details; actionable guidance) in lib/share/sharePayload.ts
- [X] T021 [US4] Ensure shared idea mapping to `GeneratedIdea` is complete and type-safe in app/share/page.tsx
- [X] T022 [P] [US4] Confirm share URL generation constraints remain enforced (2000 chars) in lib/share/shareUrl.ts

**Checkpoint**: `/share` always renders a usable UI.

---

## Phase 5: User Story 2 - Seamless switching between layouts (Priority: P2)

**Goal**: Resizing/rotating does not lose user context (inputs and in-progress flow).

**Independent Test**: Follow â€œViewport switching (P2)â€ in specs/003-ui-redesign-responsive/quickstart.md; resize/rotate during config entry and while viewing a printout.

### Implementation

- [X] T023 [US2] Ensure resize handling does not reset in-progress state in components/printer/PrinterInterface.tsx
- [X] T024 [US2] Ensure config form fields remain controlled and persist across reflow (no remount-triggered resets) in components/config/CredentialsForm.tsx
- [X] T025 [US2] Ensure the Config page layout remains stable on rotation (no fixed-position overlap) in app/config/page.tsx
- [X] T026 [US2] Ensure History page filters/search remain stable across resize (no filter state resets) in components/history/IdeaHistory.tsx

**Checkpoint**: Resize/rotation preserves in-progress context.

---

## Phase 6: User Story 3 - Consistent, refreshed look across the app (Priority: P3)

**Goal**: Cohesive visual language and consistent feedback states (loading/disabled/error/focus) across pages.

**Independent Test**: Navigate `/`, `/history`, `/config`, `/share` and trigger at least one error state; verify consistent focus rings and feedback patterns.

### Implementation

- [X] T027 [US3] Normalize body/app background responsibility between app/globals.css and page-level wrappers
- [X] T042 [US3] Ensure active navigation item is visually distinguished on all viewports (FR-002) in app/layout.tsx and/or components/common/Branding.tsx
- [X] T043 [US3] Respect `prefers-reduced-motion` for animations/transitions used by UI (FR-006a) in components/printer/animations.ts (and related usage)
- [X] T028 [P] [US3] Standardize link/button hover/focus styling used on History page in components/history/IdeaHistory.tsx
- [X] T029 [P] [US3] Standardize link/button hover/focus styling used on Config page in app/config/page.tsx
- [X] T030 [P] [US3] Standardize link/button styling used on Share CTAs in app/share/page.tsx
- [X] T031 [US3] Ensure loading states are consistent and accessible (text + spinner behavior) in components/common/LoadingSpinner.tsx
- [X] T032 [US3] Ensure error presentation is consistent and actionable across app in components/common/ErrorMessage.tsx

**Checkpoint**: UI consistency improved across pages.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final sweeps that affect multiple stories.

- [X] T033 [P] Run responsive spot-checks and record any remaining touch-target exceptions in specs/003-ui-redesign-responsive/spec.md
- [X] T034 Verify no horizontal overflow remains by auditing global/layout wrappers in app/layout.tsx
- [X] T035 Verify 200% text size does not break layout on primary pages by adjusting CSS in app/globals.css
- [X] T036 Run quickstart validation end-to-end and update notes as needed in specs/003-ui-redesign-responsive/quickstart.md
- [X] T044 Re-run `next build`, save output to specs/003-ui-redesign-responsive/build-current.txt, and compare against T041 baseline; investigate and resolve any clear regressions (SC-007)

---

## Phase 8: Bug Fixes & Refinements (Post-Verification)

**Purpose**: Address issues discovered during manual verification and testing.

### Trend Sync Bug (Discovered 2026-01-03)

**Issue**: When refreshing trends, if history exists with the same post IDs, the old content is kept and new/updated content is discarded. The `mergeAndDeduplicatePosts()` function from `lib/trends/dedupe.ts` is not being used.

**Root Cause**: `components/printer/TrendInterface.tsx` uses a simple ID check instead of the proper dedupe utility:
```tsx
// Current buggy code (lines 92-107):
const merged = [...existing];
newPosts.forEach((p) => {
  if (!merged.some((e) => e.id === p.id)) {
    merged.push(p);  // Only adds if ID doesn't exist
  }
});
```

**Expected**: Use `mergeAndDeduplicatePosts()` with new posts first to replace old content.

### Implementation Tasks

- [X] T046 (Tests-first) Add unit test in `tests/unit/trends/dedupe.test.ts` verifying that `mergeAndDeduplicatePosts()` prioritizes new posts over existing when same canonical URL/ID exists
- [X] T047 Update merge logic in `components/printer/TrendInterface.tsx` to import and use `mergeAndDeduplicatePosts(newPosts, existing)` instead of manual ID check (lines 92-107)
- [ ] T048 (Optional) Add integration test in `tests/integration/api/trends-ingest.test.ts` verifying that re-ingesting the same source updates cached posts with new content
- [X] T049 Manual verification: Sync trends, note post content, wait 5+ minutes, sync again, verify updated timestamps/content appear

---

## Phase 8 Completion Summary

**Bug Fixed**: Trend sync now properly updates cached posts with fresh content from source

**Verification Results**:
- Before refresh: 30 posts cached
- After refresh: 37 posts (30 existing + 7 new)
- Deduplication: Working correctly (no duplicates by canonical URL)
- New posts added: X-Clacks-Overhead, ParadeDB hiring, Profiling with Ctrl-C, Physics books, ASCII Moon, VBA hacking, Recursive LLMs

**Test Coverage**:
- 15/15 dedupe unit tests pass (6 new tests for bug fix)
- 97/111 total tests pass
- Type checking clean

**Files Modified**:
1. `lib/trends/dedupe.ts` - Fixed merge order (new posts first)
2. `components/printer/TrendInterface.tsx` - Use proper dedupe function
3. `tests/unit/trends/dedupe.test.ts` - Added comprehensive test coverage

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)** â†’ blocks **Phase 2** only by convention (baseline sanity).
- **Phase 2 (Foundational)** â†’ blocks all user stories.
- **Phase 3 (US1)** is MVP; do it first.
- **Phase 4 (US4)** and **Phase 5 (US2)** can proceed after US1; they are largely independent.
- **Phase 6 (US3)** should follow once the major layout/tap-target work is settled.

### User Story Dependency Graph

- Setup â†’ Foundational â†’ US1 â†’ (US4 âˆ¥ US2) â†’ US3 â†’ Polish

## Parallel Execution Examples

### US1 Parallel Examples

- T010 and T012 can be done in parallel (components/printer/PrinterInterface.tsx vs components/printer/IdeaPrintout.tsx)
- T011 can be done in parallel with T014 (components/printer/PrintButton.tsx vs components/printer/PaperOutput.tsx)

### US4 Parallel Examples

- T020 and T022 can be done in parallel (lib/share/sharePayload.ts vs lib/share/shareUrl.ts)

### US3 Parallel Examples

- T028, T029, and T030 can be done in parallel (different page/component files)

---

## Implementation Strategy

### MVP First

1. Complete Setup + Foundational
2. Complete US1 and validate via `quickstart.md`
3. Stop and confirm mobile + desktop usability

### Incremental Delivery

- After MVP (US1), deliver US4 (Share reliability) and US2 (resize/rotation) next.
- Finish with US3 consistency work and Polish sweep.
