# Feature Specification: Global Quota Limits & Branding

**Feature Branch**: `001-session-branding`  
**Created**: December 25, 2025  
**Status**: Draft  
**Input**: User description: "(1) No user login; protect the shared default Gemini API key by enforcing a global quota. (2) Add product logo and show 'ideaprinter' powered by rytix.tech."

## Clarifications

### Session 2025-12-26

- Q: Should the “overall/global” quota apply only to the app’s default API key, or also to user-provided API keys? → A: Apply global quota only when using the app’s default API key; do not apply the global quota when a user provides their own API key.
- Q: Should the shared/default-key global quota be daily-only or daily + per-minute? → A: Daily-only.
- Q: Should the shared/default-key global quota persist across backend reloads / cold starts (e.g., switching between “Your Key” and “Shared” in dev causing a reload)? → A: No. Best-effort in-memory tracking is acceptable; quota may reset on backend reload/cold start.
- Q: Should navigating between app pages (e.g., / → /config → /) reset shared-key quota? → A: No. Page navigation must not reset quota. In dev, hot module replacement (HMR) should not reinitialize quota state as a side-effect of navigation.

## Assumptions

- No user login/account creation is introduced as part of this feature.
- The primary “chargeable action” to limit is idea generation requests.
- The app may use a shared default Gemini API key for visitors who do not provide their own.
- The system will enforce an **overall/global quota** when using the shared default API key so that the shared free-tier usage is protected.
- If a user supplies their own API key, their requests are **not** blocked by the shared/global quota.
- Default limits (can be adjusted later): up to **30 successful idea generations per 24 hours for the shared default key**.
- Global quota tracking may be **best-effort** in MVP (e.g., in-memory counter) and may reset on backend reload/cold start; however, client-side navigation between app pages must not reset quota.
- Branding should be visible on the main user-facing screens without adding new pages.

## Out of Scope

- User accounts, sign-in, or any identity verification.
- Per-user fairness for shared-key usage (no per-user allocation; shared-key limits are global).
- Paid plans, billing, or user-specific quota purchases.

## Dependencies

- The system can differentiate between requests using the shared default API key versus a user-provided API key.
- The system can track shared-key usage globally across requests to enforce limits consistently.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Global Quota Limits for Shared Default Key (Priority: P1)

As a visitor using the shared/default API key, I can use IdeaPrinter without signing in, while the system protects the shared key by limiting the total number of successful idea generations allowed for everyone.

**Why this priority**: Protects the web app from excessive usage while keeping the experience frictionless (no login).

**Independent Test**: Can be tested by generating ideas until the shared-key quota is exceeded; verify further attempts using the shared key are blocked with a clear retry time; verify providing a user API key allows generation even when the shared quota is exhausted.

**Acceptance Scenarios**:

1. **Given** a visitor is using the shared/default API key, **When** they generate an idea successfully, **Then** the system counts that generation against the shared-key global allowance
2. **Given** the shared-key global allowance is exhausted, **When** a visitor using the shared/default API key attempts another generation, **Then** the system blocks the request and shows a clear message explaining they have reached the shared limit and when they can try again
3. **Given** the shared-key global allowance is exhausted, **When** a visitor provides their own API key and generates an idea, **Then** the system allows generation (not blocked by the shared-key global quota)

---

### User Story 2 - Quota Transparency (Priority: P2)

As a user, I can see whether I’m using the shared/default key or my own key, and I can see the remaining shared-key allowance (when applicable), so I can understand why generation is blocked and what to do next.

**Why this priority**: Builds user trust and reduces support questions (“Why can’t I generate?”) by making limits and identity transparent.

**Independent Test**: Can be tested by viewing remaining shared-key allowance, exhausting it, and verifying the UI explains the shared limit and that providing a user key removes the shared limit block.

**Acceptance Scenarios**:

1. **Given** a user is on the app, **When** the UI is displayed, **Then** the user can see whether the app is using the shared/default key or a user-provided key
2. **Given** the user is using the shared/default key, **When** they look at the usage indicator, **Then** they can see remaining shared-key generations and any reset timing information

---

### User Story 3 - Product Branding (Priority: P3)

As a visitor, I can clearly see that the product is called “ideaprinter” and that it is powered by rytix.tech, so the experience is recognizable and attributable.

**Why this priority**: Establishes identity and credibility for the product.

**Independent Test**: Can be tested by visiting primary pages and verifying the logo and “powered by rytix.tech” branding are present and readable.

**Acceptance Scenarios**:

1. **Given** a user visits the main IdeaPrinter screen, **When** the page loads, **Then** the ideaprinter logo is visible and the text “powered by rytix.tech” is present
2. **Given** a user navigates to other primary screens (e.g., configuration/history/share), **When** the pages load, **Then** the same branding is visible in a consistent location

---

### Edge Cases

- What happens when multiple users (and/or multiple tabs) generate concurrently while using the shared/default key?
- What happens when the backend reloads/restarts (dev hot reload, cold start, multi-instance routing) and in-memory quota state is lost?
- What happens in local development when Next.js HMR reloads modules during navigation (e.g., /config → /) — should quota remain stable?
- What happens when a user reaches the daily shared/default-key limit?
- What happens when idea generation fails (should it count against the limit)?
- What happens if a user’s device time is incorrect or changes suddenly?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST NOT require user login/account creation to enable call limits or branding
- **FR-002**: System MUST enforce **global** call limits for idea generation when using the shared/default API key
- **FR-003**: When the shared/default-key global limit is reached, the system MUST prevent further successful idea generation using the shared key and show a clear message describing the reason and the earliest retry time
- **FR-004**: If a user provides their own API key, the system MUST NOT block their generation requests due to the shared/default-key global quota
- **FR-005**: Failed idea generation attempts MUST NOT reduce the remaining allowance (only successful generations count)
- **FR-006**: If multiple tabs/users generate concurrently while using the shared/default key, the system SHOULD apply the shared/global limits consistently (no intentional bypass via concurrency); best-effort consistency is acceptable for MVP if using in-memory tracking.
- **FR-007**: The system MUST display whether the user is using the shared/default key or a user-provided key
- **FR-008**: When using the shared/default key, the system MUST display remaining allowance and any reset timing information
- **FR-011**: The system MUST display product branding (logo + “ideaprinter” name + “powered by rytix.tech”) on primary user-facing screens in a consistent location
- **FR-012**: Branding MUST remain readable on both desktop and mobile layouts
- **FR-013**: Branding MUST NOT block or materially interfere with the primary IdeaPrinter user flows (generate, view output, navigate)

### Key Entities _(include if feature involves data)_

- **Shared-Key Global Usage**: Represents usage tracking for the shared/default API key
  - Successful generation count: number of completed idea generations within the allowance windows
  - Window reset time: when the allowance replenishes
- **API Key Mode**: Indicates whether generation is using the shared/default key or a user-provided key
- **Branding Asset**: Represents the logo and product attribution
  - Product name: ideaprinter
  - Logo: ideaprinter visual mark
  - Attribution text: “powered by rytix.tech”

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Shared/default-key global call limits prevent more than the allowed number of successful idea generations in 100% of test scenarios
- **SC-003**: Users who hit call limits receive a clear, actionable explanation in 100% of test scenarios (what happened and when they can retry)
- **SC-004**: Users can distinguish shared/default key vs user-provided key and understand remaining allowance (when applicable) for 90%+ of users in usability review
- **SC-005**: Branding (product name + logo + attribution text) is visible and readable on the main screen and all primary screens in standard viewport sizes
