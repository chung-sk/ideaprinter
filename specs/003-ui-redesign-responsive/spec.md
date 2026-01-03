# Feature Specification: Responsive UI Redesign

**Feature Branch**: `003-ui-redesign-responsive`  
**Created**: 2026-01-03  
**Status**: Draft  
**Input**: User description: "Design a refreshed UI look and ensure the experience fits well on both desktop web and mobile (responsive), with validation across common viewport sizes."

## Clarifications

### Session 2026-01-03

- Q: What level of automated testing is required for this feature (especially US1 P1 and Share reliability)? → A: Test-first; add Playwright E2E tests for US1 (P1 core flow) + US4 (Share valid/invalid) and unit tests for share payload parsing/validation.
- Q: How should the UI indicate the user’s current location in primary navigation (FR-002)? → A: Visually distinguish the active navigation item on both mobile and desktop.
- Q: How should contrast validation be performed for WCAG 2.1 AA (FR-007/SC-004)? → A: Both automated axe-core checks for core pages and manual spot checks for edge UI states.
- Q: How should reduced-motion preferences be handled? → A: Respect `prefers-reduced-motion` by disabling or minimizing motion when enabled.
- Q: Should we add an explicit performance/bundle regression guard for this feature? → A: Yes—run `next build` and record/compare bundle size and key build output signals; fail if clearly worse.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Use the app comfortably on mobile and desktop (Priority: P1)

As a user, I can navigate the app and complete the core “generate an idea and review the output” flow on both a phone and a desktop without layout issues.

**Why this priority**: If the core flow is hard to use on mobile or desktop, the redesign fails its primary goal.

**Independent Test**: Open the app at common mobile and desktop viewport sizes, complete the core flow end-to-end, and verify no blocking usability issues.

**Acceptance Scenarios**:

1. **Given** a mobile viewport (e.g., 320–430px wide), **When** the user navigates through the primary pages and generates an idea, **Then** the UI fits the viewport without horizontal scrolling and the primary actions remain usable.
2. **Given** a desktop viewport (e.g., 1024–1440px wide), **When** the user generates an idea and reviews the printout, **Then** content is readable and controls are not clipped, overlapped, or pushed off-screen.

---

### User Story 2 - Seamless switching between layouts (Priority: P2)

As a user, when I switch device orientation or resize the browser, the UI adapts and I do not lose my place or in-progress inputs.

**Why this priority**: Users frequently rotate phones and resize desktop windows; losing context breaks trust and increases friction.

**Independent Test**: Start a typical flow, resize/rotate mid-flow, and confirm the UI adapts and state is preserved.

**Acceptance Scenarios**:

1. **Given** the user has partially completed a form or entered configuration, **When** the viewport changes (resize or rotate), **Then** the user remains on the same page and their in-progress inputs are preserved.
2. **Given** the user is viewing an idea printout, **When** the viewport changes, **Then** the printout reflows (wraps/scrolls as needed) without truncating content or hiding essential controls.

---

### User Story 3 - Consistent, refreshed look across the app (Priority: P3)

As a user, the app looks cohesive across pages (navigation, typography, spacing, feedback states), so it feels easier to understand and more polished.

**Why this priority**: Consistency reduces confusion and makes the new design feel intentional.

**Independent Test**: Navigate across the primary pages and verify consistent layout structure and feedback patterns.

**Acceptance Scenarios**:

1. **Given** the user navigates between the primary pages, **When** they interact with buttons, forms, and navigation, **Then** visual patterns and feedback states are consistent (loading, disabled, error, focus).
2. **Given** an error condition is triggered (e.g., invalid input or a failed request), **When** the UI displays an error, **Then** the message is clearly visible and provides a user-actionable next step (retry, adjust input, or navigate elsewhere).

---

### User Story 4 - Open and view shared ideas reliably (Priority: P2)

As a user, when I open a shared idea link, the page loads without blank screens or hydration failures, and I can either view the idea or see a clear error message.

**Why this priority**: Sharing is a core “handoff” flow; a blank page breaks trust and blocks collaboration.

**Independent Test**: Open the Share page with and without valid share payload data on both mobile and desktop; confirm it renders a usable UI in both cases.

**Acceptance Scenarios**:

1. **Given** a share link containing valid encoded idea data, **When** the user opens `/share?data=...` on mobile or desktop, **Then** the idea is rendered and the page remains interactive.
2. **Given** a share link missing or containing invalid idea data, **When** the user opens `/share` (or `/share?data=...`), **Then** the page shows a friendly, actionable error message (not a blank screen) and provides a way back to the printer.

### Edge Cases

- Very small screens (down to 320px width) where controls risk overlapping or being pushed off-screen.
- Device rotation mid-flow (portrait ↔ landscape).
- Long idea text or unusually long words that can cause overflow.
- Large text scaling (up to 200%) and reduced-motion preferences.
- Slow network or intermittent failures where loading and error states need to remain clear and non-blocking.
- Opening `/share` with missing, invalid, or legacy payloads.
- Client hydration/runtime errors causing blank screens (Share page currently impacted during validation).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The UI MUST be usable across common mobile and desktop viewport sizes (approximately 320px–1440px wide) without horizontal scrolling for primary pages.
- **FR-002**: Primary navigation MUST remain discoverable and usable on both mobile and desktop, and MUST clearly indicate the current location (active nav item visually distinguished on all viewports).
- **FR-003**: Core user flows (configure → generate idea → view output → print/share/history) MUST remain possible and understandable on both mobile and desktop.
- **FR-004**: Interactive elements for primary actions MUST meet a minimum touch target size of 44×44px.
- **FR-005**: The interface MUST support keyboard-only use for primary navigation and primary actions (focus visible and not trapped).
- **FR-006**: Text and interactive controls MUST remain usable when users increase text size up to 200%.
- **FR-006a**: Motion and animation MUST respect `prefers-reduced-motion` (minimize/disable non-essential transitions when enabled).
- **FR-007**: The UI MUST meet WCAG 2.1 AA contrast requirements for text and essential UI controls, validated via automated axe-core checks for core pages plus manual spot checks for edge UI states.
- **FR-008**: The UI MUST provide consistent feedback states across pages (loading, disabled, focus, and error) with clear user-facing messages.
- **FR-015**: The feature MUST include automated tests written first: Playwright E2E coverage for US1 (P1 core flow) and US4 (Share valid + missing/invalid), plus unit tests for share payload parsing/validation.
- **FR-016**: The feature MUST include a build-time regression check by running `next build` and capturing bundle/build output; the check MUST fail on clear, unexplained regressions.
- **FR-013**: The Share page (`/share`) MUST not render as a blank screen on mobile or desktop; it MUST render either the shared idea or a user-actionable error state.
- **FR-014**: The Share page MUST not produce client-side hydration failures that replace server HTML with an empty/invalid client render during normal usage.

### Validation Findings (Chrome DevTools)

- No horizontal overflow was observed on Home/History/Config at tested sizes (mobile ~390×844 and desktop ~1280×800).
- Multiple interactive elements are currently below the 44×44px touch target guideline:
  - Home: Random/Trends buttons (~38px tall), and header links.
  - History: Search input (~42px tall), sort direction button (~39px wide), and link-like actions (e.g., Reset Filters).
  - Config: API key eye toggle (~28×28), several category chips (~43px tall), and link-like actions.
- Config: the primary action “Save Configuration” is below the fold on both mobile and desktop, which is acceptable but must remain clearly reachable and not hidden by fixed elements.
- Share: `/share` currently fails with client errors and renders blank during validation; must be corrected as part of readiness for responsive UX.
- **FR-009**: The idea printout/output view MUST remain readable on mobile (wrapping or scrolling as needed) and MUST not truncate content.
- **FR-010**: When the viewport changes (resize/rotation), the UI MUST reflow without overlapping/clipping essential controls.
- **FR-011**: When the viewport changes mid-flow, the system MUST preserve in-progress user context (e.g., partially entered configuration) for the current session.
- **FR-012**: The refreshed design MUST keep the product identity recognizable (product name/branding) while improving visual consistency across pages.

### Assumptions

- The redesign updates layout, spacing, typography, and visual consistency without changing core features or data behavior.
- The existing navigation structure and primary page set remain the same.

### Out of Scope

- Adding new product features, new pages, or new data collection.
- Changing the underlying idea-generation logic or external integrations.

### Dependencies

- Agreement on the target look-and-feel direction for the refreshed UI.
- Availability of representative devices/viewport sizes to validate usability.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can complete the core flow (configure → generate idea → view output) on both a small mobile viewport (≈320px wide) and a desktop viewport (≈1440px wide) without horizontal scrolling or blocked controls.
- **SC-002**: In a basic usability check, at least 90% of participants can locate and use the primary actions (Generate, Print/Export, History, Share, Config) within 30 seconds on both mobile and desktop.
- **SC-003**: In viewport-switch testing (resize and device rotation), 100% of tested scenarios preserve the user’s current page and in-progress inputs during the same session.
- **SC-004**: Accessibility validation passes for: automated WCAG 2.1 AA contrast checks (axe-core) on core pages, keyboard access to primary actions, and readable layouts at 200% text size.
- **SC-005**: On Home/History/Config, at least 95% of visible interactive elements meet the 44×44px touch target guideline at a mobile viewport (~390×844).
- **SC-006**: `/share` renders a non-blank UI with either content or a friendly error on both mobile (~390×844) and desktop (~1280×800), with no hydration error logs during a standard load.
- **SC-007**: `next build` completes and reported bundle/build output shows no clear regression compared to baseline captured at the start of this feature.
