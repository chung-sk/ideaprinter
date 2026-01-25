# Implementation Plan: Multi-Source Trend Sourcing

**Branch**: `001-multi-source-trends` | **Date**: 2025-12-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-multi-source-trends/spec.md`

**Note**: This file follows the `/speckit.plan` workflow.

## Summary

Replace the Apify-only trend ingestion approach with a source-based, multi-source ingestion architecture that supports:

- P1: Free sources (Hacker News + curated RSS tech-news bundle)
- P2: Credentialed source (X/Twitter via official credential)

All sources must feed the same UX flow (configure → ingest → select post → generate idea → view history), with consistent normalization, excerpt-only storage (280 char cap), safety filtering, dedupe across runs, and provenance attached to generated ideas.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.3, Next.js 14.2 (App Router)
**Primary Dependencies**: `next`, `react`, `@google/generative-ai`, `vitest`, `@testing-library/react`, `msw`, `playwright`
**Storage**:

- Client: localStorage/sessionStorage (existing app pattern) for configuration, trend posts, and history
- Server: in-memory ingestion job store (HMR-safe via `globalThis`) with TTL
  **Testing**: Vitest (unit + integration), MSW for network mocking, Playwright for P1 E2E user journey
  **Target Platform**: Next.js runtime (local dev + typical serverless deployment)
  **Project Type**: Web app (Next.js full-stack: UI + API routes)
  **Performance Goals**:
- Ingestion endpoints return quickly (`202 Accepted`) and complete asynchronously
- UI remains responsive; polling stops on terminal states
  **Constraints**:
- No new DB/Redis required for MVP
- Excerpt-only storage: max 280 chars (SC-005)
- Blocked/unsafe content must not be stored/displayed (FR-006)
- No secrets hardcoded; credentials never logged
  **Scale/Scope**: MVP multi-source trend ingestion that is extensible (P3) without UX changes

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Gates (Phase 0)

- [x] **Code Quality**: No secrets hardcoded; provider abstraction keeps modules single-purpose
- [x] **Testing Standards**: Plan includes unit + integration + E2E (P1 story)
- [x] **UX Consistency**: Single flow across all sources; clear loading/error states
- [x] **Performance**: Async ingestion jobs + polling stop on terminal states

### Post-Design Gates (Phase 1)

- [x] **Code Quality**: Concrete module boundaries defined (sources, normalization, job store, routes)
- [x] **Testing Standards**: Deterministic tests via MSW/mocked source fetches; no live external dependencies
- [x] **UX Consistency**: Same selection + provenance rendering irrespective of source metadata completeness
- [x] **Performance**: Timeouts for outbound fetch; async jobs prevent request timeouts

**Status**: ✅ COMPLETE — Ready for implementation tasks (Phase 2: `/speckit.tasks`).

## Project Structure

### Documentation (this feature)

```text
specs/001-multi-source-trends/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-spec.yaml
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   └── trends/
│       └── ingest/
│           ├── route.ts              # POST start ingestion (202)
│           └── [jobId]/route.ts      # GET job status + posts on completion
└── ...

components/
├── config/
│   └── CredentialsForm.tsx           # Add source selection + optional X credential fields
└── printer/
    ├── PrinterInterface.tsx          # Ingest → select post → generate idea flow
    └── IdeaPrintout.tsx              # Provenance rendering (existing pattern)

lib/
├── trends/
│   ├── sources/
│   │   ├── types.ts                  # Source interface + source kinds
│   │   ├── registry.ts               # Source registry/factory
│   │   ├── hackerNews.ts             # Free source
│   │   ├── rssBundle.ts              # Free source
│   │   └── xTwitter.ts               # Credentialed source (P2)
│   ├── normalize.ts                  # Excerpt cap, HTML stripping, URL canonicalization
│   └── dedupe.ts                     # Cross-run dedupe strategy
└── utils/
    └── storage.ts                    # Persist trend posts/runs/sources (existing)

tests/
├── unit/
│   └── trends/                       # normalize/dedupe/source mapping
├── integration/
│   └── api/                          # /api/trends/ingest routes
└── e2e/
    └── trends.spec.ts                # P1: free ingestion → select → generate → provenance
```

**Structure Decision**: Use the existing Next.js App Router layout (`app/`) with colocated API routes. Trend source logic is isolated in `lib/trends/*` to keep API handlers thin and testable.

## Complexity Tracking

No constitution violations requiring justification.

---

## Planning Complete

### Deliverables

**Phase 0 (Research)**:

- [research.md](research.md)

**Phase 1 (Design)**:

- [data-model.md](data-model.md)
- [contracts/api-spec.yaml](contracts/api-spec.yaml)
- [quickstart.md](quickstart.md)
- Agent context updated (GitHub Copilot)

### Next Steps

1. Generate `tasks.md` (Phase 2)
2. Implement P1 free-source ingestion end-to-end
3. Add P2 X/Twitter provider behind credential requirement
4. Validate: lint, type-check, unit/integration tests, P1 E2E journey
