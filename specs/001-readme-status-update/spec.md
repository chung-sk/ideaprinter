# Feature Specification: README Status & Docs Links Refresh

**Feature Branch**: `001-readme-status-update`  
**Created**: 2026-01-02  
**Status**: Draft  
**Input**: User description: "Update README.md to reflect current project completion status and implemented features, and update documentation references to the ideaprinter/docs path."

## Clarifications

### Session 2026-01-02

- Q: What is the “Last updated” format/location in README? → A: ISO `YYYY-MM-DD` in a top “Status” block.
- Q: How should we implement the required docs “E2E” check for the P1 journey? → A: Add a Vitest-based automated check.
- Q: What is the scope of README link updates? → A: Update the 5 required docs links plus any other README references that point to moved docs (normalize to `docs/`).
- Q: What counts as “documentation links” for automated validation? → A: README Markdown links where the target is a repo-relative path under `docs/` ending in `.md`.
- Q: What are the required must-pass validation commands for this change? → A: `npm test`, `npm run lint`, and `npm run type-check`.
- Q: What counts as the required “formatting check” gate from the constitution? → A: Add a non-mutating Prettier gate: `npm run format:check` (runs `prettier --check .`).
- Q: How should README reflect recent shipped features/fixes without becoming a full changelog? → A: Add a short “Recent Updates” section (3–5 bullets: features shipped + issues fixed) and link to `docs/PROJECT_SUMMARY.md` for full detail.
- Q: How detailed should the README shipped-features section be vs docs/PROJECT_SUMMARY.md? → A: Match PROJECT_SUMMARY’s major sections in README with 1–3 bullets each (Core / UX / Config / History / Performance / Security) and keep deep detail in `docs/PROJECT_SUMMARY.md`.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Understand the project at a glance (Priority: P1)

As a new visitor to the repository, I want the README to accurately describe what the product does today and what key features are included, so I can quickly decide whether it meets my needs.

**Why this priority**: The README is the first touchpoint; clarity reduces confusion and support overhead.

**Independent Test**: Can be fully tested by reading the README from top to bottom and confirming it reflects the current, shipped capabilities and status.

**Acceptance Scenarios**:

1. **Given** a first-time reader, **When** they read the top sections of the README, **Then** they can identify what the app does and that the project is complete/production-ready.
2. **Given** a first-time reader, **When** they review the features list, **Then** the list represents implemented functionality (not aspirational items marked as complete).
3. **Given** a first-time reader, **When** they scan “Recent Updates”, **Then** they can quickly see the most recent shipped features and fixes and follow a link to full details.

---

### User Story 2 - Find the right documentation quickly (Priority: P2)

As a contributor or operator, I want README links to reliably take me to the correct documentation files, so I can find detailed guidance without searching.

**Why this priority**: Broken links waste time and make the project appear incomplete or poorly maintained.

**Independent Test**: Can be fully tested by clicking every README link that targets a repo-relative `docs/*.md` file and verifying each resolves to the intended file under the `docs/` directory.

**Acceptance Scenarios**:

1. **Given** the documentation files live under `docs/`, **When** a reader clicks a documentation link from the README, **Then** the link opens the correct file under `docs/`.

---

### User Story 3 - Confirm what’s done vs what’s next (Priority: P3)

As a stakeholder, I want the README to clearly separate implemented features from future enhancements, so expectations are set correctly.

**Why this priority**: Prevents misalignment and avoids implying features exist when they do not.

**Independent Test**: Can be fully tested by reviewing the README’s “Roadmap/Future” section and verifying it only contains genuinely future-looking items.

**Acceptance Scenarios**:

1. **Given** a roadmap section exists, **When** a reader scans it, **Then** completed items are not mislabeled as future work and future items are not marked as shipped.

### Edge Cases

- Documentation files moved (e.g., from repository root to `docs/`) and existing links become stale.
- The README contains corrupted/invalid characters in headings that render poorly on Git hosting.
- Links work on GitHub web UI and when viewing markdown locally.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The README MUST explicitly state the current project status (e.g., complete/production-ready) and include a “Last updated” date in ISO format (`YYYY-MM-DD`) in the same status block near the top of the document.
- **FR-002**: The README MUST describe the current, implemented user-facing capabilities in plain language, organized to match the major sections in `docs/PROJECT_SUMMARY.md` (Core / UX / Config / History / Performance / Security) with 1–3 bullets each.
- **FR-003**: The README MUST NOT claim completion of features that are not actually present (e.g., user accounts/cloud sync) without clear qualification.
- **FR-004**: The README MUST provide a documentation section whose links point to the correct files under `docs/` (including API docs, contributing, deployment, project summary, and audit report), and any other README references to moved documentation MUST be normalized to `docs/` paths.
- **FR-005**: The README MUST not contain malformed replacement characters (e.g., "�") in headings or section titles.
- **FR-006**: Setup instructions in the README MUST remain accurate and consistent with the current repository configuration (prerequisites, required configuration, and how to start the app).
- **FR-007**: If a roadmap/future section exists, it MUST clearly distinguish future enhancements from shipped functionality.
- **FR-008**: The repository MUST include an automated documentation validation test (implemented using the existing test runner) that verifies README documentation links resolve to existing files under `docs/` and that README headings do not contain malformed replacement characters.
- **FR-009**: Before the change is considered complete, `npm test`, `npm run lint`, `npm run type-check`, and `npm run format:check` MUST pass.
- **FR-010**: The README MUST include a short “Recent Updates” section with 3–5 bullet points summarizing recent shipped features and fixes, and it MUST link to `docs/PROJECT_SUMMARY.md` for full details.

### Assumptions

- The `docs/` directory is the canonical location for project documentation files.
- The current project status and implemented capabilities can be summarized from existing repository documentation.

### Dependencies

- The documentation files referenced from the README exist under `docs/` and remain available in the repository.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of README Markdown links targeting repo-relative `docs/*.md` files resolve to existing files under `docs/`.
- **SC-002**: A reader can confirm project status (complete/production-ready) within 30 seconds of opening the README.
- **SC-003**: A reader can find setup steps and the documentation index within 2 minutes without searching the repository tree.
- **SC-004**: A reviewer can verify the README feature list matches the project summary (no major implemented capability omitted; no non-existent capability listed as shipped).
- **SC-005**: The README “Recent Updates” section contains 3–5 bullets and includes a link to `docs/PROJECT_SUMMARY.md`.
