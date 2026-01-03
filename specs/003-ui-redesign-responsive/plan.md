# Implementation Plan: Responsive UI Redesign

**Branch**: `003-ui-redesign-responsive` | **Date**: 2026-01-03 | **Spec**: `./spec.md`
**Input**: Feature specification from `specs/003-ui-redesign-responsive/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Deliver a responsive, consistent UI across mobile and desktop for the existing pages (`/`, `/history`, `/config`, `/share`) by adjusting layout/spacing/typography and fixing usability regressions identified in DevTools (notably sub-44px touch targets and Share blank/hydration failures). Implementation focuses on component-level styling and robust Share error handling without adding new pages or changing core generation logic.

## Technical Context

**Language/Version**: TypeScript 5.6 (Node.js >= 18.17)  
**Primary Dependencies**: Next.js 14.2 (App Router), React 18.3, TailwindCSS 3.4, framer-motion, lucide-react, qrcode.react  
**Storage**: No server database; client-side `localStorage` for history/config; cookies/session utilities for server-side session enforcement where applicable  
**Testing**: Vitest + Testing Library (unit), MSW (integration/mocking), Playwright (e2e)  
**Target Platform**: Web (responsive: mobile + desktop)  
**Project Type**: Web application (single Next.js project)  
**Performance Goals**: Maintain existing responsiveness; keep UI interactions perceived < 100ms; avoid regressions to page load and bundle size targets in constitution  
**Constraints**: WCAG 2.1 AA; touch targets >= 44×44px for primary actions; avoid horizontal scroll on core pages at 320–1440px widths  
**Scale/Scope**: Update UI across 4 primary pages and shared components; no new features/pages

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Status: PASS (plan-level). Implementation must enforce these gates before any merge.

### I. Code Quality (NON-NEGOTIABLE)

- All changes must pass `npm run lint`, `npm run type-check`, and `npm run format:check`.
- No new secrets or environment-specific hardcoding.
- Keep changes focused; avoid introducing unnecessary abstractions.

### II. Testing Standards (NON-NEGOTIABLE)

- Unit tests for any new/changed pure logic (e.g., share payload parsing helpers).
- Integration tests for API contract changes (none planned for this feature).
- E2E tests for P1 journey (configure → generate → view output) and Share rendering (valid + missing/invalid payload).

### III. User Experience Consistency

- WCAG 2.1 AA: focus visibility, readable layout at 200% text size, consistent feedback states.
- Responsive design across common breakpoints; avoid horizontal overflow.
- Error states must be actionable (especially `/share`).

### IV. Performance Requirements

- No major regressions in client bundle size; avoid introducing heavy new dependencies.
- Keep share payload logic lightweight; avoid compressing/expanding payload in a way that increases JS cost.

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-redesign-responsive/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── openapi.yaml
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
│   ├── config/
│   ├── generate-idea/
│   ├── ideas/
│   ├── list-models/
│   ├── session/
│   └── trends/
├── config/
├── history/
├── share/
└── page.tsx

components/
├── common/
├── config/
├── history/
└── printer/

lib/
├── auth/
├── gemini/
├── monitoring/
├── share/
├── trends/
├── types/
└── utils/

tests/
├── e2e/
├── integration/
├── msw/
└── unit/
```

**Structure Decision**: Single Next.js web application using the App Router. UI redesign work will primarily touch `app/`, `components/`, and `app/globals.css`, with share-related robustness changes in `lib/share/` and the Share page.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |

## Phase 0: Outline & Research (completed)

Output: `./research.md`

Key outcomes:

- Confirmed scope is UI/UX redesign only (no new pages/features).
- Confirmed `/share` must render a non-blank UI for valid and invalid/missing payloads.
- Confirmed production-only webpack chunk tuning to avoid dev/HMR instability.

## Phase 1: Design & Contracts (completed)

Outputs:

- Data model: `./data-model.md`
- API contracts: `./contracts/openapi.yaml`
- Quickstart: `./quickstart.md`

### Constitution Re-check (post-design)

Status: PASS.

- No new dependencies required for the plan artifacts.
- Testing strategy is defined for P1 journeys and Share rendering.
- Performance constraints remain: avoid adding heavy UI libraries; prefer Tailwind adjustments.

## Phase 2: Planning (this plan stops here)

The following work items will be captured in `tasks.md` by `/speckit.tasks`.

### Implementation milestones

1. **Baseline responsive layout pass**: unify page layouts, spacing, and typography using existing Tailwind utilities; eliminate overflow risks.
2. **Touch-target fixes**: adjust sizes/padding for primary controls on Home/History/Config to meet 44×44px guideline.
3. **Share robustness**: ensure `/share` catches decode/render errors and shows actionable UI for missing/invalid payloads.
4. **Regression checks**: verify viewport switching preserves state; ensure consistent loading/error/focus patterns.

### Testing strategy (aligns to constitution)

- **Unit**: any new helpers for share parsing/validation.
- **E2E (Playwright)**:
  - P1: configure → generate → view output on mobile + desktop viewports.
  - Share: open `/share?data=...` (valid) and `/share` (missing) and assert non-blank + actionable UI.
- **Manual DevTools checks**: mobile + desktop viewport sweep for touch targets and overflow.
