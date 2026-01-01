# Tasks: Shareable Idea QR

**Input**: Design documents from `/specs/001-idea-share-qr/`
**Prerequisites**: [plan.md](plan.md) (required), [spec.md](spec.md) (required)

**Note on tests**: This repo’s constitution mandates test-first for critical journeys; tasks below include unit + e2e tests for P1.

## Phase 1: Setup (Shared Infrastructure)

- [x] T001 Create share utilities folder + exports in lib/share/index.ts
- [x] T002 [P] Add public site origin env var to .env.example (NEXT_PUBLIC_SITE_ORIGIN)
- [x] T003 [P] Decide URL-safe compression approach for share payload (record decision + rationale in specs/001-idea-share-qr/research.md); then add the chosen dependency in package.json and run install
      Decision criteria: keep final Share URL length QR-friendly (max 1000 characters) and avoid large bundle-size impact

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T004 [P] Add unit tests for site-origin resolver in tests/unit/siteOrigin.test.ts; then implement resolver in lib/share/siteOrigin.ts
- [x] T005 [P] Add unit tests for payload roundtrip + legacy decode in tests/unit/sharePayload.test.ts
- [x] T006 Implement versioned share payload encode/decode in lib/share/sharePayload.ts (supports legacy raw JSON data)
- [x] T007 Implement share URL builder in lib/share/shareUrl.ts (uses siteOrigin + payload encoder)
- [x] T008 [P] Add unit tests for export formatting in tests/unit/ideaExport.test.ts
  - Includes idea name
  - Includes category
  - Includes unique ID
  - Includes generated timestamp
  - Includes concept
  - Includes problem/gap
  - Includes solution/fix
  - Includes “Source URL: <url>” when idea has a Source URL
  - Includes “Source URL: Not available” when idea has no Source URL
  - Includes “Share URL:” line in both .md and .txt
- [x] T009 Implement export format builders in lib/share/ideaExport.ts (.txt + .md include Source URL + Share URL)

**Checkpoint**: Share URL + export helpers exist and are unit-tested

---

## Phase 3: User Story 1 - Share an idea via scannable QR (Priority: P1) 🎯 MVP

**Goal**: QR reliably scans to a share page that shows the idea and provides `.md` + `.txt` downloads including Source URL.

**Independent Test**: Generate an idea, open share printout, confirm QR link opens in a fresh browser context and downloads work.

### Tests (test-first)

- [x] T010 [P] [US1] Add Playwright e2e test for share link opening in isolated context in tests/e2e/ideaShareQr.spec.ts

### Implementation

- [x] T011 [US1] Update share URL generation in components/printer/IdeaPrintout.tsx to use lib/share/shareUrl.ts
- [x] T012 [US1] Update QR rendering options for scan reliability in components/printer/IdeaPrintout.tsx (size: 320px; include margin; error correction level M; must remain scannable for Share URLs up to 1000 chars)
- [x] T013 [P] [US1] Add "Download .md" action wired to lib/share/ideaExport.ts in components/printer/IdeaPrintout.tsx
- [x] T014 [P] [US1] Update "Download .txt" export to use lib/share/ideaExport.ts and include Source URL in components/printer/IdeaPrintout.tsx
- [x] T015 [US1] Update app/share/page.tsx to decode new payload + legacy payloads and populate provenance.sourceUrl when present
  - Ensure share view displays “Source URL: Not available” when missing
  - Ensure share view displays “Source URL: <url>” when present
- [x] T016 [US1] Add share-page error state for invalid/missing payload in app/share/page.tsx

**Checkpoint**: US1 works end-to-end with QR link and downloads

---

## Phase 4: User Story 2 - Share URLs use the public domain (Priority: P2)

**Goal**: All user-facing Share URLs display the `ideaprinter.rytix.tech` base domain (including exports).

**Independent Test**: Generate an idea and confirm the displayed share URL and exported files use `https://ideaprinter.rytix.tech`.

- [x] T017 [US2] Ensure lib/share/siteOrigin.ts uses NEXT_PUBLIC_SITE_ORIGIN when set; otherwise uses window.location.origin (local dev)
- [x] T018 [US2] Update printout footer domain text in components/printer/IdeaPrintout.tsx to derive from lib/share/siteOrigin.ts (uses NEXT_PUBLIC_SITE_ORIGIN when set; otherwise runtime origin for local dev)
- [x] T019 [P] [US2] Document deployment env var in docs/DEPLOYMENT.md (NEXT_PUBLIC_SITE_ORIGIN)

---

## Phase 5: User Story 3 - View saved ideas from History (Priority: P3)

**Goal**: “View” from `/history` shows the idea details (not blank), and supports sharing/exporting.

**Independent Test**: Generate an idea, go to `http://localhost:3000/history`, click “View”, verify idea content appears.

- [x] T022 [P] [US3] Add Playwright e2e test for history "View" showing content in tests/e2e/historyView.spec.ts
- [x] T020 [P] [US3] Ensure share page shows a clear error state for missing/invalid payload (including if an unsupported query param like ideaId is used)
- [x] T021 [US3] Fix History "View" action to open a working URL in components/history/IdeaHistory.tsx (prefer lib/share/shareUrl.ts)

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T023 [P] Enforce max Share URL length (1000 chars) with a guard + user-friendly error in lib/share/sharePayload.ts (must satisfy FR-011/SC-006)
  - Add unit test asserting generated Share URLs > 1000 chars trigger the error state
- [x] T024 [P] Verify copy-to-clipboard includes Source URL + Share URL in components/printer/IdeaPrintout.tsx
- [x] T025 Run formatting and lint/type-check scripts (npm run format; npm run lint; npm run type-check) and fix any issues in touched files referenced in package.json
- [ ] T026 Validate SC-001/SC-002 manually and document results in specs/001-idea-share-qr/quickstart.md (20 scan trials across 2 devices; record QR open time and .md/.txt download time)

---

## Dependencies & Execution Order

### User Story Completion Order (Dependency Graph)

- **Setup → Foundational → US1 (MVP)**
- **US2** depends on Foundational (site origin + share URL builder)
- **US3** depends on Foundational and reuses the share page/URL utilities; it can be implemented after US1

### Parallel Opportunities

- Phase 1: T002 and T003 are parallel
- Phase 2: T006 and T009 are parallel once T005/T008 exist
- US1: T013 and T014 are parallel; T010 can be authored in parallel with foundational helpers
- US3: T020 and T021 can be done in parallel if coordinated (same file conflict risk: app/share/page.tsx)

---

## Parallel Execution Examples

### User Story 1

```bash
# In parallel (different files) once Foundational is ready:
Task: T012 Update QR rendering options in components/printer/IdeaPrintout.tsx
Task: T015 Update app/share/page.tsx payload decode

# In parallel (same file risk) if coordinated:
Task: T013 Add “Download .md” action in components/printer/IdeaPrintout.tsx
Task: T014 Update “Download .txt” export in components/printer/IdeaPrintout.tsx
```

### User Story 3

```bash
# In parallel (different files):
Task: T021 Fix History “View” in components/history/IdeaHistory.tsx
Task: T022 Add Playwright test in tests/e2e/historyView.spec.ts
```

---

## Implementation Strategy

- **MVP**: Complete Phases 1–3 (through US1), then validate independently.
- **Incremental**: Add US2 (domain consistency), then US3 (history view), finishing with polish tasks.
