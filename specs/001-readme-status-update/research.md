# Phase 0 Research: README Status & Docs Links Refresh

## Decisions

### Decision: Treat the repository as “complete / production-ready”

**Rationale**: The existing project documentation indicates the project is complete and deployment-ready, and the README should align with the canonical project status narrative.
**Alternatives considered**:

- Label as “in progress”: rejected because it contradicts the existing completion summary and creates unnecessary uncertainty.

### Decision: Use `docs/` as the canonical documentation location

**Rationale**: Documentation files currently reside under `docs/`, and README links should consistently reference that directory to avoid broken links and reader confusion.
**Alternatives considered**:

- Duplicate docs at repo root: rejected due to duplication and drift risk.

### Decision: Remove or correct misleading “completed” claims in the README roadmap

**Rationale**: The README currently includes items that read like shipped features (e.g., “user accounts and cloud sync”) even though the architecture is explicitly anonymous/session-based and localStorage-oriented. Marking aspirational items as complete violates the spec requirement to avoid misrepresentation.
**Alternatives considered**:

- Keep the items but add heavy disclaimers: rejected because it still reads as misleading in a quick scan.

### Decision: Fix malformed heading characters in README

**Rationale**: Replacement characters (e.g., “�”) degrade perceived quality and can cause inconsistent rendering across viewers.
**Alternatives considered**:

- Leave as-is: rejected because it violates spec FR-005.

## Validation Notes

- Documentation link targets should be verified by file existence under `docs/` and by spot-checking links in a GitHub-style markdown renderer.
- No runtime behavior changes are planned; testing is documentation verification against acceptance scenarios and success criteria.
