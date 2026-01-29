/**
 * Trial Quota Management
 * 
 * Manages free trial quota for unauthenticated users.
 * Allows 3 free idea generations before requiring authentication.
 * 
 * Uses multi-layer persistence strategy:
 * 1. localStorage (primary)
 * 2. Cookie (90-day backup, survives browser settings)
 * 3. Merge on load (use most restrictive count)
 * 
 * Based on feature-gating and trial-optimization skill patterns.
 */

const TRIAL_QUOTA_KEY = 'ideaprinter_trial_quota';
const TRIAL_COOKIE_NAME = 'ideaprinter_trial';
const TRIAL_LIMIT = 3;
const TRIAL_COOKIE_DAYS = 90;

export interface TrialQuota {
  ideasGenerated: number;
  firstGeneratedAt: number;
  lastGeneratedAt: number;
  hasSeenUpgradePrompt: boolean;
}

/**
 * Get current trial status
 * Merges client-side (localStorage/cookie) with server-side (IP-based) data
 * Uses the most restrictive count for security
 */
export async function getTrialStatus(): Promise<{
  ideasGenerated: number;
  remainingIdeas: number;
  isTrialActive: boolean;
  hasExceededLimit: boolean;
}> {
  if (typeof window === 'undefined') {
    return {
      ideasGenerated: 0,
      remainingIdeas: TRIAL_LIMIT,
      isTrialActive: true,
      hasExceededLimit: false,
    };
  }

  // Get client-side quota
  const clientQuota = getTrialQuota();
  const clientIdeas = clientQuota.ideasGenerated;

  // Try to get server-side quota
  let serverIdeas = 0;
  try {
    const response = await fetch('/api/trial-status');
    if (response.ok) {
      const serverStatus = await response.json();
      serverIdeas = serverStatus.ideasGenerated || 0;
    }
  } catch (error) {
    console.warn('Failed to fetch server trial status:', error);
  }

  // Use the higher count (more restrictive)
  const ideasGenerated = Math.max(clientIdeas, serverIdeas);
  const remainingIdeas = Math.max(0, TRIAL_LIMIT - ideasGenerated);
  const hasExceededLimit = ideasGenerated >= TRIAL_LIMIT;

  // Sync client storage if server has higher count
  if (serverIdeas > clientIdeas) {
    const syncedQuota: TrialQuota = {
      ...clientQuota,
      ideasGenerated: serverIdeas,
    };
    saveTrialQuota(syncedQuota);
  }

  return {
    ideasGenerated,
    remainingIdeas,
    isTrialActive: !hasExceededLimit,
    hasExceededLimit,
  };
}

/**
 * Check if user can generate an idea
 */
export async function canGenerateIdea(): Promise<boolean> {
  const status = await getTrialStatus();
  return status.isTrialActive;
}

/**
 * Increment trial usage counter
 */
export function incrementTrialUsage(): TrialQuota {
  const quota = getTrialQuota();
  const now = Date.now();

  const updatedQuota: TrialQuota = {
    ...quota,
    ideasGenerated: quota.ideasGenerated + 1,
    firstGeneratedAt: quota.firstGeneratedAt || now,
    lastGeneratedAt: now,
  };

  saveTrialQuota(updatedQuota);
  return updatedQuota;
}

/**
 * Mark that user has seen the upgrade prompt
 */
export function markUpgradePromptSeen(): void {
  const quota = getTrialQuota();
  saveTrialQuota({
    ...quota,
    hasSeenUpgradePrompt: true,
  });
}

/**
 * Reset trial quota (for testing or after authentication)
 * Clears BOTH localStorage AND cookie
 */
export function resetTrialQuota(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TRIAL_QUOTA_KEY);
    // Delete cookie by setting expiration to past
    document.cookie = `${TRIAL_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict`;
  }
}

/**
 * Get trial quota from localStorage AND cookie (merge strategy)
 * Uses most restrictive count to prevent reset abuse
 */
function getTrialQuota(): TrialQuota {
  if (typeof window === 'undefined') {
    return createDefaultQuota();
  }

  let localStorageQuota: TrialQuota | null = null;
  let cookieQuota: TrialQuota | null = null;

  // Try localStorage first
  try {
    const stored = localStorage.getItem(TRIAL_QUOTA_KEY);
    if (stored) {
      localStorageQuota = JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse trial quota from localStorage:', error);
  }

  // Try cookie as backup
  try {
    const cookieValue = getCookie(TRIAL_COOKIE_NAME);
    if (cookieValue) {
      cookieQuota = JSON.parse(decodeURIComponent(cookieValue));
    }
  } catch (error) {
    console.error('Failed to parse trial quota from cookie:', error);
  }

  // Merge strategy: use the one with MORE usage (more restrictive)
  if (localStorageQuota && cookieQuota) {
    const merged: TrialQuota = {
      ideasGenerated: Math.max(localStorageQuota.ideasGenerated, cookieQuota.ideasGenerated),
      firstGeneratedAt: Math.min(localStorageQuota.firstGeneratedAt || Infinity, cookieQuota.firstGeneratedAt || Infinity),
      lastGeneratedAt: Math.max(localStorageQuota.lastGeneratedAt, cookieQuota.lastGeneratedAt),
      hasSeenUpgradePrompt: localStorageQuota.hasSeenUpgradePrompt || cookieQuota.hasSeenUpgradePrompt,
    };
    // Save merged version to both
    saveTrialQuota(merged);
    return merged;
  }

  // Return whichever exists
  if (localStorageQuota) return localStorageQuota;
  if (cookieQuota) return cookieQuota;

  return createDefaultQuota();
}

/**
 * Save trial quota to BOTH localStorage AND cookie
 * Cookie survives browser settings that clear localStorage on exit
 */
function saveTrialQuota(quota: TrialQuota): void {
  if (typeof window !== 'undefined') {
    try {
      const quotaStr = JSON.stringify(quota);
      
      // Save to localStorage
      localStorage.setItem(TRIAL_QUOTA_KEY, quotaStr);
      
      // Save to cookie (90 days)
      setCookie(TRIAL_COOKIE_NAME, encodeURIComponent(quotaStr), TRIAL_COOKIE_DAYS);
    } catch (error) {
      console.error('Failed to save trial quota:', error);
    }
  }
}

/**
 * Set a cookie with expiration
 */
function setCookie(name: string, value: string, days: number): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return null;
}

/**
 * Create default quota object
 */
function createDefaultQuota(): TrialQuota {
  return {
    ideasGenerated: 0,
    firstGeneratedAt: 0,
    lastGeneratedAt: 0,
    hasSeenUpgradePrompt: false,
  };
}

/**
 * Get trial progress message for UI
 */
export async function getTrialProgressMessage(): Promise<string> {
  const status = await getTrialStatus();
  
  if (status.hasExceededLimit) {
    return 'Trial limit reached';
  }
  
  if (status.remainingIdeas === 3) {
    return '3 free ideas remaining';
  }
  
  if (status.remainingIdeas === 1) {
    return '1 free idea remaining';
  }
  
  return `${status.remainingIdeas} free ideas remaining`;
}
