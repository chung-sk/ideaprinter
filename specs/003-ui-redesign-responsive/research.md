# Phase 0 Research: Responsive UI Redesign

This document resolves technical unknowns and records key decisions for implementing the responsive UI redesign defined in `spec.md`.

## Decisions

### 1) Keep existing Next.js App Router architecture

- **Decision**: Keep the current Next.js App Router pages (`/`, `/history`, `/config`, `/share`) and existing component structure; do not add new pages or new navigation concepts.
- **Rationale**: The feature is explicitly a redesign (layout/spacing/interaction/accessibility), not new functionality.
- **Alternatives considered**:
  - Rebuild navigation as a new layout system → rejected (scope creep, higher regression risk).

### 2) Address mobile usability via touch-target sizing + layout spacing, not new UI primitives

- **Decision**: Fix the identified DevTools issues by ensuring primary interactive elements meet a minimum 44×44px touch target size and by improving layout density/spacing using existing Tailwind utilities.
- **Rationale**: Directly satisfies FR-004 and improves usability with minimal risk.
- **Alternatives considered**:
  - Introduce a new component library / design system → rejected (adds new tokens and styling primitives; higher churn).

### 3) Share page must always render a non-blank state

- **Decision**: `/share` renders one of:
  - decoded idea content when `data` is valid
  - a friendly, actionable empty/error state when `data` is missing/invalid
- **Rationale**: Matches User Story 4 and prevents the known failure mode (“blank + hydration errors”).
- **Alternatives considered**:
  - Redirect `/share` to `/history` when missing data → rejected (hides the expected share entrypoint and makes debugging harder).

### 4) Preserve user context across resize/rotation using current client-side storage model

- **Decision**: Preserve form inputs and selected state by relying on existing React state patterns and localStorage utilities already used by the app.
- **Rationale**: Meets User Story 2 without adding server state.
- **Alternatives considered**:
  - Introduce server-backed sessions/state → rejected (out of scope; higher complexity).

### 5) Production-only webpack chunk tuning

- **Decision**: Keep custom `splitChunks` overrides production-only.
- **Rationale**: Dev HMR/runtime module loading is more fragile; production is where chunking optimization matters.
- **Alternatives considered**:
  - Keep splitChunks in dev → rejected (observed “Cannot read properties of undefined (reading 'call')” runtime failures).

## Implementation Notes

- Responsive targets: verify at 320–430px width (mobile) and 1024–1440px width (desktop).
- Accessibility targets: keyboard focus visibility, readable layouts at 200% text size, and WCAG AA contrast (no new hard-coded colors).
- Share robustness: decoding errors must be caught and rendered as UI, not thrown during render.

## Open Questions (resolved)

- **“Gemini 3 design a new UI outlook”**: Interpreted as UX/UI redesign scope only (layout/visual consistency), not changing the AI model integration. The model selection already supports `gemini-3-flash-preview`.
