/**
 * Global quota tracking for shared/default API key.
 * 
 * This module tracks a single global counter for all users who are using
 * the app's default Gemini API key. Users who provide their own API key
 * bypass quota checks entirely.
 * 
 * Uses globalThis to persist state across HMR (Hot Module Replacement) in development.
 */

export const DAILY_LIMIT = 30;

// Type for global state
interface GlobalQuotaState {
  dailyCount: number;
  dailyResetAt: string;
}

// Use globalThis to survive HMR in development
declare global {
  var __quotaState: GlobalQuotaState | undefined;
}

// Initialize state only if not already present
if (!globalThis.__quotaState) {
  globalThis.__quotaState = {
    dailyCount: 0,
    dailyResetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

// Reference to the global state
const globalState = globalThis.__quotaState;

export interface QuotaStatus {
  isAllowed: boolean;
  remainingDaily: number;
  dailyResetAt: string;
  retryAfter?: number; // seconds until reset
}

/**
 * Checks if the shared API key has quota remaining.
 * Returns quota status including whether the request is allowed.
 */
export function checkGlobalQuota(): QuotaStatus {
  const now = Date.now();
  const resetTime = new Date(globalState.dailyResetAt).getTime();

  // Reset if window has passed
  if (now >= resetTime) {
    globalState.dailyCount = 0;
    globalState.dailyResetAt = new Date(now + 24 * 60 * 60 * 1000).toISOString();
  }

  const remainingDaily = Math.max(0, DAILY_LIMIT - globalState.dailyCount);
  const isAllowed = remainingDaily > 0;

  const status: QuotaStatus = {
    isAllowed,
    remainingDaily,
    dailyResetAt: globalState.dailyResetAt,
  };

  if (!isAllowed) {
    const retryAfter = Math.ceil((new Date(globalState.dailyResetAt).getTime() - now) / 1000);
    status.retryAfter = Math.max(1, retryAfter);
  }

  return status;
}

/**
 * Increments the global counter after a successful generation.
 * Should only be called if using the shared/default API key.
 */
export function incrementGlobalQuota(): void {
  globalState.dailyCount += 1;
}

/**
 * Gets the current quota status without checking or modifying it.
 * Useful for displaying remaining quota in the UI.
 */
export function getGlobalQuotaStatus(): QuotaStatus {
  return checkGlobalQuota();
}

/**
 * Determines if a request is using the shared/default API key.
 * Returns true if using shared key, false if user provided their own key.
 */
export function isUsingSharedKey(userProvidedKey: string | null | undefined): boolean {
  return !userProvidedKey || userProvidedKey.trim() === '';
}
