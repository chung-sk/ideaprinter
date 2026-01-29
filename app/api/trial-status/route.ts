import { NextRequest, NextResponse } from 'next/server';
import { getIpTrialStatus } from '@/lib/auth/serverTrialQuota';
import { getClientIp } from '@/lib/utils/ipAddress';

export async function GET(request: NextRequest) {
  try {
    const clientIp = getClientIp(request);
    const trialStatus = getIpTrialStatus(clientIp);
    
    return NextResponse.json(trialStatus);
  } catch (error) {
    console.error('Failed to get trial status:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve trial status' },
      { status: 500 }
    );
  }
}
