# Signed-Cookie Trial Enforcement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the broken in-memory IP-based trial store with an HttpOnly signed cookie so the 3-idea trial survives Vercel cold starts and cannot be bypassed by clearing client storage.

**Architecture:** The server reads and writes a single HttpOnly cookie (`__ideaprinter_trial`) on every generate-idea request. The cookie payload (`{ trialCount, trialStartedAt }`) is HMAC-SHA256 signed using the existing `SESSION_SECRET`. The client never sees or touches it. `/api/trial-status` reads the same cookie and returns the count to the UI. The existing client-side `trialQuota.ts` and server-side `serverTrialQuota.ts` are removed.

**Tech Stack:** Node.js `crypto` (already used in `sessionToken.ts`), Next.js API routes (`NextRequest`/`NextResponse` cookie helpers), existing `SESSION_SECRET` env var.

---

### What already exists (do NOT rewrite these)

| File | What it gives us |
|------|-----------------|
| `lib/auth/sessionToken.ts` | `signSessionToken` / `verifySessionToken` pattern — HMAC-SHA256 + base64url + `timingSafeEqual`. We copy the same pattern, not reuse the function (payload type is different). |
| `.env.example` | `SESSION_SECRET` already declared. We reuse it — no new env var needed. |
| `app/api/generate-idea/route.ts` | Already imports `canIpGenerateIdea` / `incrementIpTrialUsage` from `serverTrialQuota`. We swap those calls. |
| `app/api/trial-status/route.ts` | Already imports `getIpTrialStatus`. We swap. |
| `components/printer/PrinterInterface.tsx` | Already calls `getTrialStatus()` on mount and `incrementTrialUsage()` after success. We simplify both. |

### What gets deleted

| File | Why |
|------|-----|
| `lib/auth/serverTrialQuota.ts` | In-memory Map — useless on Vercel serverless. |
| `lib/auth/trialQuota.ts` | Client-side localStorage + cookie merge logic — no longer needed. |

---

## Task 1: Create `lib/auth/trialCookie.ts`

**Files:**
- Create: `lib/auth/trialCookie.ts`

This is the only new file. Everything else is edits.

**Step 1: Write the file**

```typescript
/**
 * Trial Cookie — HttpOnly signed cookie for stateless trial enforcement.
 *
 * Cookie name : __ideaprinter_trial
 * Payload     : { trialCount: number, trialStartedAt: number }
 * Signature   : HMAC-SHA256(base64url(payload), SESSION_SECRET)
 * Cookie value: <base64url-payload>.<base64url-signature>
 *
 * The cookie is HttpOnly + Secure + SameSite=Strict, so client JS
 * can never read or tamper with it.  Every serverless instance reads
 * the same value from the incoming Cookie header — no shared memory needed.
 */

import { createHmac, timingSafeEqual } from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

// ─── constants ───────────────────────────────────────────────────────────────
const SECRET = process.env.SESSION_SECRET || 'default-secret-do-not-use-in-prod';
const COOKIE_NAME = '__ideaprinter_trial';
const TRIAL_LIMIT = 3;
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

// ─── types ───────────────────────────────────────────────────────────────────
export interface TrialCookiePayload {
  trialCount: number;      // how many ideas generated so far (0–3)
  trialStartedAt: number;  // epoch ms of first generation (0 = not started)
}

// ─── sign / verify ───────────────────────────────────────────────────────────
const b64Encode = (s: string) => Buffer.from(s).toString('base64url');
const b64Decode = (s: string) => Buffer.from(s, 'base64url').toString('utf-8');

function sign(payload: TrialCookiePayload): string {
  const data = b64Encode(JSON.stringify(payload));
  const sig  = createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verify(token: string): TrialCookiePayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;

  const expected = createHmac('sha256', SECRET).update(data).digest('base64url');

  // constant-time compare
  const sigBuf  = Buffer.from(sig,      'base64url');
  const expBuf  = Buffer.from(expected, 'base64url');
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    return JSON.parse(b64Decode(data)) as TrialCookiePayload;
  } catch {
    return null;
  }
}

// ─── public helpers used by API routes ───────────────────────────────────────

/**
 * Read + verify the trial cookie from an incoming request.
 * Returns the default (empty) payload when the cookie is missing or invalid.
 */
export function readTrialCookie(request: NextRequest): TrialCookiePayload {
  const raw = request.cookies.get(COOKIE_NAME)?.value;
  if (!raw) return { trialCount: 0, trialStartedAt: 0 };

  return verify(raw) ?? { trialCount: 0, trialStartedAt: 0 };
}

/**
 * Attach an updated trial cookie to an outgoing response.
 * Call this AFTER you have the final payload you want to persist.
 */
export function setTrialCookie(response: NextResponse, payload: TrialCookiePayload): void {
  response.cookies.set(COOKIE_NAME, sign(payload), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
    maxAge:   COOKIE_MAX_AGE,
  });
}

/**
 * Pure check — does this payload still have quota left?
 */
export function isTrialExhausted(payload: TrialCookiePayload): boolean {
  return payload.trialCount >= TRIAL_LIMIT;
}

/** Re-export so routes don't need to know the magic number. */
export { TRIAL_LIMIT };
```

**Step 2: Verify it compiles**

```bash
cd /Users/chungseongkah/Documents/ideaprinter
npx tsc --noEmit lib/auth/trialCookie.ts 2>&1 | head -20
```
Expected: no errors (or only "cannot find module" for next/server, which is fine at file level — full check is in Task 6).

---

## Task 2: Rewrite `app/api/trial-status/route.ts`

**Files:**
- Modify: `app/api/trial-status/route.ts` (full rewrite — it's 18 lines)

**Step 1: Replace the file contents**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { readTrialCookie, isTrialExhausted, TRIAL_LIMIT } from '@/lib/auth/trialCookie';

export async function GET(request: NextRequest) {
  const payload = readTrialCookie(request);

  return NextResponse.json({
    ideasGenerated:  payload.trialCount,
    remainingIdeas:  Math.max(0, TRIAL_LIMIT - payload.trialCount),
    isTrialActive:   !isTrialExhausted(payload),
    hasExceededLimit: isTrialExhausted(payload),
  });
}
```

Note: no `Set-Cookie` here — this is a read-only status endpoint. The cookie is only written by `generate-idea`.

---

## Task 3: Edit `app/api/generate-idea/route.ts`

**Files:**
- Modify: `app/api/generate-idea/route.ts`

Three surgical edits. Do NOT touch the Gemini generation logic, logging, or response construction.

**Step 1: Swap the import**

Remove:
```typescript
import { canIpGenerateIdea, incrementIpTrialUsage, getIpTrialStatus } from '@/lib/auth/serverTrialQuota';
import { getClientIp } from '@/lib/utils/ipAddress';
```

Add:
```typescript
import { readTrialCookie, setTrialCookie, isTrialExhausted } from '@/lib/auth/trialCookie';
```

**Step 2: Replace the server-side trial check block (lines 36-49)**

Remove the entire block:
```typescript
    // Server-Side Trial Check (only for users without API key)
    if (usingSharedKey) {
      const clientIp = getClientIp(request);

      if (!canIpGenerateIdea(clientIp)) {
        const trialStatus = getIpTrialStatus(clientIp);
        return NextResponse.json(
          {
            error: 'Trial limit reached. Please add your own API key to continue.',
            code: 'TRIAL_LIMIT_EXCEEDED',
            trialStatus,
          },
          { status: 403 }
        );
      }
    }
```

Replace with:
```typescript
    // Server-Side Trial Check — read HttpOnly signed cookie
    const trialPayload = readTrialCookie(request);
    if (usingSharedKey && isTrialExhausted(trialPayload)) {
      return NextResponse.json(
        {
          error: 'Trial limit reached. Please add your own API key to continue.',
          code: 'TRIAL_LIMIT_EXCEEDED',
          trialStatus: { ideasGenerated: trialPayload.trialCount, remainingIdeas: 0 },
        },
        { status: 403 }
      );
    }
```

**Step 3: Replace the increment block (lines 167-173) and the final return**

Remove:
```typescript
    // Increment counters (only for shared key)
    if (usingSharedKey) {
      incrementGlobalQuota();

      // Increment server-side trial usage
      const clientIp = getClientIp(request);
      incrementIpTrialUsage(clientIp);
    }
```

Replace with:
```typescript
    // Increment counters (only for shared key)
    if (usingSharedKey) {
      incrementGlobalQuota();
    }
```

Then find the final success return (currently):
```typescript
    return NextResponse.json(response, { status: 200 });
```

Replace with:
```typescript
    const successResponse = NextResponse.json(response, { status: 200 });

    // Write updated trial cookie (only for shared-key users)
    if (usingSharedKey) {
      setTrialCookie(successResponse, {
        trialCount:     trialPayload.trialCount + 1,
        trialStartedAt: trialPayload.trialStartedAt || Date.now(),
      });
    }

    return successResponse;
```

---

## Task 4: Simplify `components/printer/PrinterInterface.tsx`

**Files:**
- Modify: `components/printer/PrinterInterface.tsx`

The component already fetches `/api/trial-status` indirectly via `getTrialStatus()`. We cut out the client-side middleware and call the endpoint directly.

**Step 1: Remove the old imports**

Remove:
```typescript
import { getTrialStatus, incrementTrialUsage } from '@/lib/auth/trialQuota';
```

**Step 2: Add a simple fetch helper at the top of the file (after all imports, before `CATEGORIES`)**

```typescript
async function fetchTrialStatus(): Promise<{ ideasGenerated: number; remainingIdeas: number; hasExceededLimit: boolean; isTrialActive: boolean }> {
  try {
    const res = await fetch('/api/trial-status');
    if (res.ok) return await res.json();
  } catch { /* ignore */ }
  return { ideasGenerated: 0, remainingIdeas: 3, hasExceededLimit: false, isTrialActive: true };
}
```

**Step 3: Replace the mount-time trial load (lines 90-95)**

Remove:
```typescript
    // Load trial status (async)
    getTrialStatus().then(currentTrialStatus => {
      setTrialStatus({
        ideasGenerated: currentTrialStatus.ideasGenerated,
        remainingIdeas: currentTrialStatus.remainingIdeas,
      });
    });
```

Replace with:
```typescript
    // Load trial status from server
    fetchTrialStatus().then(s => {
      setTrialStatus({ ideasGenerated: s.ideasGenerated, remainingIdeas: s.remainingIdeas });
    });
```

**Step 4: Replace the pre-generate trial check (lines 164-165)**

Remove:
```typescript
    // Check trial quota before generating (async)
    const currentTrialStatus = await getTrialStatus();
```

Replace with:
```typescript
    // Check trial quota from server before generating
    const currentTrialStatus = await fetchTrialStatus();
```

**Step 5: Remove the client-side increment block (lines 323-338)**

Remove the entire block:
```typescript
      // Increment trial usage if using shared key (no user API key)
      if (!currentApiKey) {
        incrementTrialUsage();
        // Update trial status for UI (async)
        getTrialStatus().then(updatedTrialStatus => {
          setTrialStatus({
            ideasGenerated: updatedTrialStatus.ideasGenerated,
            remainingIdeas: updatedTrialStatus.remainingIdeas,
          });

          // Show upgrade prompt if just hit the limit
          if (updatedTrialStatus.hasExceededLimit) {
            setTimeout(() => setShowUpgradePrompt(true), 2000); // Show after 2 seconds
          }
        });
      }
```

Replace with:
```typescript
      // Refresh trial status from server (cookie was updated by the API)
      if (!currentApiKey) {
        fetchTrialStatus().then(updatedTrialStatus => {
          setTrialStatus({
            ideasGenerated: updatedTrialStatus.ideasGenerated,
            remainingIdeas: updatedTrialStatus.remainingIdeas,
          });
          if (updatedTrialStatus.hasExceededLimit) {
            setTimeout(() => setShowUpgradePrompt(true), 2000);
          }
        });
      }
```

**Step 6: Remove the now-unused `trialQuotaUsed` and `hasTrialStarted` fields from the request body (lines 234-235)**

Remove these two lines from the `requestBody` object:
```typescript
        trialQuotaUsed: currentTrialStatus.ideasGenerated,
        hasTrialStarted: currentTrialStatus.isTrialActive || currentTrialStatus.hasExceededLimit,
```

And remove them from the `RequestBody` interface (lines 226-227):
```typescript
        trialQuotaUsed?: number;
        hasTrialStarted?: boolean;
```

---

## Task 5: Delete dead files

**Files:**
- Delete: `lib/auth/serverTrialQuota.ts`
- Delete: `lib/auth/trialQuota.ts`

```bash
rm /Users/chungseongkah/Documents/ideaprinter/lib/auth/serverTrialQuota.ts
rm /Users/chungseongkah/Documents/ideaprinter/lib/auth/trialQuota.ts
```

Before deleting, confirm nothing else imports them:

```bash
grep -r "serverTrialQuota" /Users/chungseongkah/Documents/ideaprinter/app /Users/chungseongkah/Documents/ideaprinter/lib /Users/chungseongkah/Documents/ideaprinter/components --include="*.ts" --include="*.tsx"
grep -r "trialQuota" /Users/chungseongkah/Documents/ideaprinter/app /Users/chungseongkah/Documents/ideaprinter/lib /Users/chungseongkah/Documents/ideaprinter/components --include="*.ts" --include="*.tsx"
```

Expected after Task 3 + Task 4 edits: zero hits. If hits remain, fix those imports first.

---

## Task 6: Build check

```bash
cd /Users/chungseongkah/Documents/ideaprinter
npm run build 2>&1 | tail -30
```

Expected: zero TypeScript errors, successful compilation. Fix any import errors that surface.

---

## Task 7: Validate in browser (same method used to find the bug)

1. Start dev server: `npm run dev`
2. Open `http://localhost:3000/printer` (or whichever port)
3. Run in console — snapshot all three layers:

```javascript
(async function() {
  // HttpOnly cookie is invisible to JS — expected: undefined
  const visible = document.cookie.split(';').find(c => c.trim().startsWith('__ideaprinter_trial='));

  // Server-reported count (reads the HttpOnly cookie server-side)
  const server = await (await fetch('/api/trial-status')).json();

  return JSON.stringify({ visibleCookie: visible || null, server }, null, 2);
})()
```

Expected: `visibleCookie: null` (HttpOnly is invisible), `server: { ideasGenerated: 0, remainingIdeas: 3 }`

4. Click "PRINT IDEA" three times. After each, re-run the snippet. Expected: server count increments 1 → 2 → 3.
5. Click "PRINT IDEA" a 4th time. Expected: 403 `TRIAL_LIMIT_EXCEEDED`.
6. **The key test:** Run this to nuke all client state, then try again:

```javascript
localStorage.clear();
document.cookie.split(';').forEach(c => {
  document.cookie = c.split('=')[0].trim() + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
});
'cleared'
```

Reload. Click "PRINT IDEA". Expected: **still blocked** — the HttpOnly cookie survives `localStorage.clear()` and `document.cookie` manipulation because JS cannot touch HttpOnly cookies.

---

## Commit sequence

```bash
# After Task 1
git add lib/auth/trialCookie.ts
git commit -m "feat: add HttpOnly signed trial cookie helper"

# After Tasks 2 + 3
git add app/api/trial-status/route.ts app/api/generate-idea/route.ts
git commit -m "feat: enforce trial via signed cookie in API routes"

# After Tasks 4 + 5
git add components/printer/PrinterInterface.tsx
git rm lib/auth/serverTrialQuota.ts lib/auth/trialQuota.ts
git commit -m "chore: remove client-side trial logic, fetch status from server"
```
