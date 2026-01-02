# Tasks: README Status & Docs Links Refresh

**Input**: Design documents from `/specs/001-readme-status-update/`

- [spec.md](./spec.md)
- [plan.md](./plan.md)
- [research.md](./research.md)
- [data-model.md](./data-model.md)
- [quickstart.md](./quickstart.md)
- [contracts/README_DOC_LINKS.md](./contracts/README_DOC_LINKS.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare for a safe, minimal documentation-only change.

- [x] T001 Confirm working tree clean before editing README.md (README.md)
- [x] T002 [P] Review canonical status + shipped feature list in docs/PROJECT_SUMMARY.md (docs/PROJECT_SUMMARY.md)
- [x] T003 [P] Review quickstart expectations for env vars and local run (specs/001-readme-status-update/quickstart.md, docs/DEPLOYMENT.md)
- [x] T004 [P] Confirm required README documentation link targets and invariants (specs/001-readme-status-update/contracts/README_DOC_LINKS.md)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish accuracy constraints that all story edits must satisfy.

**⚠️ CRITICAL**: No user story work should begin until this phase is complete.

- [x] T005 Verify required documentation files exist under docs/ per contract (docs/API_DOCS.md, docs/CONTRIBUTING.md, docs/DEPLOYMENT.md, docs/PROJECT_SUMMARY.md, docs/AUDIT_REPORT.md)
- [x] T006 Reconcile README claims against docs/PROJECT_SUMMARY.md and capture deltas/decisions in specs/001-readme-status-update/research.md (README.md, docs/PROJECT_SUMMARY.md, specs/001-readme-status-update/research.md)

**Checkpoint**: Sources of truth identified; link targets verified.

---

## Phase 3: User Story 1 - Understand the project at a glance (Priority: P1) 🎯 MVP

**Goal**: Make README accurately describe what the app does today, what’s shipped, the current project status, and the most recent shipped updates.

**Independent Test**: Read README.md end-to-end and confirm it accurately reflects shipped capabilities, current status, and “Recent Updates”.

### Implementation for User Story 1

- [x] T007 [US1] Update tests/unit/readmeDocs.e2e.test.ts to validate: no replacement chars, docs/\*.md links resolve, and “Recent Updates” exists with 3–5 bullets + link to docs/PROJECT_SUMMARY.md (tests/unit/readmeDocs.e2e.test.ts)
- [x] T008 [US1] Ensure README has an explicit status block with ISO last-updated date (README.md)
- [x] T009 [US1] Add “Recent Updates” section with 3–5 bullets (recent shipped features + fixes) and a link to docs/PROJECT_SUMMARY.md (README.md, docs/PROJECT_SUMMARY.md)
- [x] T010 [US1] Align the Features section to match shipped functionality described in docs/PROJECT_SUMMARY.md (README.md, docs/PROJECT_SUMMARY.md)
- [x] T011 [US1] Align Quick Start env var guidance with quickstart + deployment docs (README.md, specs/001-readme-status-update/quickstart.md, docs/DEPLOYMENT.md)
- [x] T012 [US1] Fix any malformed/garbled heading characters (e.g., replacement characters) so README renders cleanly (README.md)

**Checkpoint**: A first-time reader can understand what’s built, its status, and recent updates.

---

## Phase 4: User Story 2 - Find the right documentation quickly (Priority: P2)

**Goal**: Ensure README documentation links point to the canonical docs/ directory.

**Independent Test**: Click every README link that targets a repo-relative docs/\*.md path and confirm it opens the intended file under docs/.

### Implementation for User Story 2

- [x] T013 [US2] Update the Documentation section link targets to docs/\* paths per contract (README.md, specs/001-readme-status-update/contracts/README_DOC_LINKS.md)
- [x] T014 [US2] Normalize any other moved-doc references to docs/ paths (remove stale root-relative links) (README.md)

**Checkpoint**: All README docs links resolve to existing docs/ files.

---

## Phase 5: User Story 3 - Confirm what’s done vs what’s next (Priority: P3)

**Goal**: Clearly separate shipped features from future enhancements (no misleading “done” checkmarks for non-existent features).

**Independent Test**: Review the Roadmap/Future section and confirm it doesn’t label future work as shipped.

### Implementation for User Story 3

- [x] T015 [US3] Rewrite the Roadmap section to remove/correct misleading completed items (README.md)
- [x] T016 [US3] Add a concise “Future enhancements” list consistent with known limitations in docs/DEPLOYMENT.md (README.md, docs/DEPLOYMENT.md)

**Checkpoint**: Stakeholders can tell what’s shipped vs next.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate requirements and ensure no regressions in documentation quality.

- [x] T017 [P] Spot-check that required docs link targets exist and render as expected (docs/API_DOCS.md, docs/CONTRIBUTING.md, docs/DEPLOYMENT.md, docs/PROJECT_SUMMARY.md, docs/AUDIT_REPORT.md)
- [x] T018 Run `npm test`, `npm run lint`, `npm run type-check`, and `npm run format:check` and validate SC-001..SC-005 against README.md (package.json, specs/001-readme-status-update/spec.md, README.md)

---

## Dependencies & Execution Order

### User Story Completion Order (Dependency Graph)

- Phase 1 → Phase 2 → US1 (P1) → US2 (P2) → US3 (P3) → Phase 6

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup; blocks all story work.
- **User Stories (Phase 3+)**: Depend on Phase 2.
- **Polish (Phase 6)**: Depends on completion of the desired user stories.

### Parallel Execution Examples

- **Phase 1**: T002, T003, T004 can run in parallel.
- **Phase 6**: T017 can run in parallel with other reviews (different files).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 + Phase 2
2. Complete US1 (T007–T012)
3. **STOP and VALIDATE** via T018 acceptance + success criteria (package.json, specs/001-readme-status-update/spec.md)

### Incremental Delivery

1. Deliver US1 → validate independently
2. Deliver US2 → validate links
3. Deliver US3 → validate roadmap clarity
4. Finish polish gates (T018)

## Format Validation

- All tasks use strict checklist format: `- [ ] T### [P?] [US?] Description with file path`.
- `[US1]/[US2]/[US3]` labels appear only on user story tasks.
- Every task includes at least one concrete file path.
