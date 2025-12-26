export interface QuotaInfo {
  keyMode: 'shared' | 'user_provided';
  remainingDaily?: number;
  dailyResetAt?: string;
  message?: string;
}

export async function fetchQuotaInfo(userApiKey?: string): Promise<QuotaInfo | null> {
  try {
    const headers: HeadersInit = {};
    if (userApiKey) {
      headers['x-api-key'] = userApiKey;
    }
    
    const res = await fetch('/api/session', { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch quota info:', error);
    return null;
  }
}

