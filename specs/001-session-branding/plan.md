# Implementation Plan: Global Quota Limits & Branding

**Branch**: `001-session-branding` | **Date**: 2025-12-26 | **Spec**: [specs/001-session-branding/spec.md](spec.md)
**Input**: Feature specification from [specs/001-session-branding/spec.md](spec.md)

## Summary

Implement a shared/default-key **global daily quota** (30 successful generations per 24 hours) that is enforced only when the app uses its default Gemini API key. When a user provides their own API key, requests bypass the shared quota. The UI must clearly indicate whether the user is on the shared key or their own key, and show remaining shared-key quota when applicable.

Key clarification: global quota tracking may be **best-effort in-memory** for MVP and may reset on backend reload/cold start.

## Technical Context

**Language/Version**: TypeScript 5.6, React 18.3, Next.js 14.2 (App Router)
**Primary Dependencies**: `next`, `react`, `@google/generative-ai`, `framer-motion`, `lucide-react`
**Storage**:
- Client: localStorage/sessionStorage for user config/history (existing)
- Server: N/A for quota persistence in MVP (in-memory state). In local dev, store quota state on `globalThis` to avoid HMR reinitializing the counter during page navigation.
**Testing**: Vitest (unit + integration), Playwright (E2E), MSW for mocks
**Target Platform**: Next.js runtime (local dev + typical serverless deployment)
**Project Type**: Web application (single Next.js app with API routes)
**Performance Goals**:
- UI interactions: snappy (no heavy synchronous work)
- API: quota checks must be fast (in-memory read/modify)
**Constraints**:
- No login/accounts
- No DB/Redis required for MVP quota tracking
- Best-effort enforcement acceptable under concurrency/instance reload (per spec clarification)
**Scale/Scope**: MVP usage; shared key is protected from casual exhaustion, not hardened against distributed abuse

## Constitution Check

*GATE: Must pass before implementation proceeds.*

- **Code Quality**: PASS
  - No secrets hardcoded; keys handled via env and user config
  - Clear separation of concerns (quota module, API routes, UI)
- **Testing Standards**: PASS
  - Unit tests cover quota utility behavior
  - Integration tests cover API endpoints and quota enforcement/bypass
  - E2E covers P1 UI visibility of key mode/quota indicator
- **UX Consistency**: PASS
  - UI explicitly shows key mode and shared quota remaining
  - Error messaging includes a clear next action (provide own key or wait)
- **Performance Requirements**: PASS
  - Quota checks are in-memory operations and negligible vs AI call latency

## Project Structure

### Documentation (this feature)

```text
specs/001-session-branding/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── generate-idea/route.ts   # Enforces shared-key quota (best-effort) + bypass for user key
│   └── session/route.ts         # Returns key mode + shared quota status (if shared)
├── layout.tsx                   # Branding header
└── page.tsx

components/
├── common/Branding.tsx
└── printer/PrinterInterface.tsx # Shows key mode + remaining shared quota

lib/
├── auth/
│   ├── globalQuota.ts           # In-memory shared quota tracking
│   └── sessionClient.ts         # Client fetch helper for quota info
└── gemini/

tests/
├── unit/
├── integration/
└── e2e/
```

**Structure Decision**: Use the existing Next.js App Router layout (`app/`) with colocated API routes. Quota logic lives in a small `lib/auth/` utility so it can be reused by multiple API routes.

## Phase Plan (High Level)

### Phase 0: Research (Complete)

- Decide quota strategy: **best-effort in-memory** global counter for shared key only
- Document trade-offs: may reset on backend reload/cold start; acceptable for MVP
- Dev consideration: Next.js HMR can reload modules during navigation; quota state should be HMR-safe (use a `globalThis` singleton) so / → /config → / does not reset shared quota.

### Phase 1: Design & Contracts (Complete)

- Data model reflects `SharedKeyGlobalQuota` and `APIKeyMode`
- API contracts: `/api/generate-idea` and `/api/session` responses include key mode, shared quota remaining (when applicable)

### Phase 2: Task Planning (Next)

Tasks should be updated to reflect:
- Removal of per-session quota and cookies
- Global quota module behavior and tests
- UI updates (key mode indicator + shared remaining)
- Explicit note that quota can reset on backend reload/cold start (Option A)

## Complexity Tracking

No constitution violations requiring justification.
