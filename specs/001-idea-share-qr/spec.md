# Feature Specification: Shareable Idea QR

**Feature Branch**: `001-idea-share-qr`  
**Created**: 2026-01-01  
**Status**: Draft  
**Input**: Make the QR code reliably scannable so ideas can be shared to other people; sharing must support exporting the idea in `.md` or `.txt` format and include the idea's Source URL. Update the public Share URL base to `ideaprinter.rytix.tech`. Fix the `/history` “View” button so it actually shows the saved idea details (after an idea has been generated).

## Clarifications

### Session 2026-01-01

- Q: What does the Share URL contain? → A: Self-contained idea payload in the URL (`?data=...`) so recipients can view without auth/session.
- Q: How is the Share URL base domain determined? → A: Use `NEXT_PUBLIC_SITE_ORIGIN` if set; otherwise fall back to `window.location.origin` (local dev).
- Q: Do exports include the Share URL? → A: Yes; include `Share URL:` in both `.md` and `.txt` exports.
- Q: How does History “View” open an idea? → A: Open the share view using the same payload-based link (`/share?data=...`).

### Session 2026-01-02

- Q: What max Share URL length target should we enforce (characters)? → A: 1000 characters max.

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Share an idea via scannable QR (Priority: P1)

As a user who generated an idea, I want to show a QR code that another person can scan to view the idea and download it as a `.md` or `.txt` file so I can share the idea outside the app.

**Why this priority**: Sharing is the core user value; if the QR is not reliably scannable, the share flow fails.

**Independent Test**: Generate one idea, open its share surface, scan the QR with a phone camera, and confirm the recipient can view and download the idea.

**Acceptance Scenarios**:

1. **Given** an idea has been generated and is available to the user, **When** the user opens the share surface for that idea, **Then** a QR code is shown that can be scanned successfully using a standard phone camera app.
2. **Given** a recipient scans the QR code, **When** the share link opens in a browser (including Chrome in a private/incognito window), **Then** the recipient can view the idea details without needing access to the original user's session.
3. **Given** the recipient is viewing the shared idea, **When** they choose to download the idea as `.md`, **Then** the downloaded file contains the idea name, category, unique ID, generated timestamp, concept, problem (“gap”), solution (“fix”), and Source URL.
4. **Given** the recipient is viewing the shared idea, **When** they choose to download the idea as `.md` or `.txt`, **Then** the downloaded file also includes the Share URL.

---

### User Story 2 - Share URLs use the public domain (Priority: P2)

As a user exporting or sharing an idea, I want the displayed Share URL to use `ideaprinter.rytix.tech` so shared links work consistently and look professional.

**Why this priority**: If share links show `localhost`, recipients can’t use them and the export is misleading.

**Independent Test**: Generate an idea and create a share/export; verify the Share URL begins with `https://ideaprinter.rytix.tech/`.

**Acceptance Scenarios**:

1. **Given** `NEXT_PUBLIC_SITE_ORIGIN` is configured as `https://ideaprinter.rytix.tech`, **When** an idea is generated and a share link is produced, **Then** the Share URL base shown to users (in UI and in exported files) is `ideaprinter.rytix.tech` (not `localhost`).
2. **Given** a recipient uses the Share URL, **When** they open it in a browser, **Then** it resolves to the correct shared idea view.

---

### User Story 3 - View saved ideas from History (Priority: P3)

As a user, I want the `/history` page “View” button to show the saved idea’s details so I can review and share past ideas.

**Why this priority**: History is only useful if entries can be viewed; a non-functional “View” blocks core navigation.

**Independent Test**: Generate an idea, navigate to `http://localhost:3000/history`, click “View” on the newest item, and confirm a non-empty idea view is shown.

**Acceptance Scenarios**:

1. **Given** at least one idea has been generated and appears in Idea History, **When** the user opens `http://localhost:3000/history` and clicks “View” for an item, **Then** the app displays that idea’s details (name, category, concept, gap, fix, generated timestamp, and Source URL).
2. **Given** the user clicks “View” for an item, **When** the app loads the idea details, **Then** the displayed view is not blank and provides a clear error message if the idea cannot be loaded.
3. **Given** the user is viewing a historical idea, **When** they choose to share/export, **Then** the same QR + download behaviors from User Story 1 apply.

Note: The History “View” action should navigate to the same share view used by QR and exports (payload-based `?data=...`).

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

- History is empty: `/history` communicates there are no saved ideas.
- Recipient opens a malformed/expired share link: show an error that explains the link is invalid and cannot be loaded.
- Source URL is missing for an idea: exports and views still work, and clearly indicate “Source URL: Not available”.
- Very long idea text: QR remains scannable and share still works.
- Recipient is offline or network fails while opening share: show a user-friendly failure state.

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST present a QR code for a shareable idea such that a typical mobile device camera can scan it successfully.
- **FR-002**: System MUST encode a Share URL in the QR code that opens a human-readable idea view for the recipient; the Share URL MUST be self-contained by carrying the idea data in the URL (e.g., `?data=...`) rather than relying on the origin user's session or device storage.
- **FR-003**: System MUST allow the recipient to download the shared idea as `.md`.
- **FR-004**: System MUST allow the recipient to download the shared idea as `.txt`.
- **FR-005**: System MUST include the idea’s Source URL in the shared idea view and in both export formats when the Source URL is available.
- **FR-006**: System MUST indicate “Source URL: Not available” when no Source URL exists for an idea.
- **FR-007**: System MUST use the configured public site origin as the base domain for Share URLs shown to users and stored in exported files (via `NEXT_PUBLIC_SITE_ORIGIN`; expected production value: `https://ideaprinter.rytix.tech`). When not configured, the system MAY fall back to the runtime origin for local development.
- **FR-008**: System MUST allow a recipient to view a shared idea without needing access to the original user’s authenticated session (i.e., the share link must contain everything needed to render the idea).
- **FR-009**: On `http://localhost:3000/history`, the “View” action MUST navigate to a non-blank idea details view (the share view), or show a clear error message; it MUST NOT result in an empty/blank view.
- **FR-010**: System MUST include the Share URL in both `.md` and `.txt` exports.
- **FR-011**: System MUST enforce a max Share URL length of 1000 characters; if the generated Share URL would exceed this limit, the system MUST show a clear error and MUST NOT render an unscannable QR.

### Key Entities _(include if feature involves data)_

- **Idea**: A generated concept with fields including ID, name, category, generated timestamp, concept text, problem/gap text, solution/fix text, and optional Source URL.
- **Idea History Item**: A reference to a previously generated Idea that is displayed in `/history` and can be opened via “View”.
- **Shared Idea View**: A read-only rendering of an Idea accessible via Share URL.
- **Idea Export**: A `.md` or `.txt` downloadable representation of the Idea, including Source URL and Share URL.

### Assumptions & Dependencies

- Ideas may or may not have a Source URL; when present, it represents the primary external page associated with the idea’s originating signal.
- The public domain `ideaprinter.rytix.tech` is available and intended to be used in all user-facing Share URLs.
- Deployments will set `NEXT_PUBLIC_SITE_ORIGIN=https://ideaprinter.rytix.tech` so user-facing Share URLs use the public domain.
- Shared links are payload-based (the URL includes the idea data); this feature does not require server-side persistence for shared ideas.
- Users must generate an idea before `/history` shows items; this feature does not change that prerequisite.

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: At least 95% of attempted scans of the QR code (using standard mobile camera apps) successfully open the shared idea view within 5 seconds.
- **SC-002**: A recipient can download the idea as `.md` or `.txt` in under 15 seconds on a typical consumer internet connection.
- **SC-003**: Clicking “View” on an idea in `/history` successfully shows the idea content (or a clear error state) in 99% of attempts.
- **SC-004**: When configured with `NEXT_PUBLIC_SITE_ORIGIN=https://ideaprinter.rytix.tech`, 100% of displayed/exported Share URLs use the `ideaprinter.rytix.tech` base domain.
- **SC-005**: When an Idea has a Source URL available, 100% of exports include it.
- **SC-006**: 100% of generated Share URLs are ≤ 1000 characters, or the user is shown a clear error state instead of a QR.
