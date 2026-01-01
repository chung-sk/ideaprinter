import { createHmac, timingSafeEqual } from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'default-secret-do-not-use-in-prod';

export interface SessionPayload {
  sessionId: string;
  dailyCount: number;
  dailyResetAt: number; // timestamp in ms
  minuteCount: number;
  minuteResetAt: number; // timestamp in ms
}

export const QUOTA_LIMITS = {
  dailyLimit: 30,
  minuteLimit: 5,
};

// Helper to encode/decode base64url
const base64UrlEncode = (str: string) => Buffer.from(str).toString('base64url');
const base64UrlDecode = (str: string) => Buffer.from(str, 'base64url').toString('utf-8');

export function signSessionToken(payload: SessionPayload): string {
  const data = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  const [data, signature] = token.split('.');
  if (!data || !signature) return null;

  const expectedSignature = createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');

  // Constant time comparison
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(data));
  } catch {
    return null;
  }
}

export function checkQuota(payload: SessionPayload, now = Date.now()) {
  let { dailyCount, dailyResetAt, minuteCount, minuteResetAt } = payload;

  // Reset windows if expired
  if (now >= dailyResetAt) {
    dailyCount = 0;
    dailyResetAt = now + 24 * 60 * 60 * 1000;
  }

  if (now >= minuteResetAt) {
    minuteCount = 0;
    minuteResetAt = now + 60 * 1000;
  }

  const isBlocked =
    dailyCount >= QUOTA_LIMITS.dailyLimit || minuteCount >= QUOTA_LIMITS.minuteLimit;

  return {
    updatedPayload: {
      ...payload,
      dailyCount,
      dailyResetAt,
      minuteCount,
      minuteResetAt,
    },
    isBlocked,
    remainingDaily: Math.max(0, QUOTA_LIMITS.dailyLimit - dailyCount),
    remainingMinute: Math.max(0, QUOTA_LIMITS.minuteLimit - minuteCount),
  };
}
