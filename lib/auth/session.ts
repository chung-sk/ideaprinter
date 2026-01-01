/**
 * Session Management for User Tracking
 *
 * Tracks user sessions for analytics and history management.
 * Uses localStorage for persistent session IDs.
 */

const SESSION_ID_KEY = 'ideaprinter_session_id';
const SESSION_START_KEY = 'ideaprinter_session_start';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

export interface SessionData {
  sessionId: string;
  startTime: number;
  isExpired: boolean;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get or create a session ID
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const existingSessionId = localStorage.getItem(SESSION_ID_KEY);
    const sessionStart = localStorage.getItem(SESSION_START_KEY);

    // Check if session is still valid
    if (existingSessionId && sessionStart) {
      const startTime = parseInt(sessionStart, 10);
      const elapsed = Date.now() - startTime;

      if (elapsed < SESSION_DURATION) {
        return existingSessionId;
      }
    }

    // Create new session
    const newSessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, newSessionId);
    localStorage.setItem(SESSION_START_KEY, Date.now().toString());

    return newSessionId;
  } catch (error) {
    console.error('Failed to get/create session ID:', error);
    return generateSessionId(); // Fallback to in-memory session
  }
}

/**
 * Get current session data
 */
export function getSessionData(): SessionData {
  if (typeof window === 'undefined') {
    return {
      sessionId: '',
      startTime: 0,
      isExpired: true,
    };
  }

  try {
    const sessionId = localStorage.getItem(SESSION_ID_KEY) || '';
    const sessionStart = localStorage.getItem(SESSION_START_KEY);
    const startTime = sessionStart ? parseInt(sessionStart, 10) : 0;
    const elapsed = Date.now() - startTime;
    const isExpired = elapsed >= SESSION_DURATION;

    return {
      sessionId,
      startTime,
      isExpired,
    };
  } catch (error) {
    console.error('Failed to get session data:', error);
    return {
      sessionId: '',
      startTime: 0,
      isExpired: true,
    };
  }
}

/**
 * Refresh session timestamp
 */
export function refreshSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const sessionId = getSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
    localStorage.setItem(SESSION_START_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to refresh session:', error);
  }
}

/**
 * Clear session data
 */
export function clearSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(SESSION_ID_KEY);
    localStorage.removeItem(SESSION_START_KEY);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

/**
 * Track session event (for analytics)
 */
export function trackSessionEvent(eventName: string, data?: Record<string, unknown>): void {
  const session = getSessionData();

  console.log('[Session Event]', {
    event: eventName,
    sessionId: session.sessionId,
    timestamp: new Date().toISOString(),
    ...data,
  });

  // In production, this would send to analytics service
}
