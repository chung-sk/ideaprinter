/**
 * Server-Side Trial Quota Management
 * 
 * Tracks trial usage by IP address to prevent resets across:
 * - Different browsers (Chrome, Firefox, Safari, Edge)
 * - Incognito/private mode
 * - Clearing browser data
 * 
 * Uses in-memory storage (resets on server restart, which is acceptable for trials)
 * For production, consider Redis or database storage.
 */

const TRIAL_LIMIT = 3;
const TRIAL_EXPIRY_HOURS = 24 * 90; // 90 days

interface ServerTrialQuota {
  ip: string;
  ideasGenerated: number;
  firstGeneratedAt: number;
  lastGeneratedAt: number;
  expiresAt: number;
}

// In-memory storage (for development)
// In production, use Redis or database
const trialStore = new Map<string, ServerTrialQuota>();

/**
 * Clean up expired trials periodically
 */
function cleanupExpiredTrials() {
  const now = Date.now();
  for (const [ip, quota] of trialStore.entries()) {
    if (now > quota.expiresAt) {
      trialStore.delete(ip);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredTrials, 60 * 60 * 1000);

/**
 * Get trial quota for an IP address
 */
export function getServerTrialQuota(ip: string): ServerTrialQuota | null {
  const quota = trialStore.get(ip);
  
  if (!quota) {
    return null;
  }
  
  // Check if expired
  if (Date.now() > quota.expiresAt) {
    trialStore.delete(ip);
    return null;
  }
  
  return quota;
}

/**
 * Check if IP can generate an idea
 */
export function canIpGenerateIdea(ip: string): boolean {
  const quota = getServerTrialQuota(ip);
  
  if (!quota) {
    return true; // First time, allow
  }
  
  return quota.ideasGenerated < TRIAL_LIMIT;
}

/**
 * Increment trial usage for an IP
 */
export function incrementIpTrialUsage(ip: string): ServerTrialQuota {
  const now = Date.now();
  const existingQuota = getServerTrialQuota(ip);
  
  if (existingQuota) {
    existingQuota.ideasGenerated += 1;
    existingQuota.lastGeneratedAt = now;
    trialStore.set(ip, existingQuota);
    return existingQuota;
  }
  
  // Create new quota
  const newQuota: ServerTrialQuota = {
    ip,
    ideasGenerated: 1,
    firstGeneratedAt: now,
    lastGeneratedAt: now,
    expiresAt: now + (TRIAL_EXPIRY_HOURS * 60 * 60 * 1000),
  };
  
  trialStore.set(ip, newQuota);
  return newQuota;
}

/**
 * Get trial status for an IP (for API response)
 */
export function getIpTrialStatus(ip: string): {
  ideasGenerated: number;
  remainingIdeas: number;
  isTrialActive: boolean;
  hasExceededLimit: boolean;
} {
  const quota = getServerTrialQuota(ip);
  
  if (!quota) {
    return {
      ideasGenerated: 0,
      remainingIdeas: TRIAL_LIMIT,
      isTrialActive: true,
      hasExceededLimit: false,
    };
  }
  
  const ideasGenerated = quota.ideasGenerated;
  const remainingIdeas = Math.max(0, TRIAL_LIMIT - ideasGenerated);
  const hasExceededLimit = ideasGenerated >= TRIAL_LIMIT;
  
  return {
    ideasGenerated,
    remainingIdeas,
    isTrialActive: !hasExceededLimit,
    hasExceededLimit,
  };
}

/**
 * Reset trial for an IP (admin/testing only)
 */
export function resetIpTrialQuota(ip: string): void {
  trialStore.delete(ip);
}

/**
 * Get all active trials (admin/debugging)
 */
export function getAllActiveTrials(): ServerTrialQuota[] {
  return Array.from(trialStore.values());
}
