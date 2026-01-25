# Data Model (Phase 1): Responsive UI Redesign

This feature is primarily UI/UX and does not introduce new persisted entities. It relies on existing types and storage patterns.

## Entities

### UserConfiguration

- **Source type**: `UserConfiguration` in `lib/types/idea.ts`
- **Storage**: client-side `localStorage` (encrypted API keys are stored locally)
- **Fields (key subset)**:
  - `encryptedGeminiApiKey?: string`
  - `preferredModel?: GeminiModel`
  - `preferredCategories?: IdeaCategory[]`
  - `preferredSource?: TrendSourceKind`
  - `generationCount: number`
  - `createdAt`, `updatedAt` (ISO)

### GeneratedIdea

- **Source type**: `GeneratedIdea` in `lib/types/idea.ts`
- **Storage**: client-side `localStorage` history (soft-delete supported via `deletedAt?`)
- **Fields (key subset)**:
  - `appName`, `category`, `concept`, `theGap`, `theFix`
  - `generatedAt` (ISO)
  - `uniqueId` (used as identifier)
  - `provenance?: TrendProvenance`

### Idea (Shareable subset)

- **Source type**: `Idea` in `lib/types/idea.ts`
- **Purpose**: Compact subset of `GeneratedIdea` used for share links.
- **Fields**:
  - `id`, `name`, `category`, `generatedAt`, `concept`, `gap`, `fix`, `provenance?`

### SharePayload

- **Source**: `encodeSharePayload` / `decodeSharePayload` in `lib/share/sharePayload.ts`
- **Storage**: encoded into URL query string (`/share?data=...`)
- **Versioning**: payload version `v1`.

## Relationships

- `UserConfiguration` influences idea generation requests (preferred category/model/source).
- `/api/generate-idea` returns an `IdeaGenerationResponse` (shape similar to `GeneratedIdea`), which is saved to local history.
- `GeneratedIdea` is mapped to `Idea` when generating share URLs; `SharePayload` is a derived representation of `Idea`.

## Validation Rules (relevant to this feature)

- Share decoding:
  - Missing/invalid `data` must not crash rendering; show actionable UI.
- History:
  - Long text must reflow without horizontal overflow.
- UI controls:
  - Primary interactive elements meet 44×44px targets (FR-004).
