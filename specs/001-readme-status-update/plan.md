# Implementation Plan: README Status & Docs Links Refresh

**Branch**: `001-readme-status-update` | **Date**: 2026-01-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-readme-status-update/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Update `README.md` to accurately reflect shipped capabilities and status, ensure documentation links target canonical files under `docs/`, and add a short “Recent Updates” section (3–5 bullets summarizing recent shipped features and fixes with a link to `docs/PROJECT_SUMMARY.md`). Enforce requirements via an automated Vitest docs validation test.

## Technical Context

**Language/Version**: TypeScript (tsc `--noEmit`), Node.js >= 18.17  
**Primary Dependencies**: Next.js 14 (App Router), React 18, Tailwind CSS  
**Storage**: Markdown files in-repo (`README.md`, `docs/*.md`)  
**Testing**: Vitest (unit/docs validation), Playwright (existing e2e suite; not required for this doc-only change)  
**Target Platform**: Web (Next.js on Node/Vercel)
**Project Type**: Web application (Next.js App Router)  
**Performance Goals**: N/A (documentation-only change)  
**Constraints**: Avoid misleading README claims; links must resolve in-repo; tests must run without external dependencies  
**Scale/Scope**: Small change localized to README/specs + a focused Vitest test

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

From [.specify/memory/constitution.md](../../.specify/memory/constitution.md):

- Code quality gates: lint + type-check must pass.
- Testing: each P1 story must be independently testable; tests must run in isolation.

**Gates for this feature** (must pass before marking complete):

- `npm test`
- `npm run lint`
- `npm run type-check`
- `npm run format:check`

**P1 independence enforcement**:

- Maintain/extend `tests/unit/readmeDocs.e2e.test.ts` so it verifies key README requirements without requiring a running server or network.

## Project Structure

### Documentation (this feature)

```text
specs/001-readme-status-update/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command output)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
app/                 # Next.js App Router pages + API routes
components/          # UI components
docs/                # Canonical documentation (targets for README links)
lib/                 # Shared utilities
specs/               # Speckit specs (this feature lives here)
tests/
  unit/              # Vitest unit tests (includes README/docs validation)
  integration/
  e2e/               # Playwright
```

**Structure Decision**: Web application (Next.js App Router). This feature changes `README.md` and keeps validation in `tests/unit/readmeDocs.e2e.test.ts`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
