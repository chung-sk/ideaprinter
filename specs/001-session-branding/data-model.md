# Data Model: Global Quota Limits & Branding

**Feature**: [spec.md](spec.md)
**Date**: December 25, 2025
**Updated**: December 26, 2025

## Entity: SharedKeyGlobalQuota

Tracks global usage for the shared/default API key.

**Fields**:

- `dailyCount` (number): Total successful generations across all users using the shared key
- `dailyLimit` (number): Maximum allowed (default: 30)
- `dailyResetAt` (ISO timestamp): When the daily counter resets

**Validation rules**:

- `dailyCount` is integer >= 0
- `dailyLimit` is integer > 0
- `dailyResetAt` is in the future when a window is active

**State transitions**:

- On request (using default/shared API key only):
  - If `now >= dailyResetAt`, reset `dailyCount = 0` and set `dailyResetAt = now + 24h`
  - If `dailyCount >= dailyLimit`, request is blocked and retry metadata is returned
  - If request succeeds, increment `dailyCount`
- On request (using user-provided API key):
  - Quota check is **skipped entirely**

## Entity: APIKeyMode

Indicates whether a request is using the shared/default key or a user-provided key.

**Fields**:

- `isUsingSharedKey` (boolean): true if using app's default key, false if user-provided
- `keySource` (string): "default" or "user_provided"

**Validation rules**:

- Must be determinable for every request

## Entity: Branding

Represents the static assets and attribution displayed in the UI.

**Fields**:

- `productName` (string): "ideaprinter"
- `poweredByText` (string): "powered by rytix.tech"
- `logoAssetPath` (string): path under `public/` (or equivalent)

**Validation rules**:

- branding must render at mobile + desktop breakpoints without overlapping primary UI
