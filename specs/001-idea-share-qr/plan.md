# Implementation Plan: Shareable Idea QR

**Branch**: `001-idea-share-qr` | **Date**: 2026-01-01 | **Last Updated**: 2026-01-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-idea-share-qr/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Make the “Scan to Share” QR reliably scannable and usable by other people (including in incognito/private browsing) by switching from raw JSON-in-URL to a compact, URL-safe share payload; add `.md` + `.txt` exports that include the idea’s Source URL; update the displayed share base URL to `ideaprinter.rytix.tech`; and fix `/history` “View” so it loads the idea instead of opening a blank page.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.6, Node.js >= 18.17, React 18, Next.js 14.2 (App Router)
**Primary Dependencies**: `qrcode.react` (QR rendering), `uuid`, `framer-motion`, `lucide-react`, TailwindCSS
**Storage**: Browser `localStorage` for generated ideas and history (see `lib/utils/storage.ts`)
**Testing**: Vitest (unit), Playwright (e2e), MSW (mocking)
**Target Platform**: Web (modern browsers; mobile camera QR scanners)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: QR render and share page load should feel instantaneous; follow constitution targets (FCP < 1.5s, TTI < 3.5s; UI interactions perceived < 100ms)
**Constraints**: No backend database is assumed for sharing; shared idea must be viewable by recipients without session; keep share URLs short enough for reliable QR scanning
**Scale/Scope**: Single feature touching share URL generation/parsing, exports, and history “View” navigation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: PASS (use existing lint/format/type-check gates; avoid hardcoded env-specific config)
- **Testing Standards**: PASS (add unit coverage for encoding/decoding + export formatting; add Playwright coverage for P1 share flow)
- **User Experience Consistency**: PASS (use existing Tailwind tokens/patterns; add clear error states when share payload is invalid)
- **Performance Requirements**: PASS (minimize share payload size; avoid large new dependencies that bloat bundles)

## Project Structure

### Documentation (this feature)

```text
specs/001-idea-share-qr/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/
├── api/
│   ├── generate-idea/
│   ├── ideas/
│   │   ├── history/
│   │   └── [ideaId]/
│   └── ...
├── history/
├── share/
└── ...

components/
├── history/
├── printer/
└── ...

lib/
├── types/
├── utils/
└── ...

tests/
├── e2e/
├── integration/
└── unit/
```

**Structure Decision**: Single Next.js web application (App Router). The share flow spans `components/printer/*`, `app/share/*`, and `components/history/*`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

No constitutional violations anticipated for this feature.

## Phase 0: Outline & Research (output: research.md)

Research questions to resolve (and document in [research.md](research.md)):

1. How to reduce share URL length enough for reliable QR scanning while keeping “no backend DB” sharing.

- Define an explicit max Share URL length target (to guide compression choice). Target: 1000 characters.

2. How to support both “share to other people” and “history view on same device” without breaking existing links.
3. How to source and display the “Source URL” from the existing data model.
4. How to ensure the share base URL displays as `ideaprinter.rytix.tech` while still working in local dev.

## Phase 1: Design & Contracts (outputs: data-model.md, contracts/\*, quickstart.md)

Design deliverables:

- [data-model.md](data-model.md): Define the share payload schema, backwards compatibility expectations, and how Source URL is derived.
- `contracts/*`: Define a minimal HTTP contract for share payload parsing and export downloads.
- [quickstart.md](quickstart.md): Steps to run locally and validate the critical flows, including opening `http://localhost:3000/history` and testing share in a private/incognito browser context.

## Phase 2: Implementation Planning (NOT executed here)

Implementation will be decomposed into independently testable tasks in `tasks.md` (via `/speckit.tasks`), covering:

- Share URL encode/decode utility and unit tests
- Share page behavior (data vs ideaId) and error states
- QR configuration changes (size/margin/error correction)
- `.md` export formatting + inclusion of Source URL
- `/history` “View” fix and regression tests
