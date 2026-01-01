# Research: Global Quota Limits & Branding

**Feature**: [spec.md](spec.md)
**Date**: December 25, 2025
**Updated**: December 26, 2025

## Decision 1: How to protect the shared default API key

**Decision**: Use an **in-memory global counter** for the shared/default API key; bypass quota checks entirely when a user provides their own API key.

**Rationale**:

- Simple and stateless: no database or Redis needed for MVP.
- Protects the shared free-tier key from exhaustion.
- Allows power users to bring their own key and continue generating without being blocked by the public pool.
- Accepts that cold starts may reset the counter (acceptable risk for MVP; can be upgraded to Redis/DB later if needed).

**Alternatives considered**:

- Per-session quotas (original approach; rejected because it doesn't protect the shared key effectively—users can clear cookies to bypass).
- Redis/Upstash (more robust, but adds infrastructure and configuration overhead not required for MVP).

## Decision 2: How to enforce global limits without a database

**Decision**: Use a **module-level in-memory variable** with a daily counter and reset timestamp.

**Rationale**:

- Stateless serverless functions can share memory within the same instance.
- Sufficient for MVP given the app's scale and the risk of cold-start resets is acceptable.
- Can be upgraded to Redis or a database later without changing the API contract.

**Alternatives considered**:

- Signed cookies carrying global state (doesn't work; no way to synchronize across users)
- File-based counter (works but adds file I/O overhead and concurrency issues)

## Decision 3: Where to enforce limits

**Decision**: Enforce global quota **inside `POST /api/generate-idea`** and keep the existing middleware IP throttle as a coarse safety net.

**Rationale**:

- The generate endpoint is the "chargeable action" and already returns structured errors.
- API route can detect whether user is providing their own key or using the shared default.
- Global quota applies only when using shared key.

**Alternatives considered**:

- Middleware-only enforcement (harder to detect API key source and coordinate window resets cleanly)

## Decision 4: How to expose quota status to users

**Decision**: Add **`GET /api/session`** that returns:

- API key mode (shared vs user-provided)
- remaining allowance (daily only, if using shared key)
- reset time

**Rationale**:

- Keeps the UI simple.
- Centralizes quota logic server-side.
- Allows users to see whether they're using the shared pool or their own key.

**Alternatives considered**:

- Compute allowance in the client (would require duplicating logic and trust client state)

## Decision 5: Branding placement

**Decision**: Add a small **brand header element** (logo + "ideaprinter" + "powered by rytix.tech") in the shared layout used by the primary screens.

**Rationale**:

- Consistent visibility across pages.
- Minimal layout risk and no new pages.

**Alternatives considered**:

- Adding branding only to the printer component (may be absent from other pages)
