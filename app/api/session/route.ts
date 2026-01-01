import { NextRequest, NextResponse } from 'next/server';
import { getGlobalQuotaStatus, isUsingSharedKey } from '@/lib/auth/globalQuota';

export async function GET(request: NextRequest) {
  // Get user's API key from headers if provided
  const userApiKey = request.headers.get('x-api-key') || undefined;

  // Determine API key mode
  const usingSharedKey = isUsingSharedKey(userApiKey);

  if (usingSharedKey) {
    // Using shared key: return quota status
    const quotaStatus = getGlobalQuotaStatus();

    return NextResponse.json({
      keyMode: 'shared',
      remainingDaily: quotaStatus.remainingDaily,
      dailyResetAt: quotaStatus.dailyResetAt,
    });
  } else {
    // Using user's own key: no quota restrictions
    return NextResponse.json({
      keyMode: 'user_provided',
      message: 'Using your own API key - no quota restrictions',
    });
  }
}
