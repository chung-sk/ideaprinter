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
