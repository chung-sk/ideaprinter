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
