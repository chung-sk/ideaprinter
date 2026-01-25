# Phase 1 Data Model: README Status & Docs Links Refresh

This feature is documentation-only. The “data model” is a lightweight contract for documentation references to ensure the README stays correct and maintainable.

## Entities

### `DocumentationFile`

Represents a canonical documentation file under `docs/`.

**Fields**:

- `path`: string (must start with `docs/`)
- `title`: string (human-readable name)
- `purpose`: string (1–2 sentences)

**Validation rules**:

- File MUST exist in the repository.
- README links MUST point to this path.

### `ReadmeDocLink`

Represents a link entry in the README “Documentation” section.

**Fields**:

- `label`: string
- `targetPath`: string (relative path, expected `docs/<NAME>.md`)

**Validation rules**:

- `targetPath` MUST resolve to an existing file.
- Labels SHOULD match the destination document’s title for scanability.

## Relationships

- README “Documentation” section contains zero or more `ReadmeDocLink` entries.
- Each `ReadmeDocLink` references exactly one `DocumentationFile`.
