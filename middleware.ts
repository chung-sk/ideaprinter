import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from './lib/supabase/middleware';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60;

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIdentifier(request: NextRequest): string {
  // Use IP address for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
  return ip;
}

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired records
  if (record && now > record.resetTime) {
    rateLimitStore.delete(identifier);
  }

  const existingRecord = rateLimitStore.get(identifier);

  if (!existingRecord) {
    // First request in window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      allowed: true,
      remaining: MAX_REQUESTS_PER_WINDOW - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  // Check if limit exceeded
  if (existingRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: existingRecord.resetTime,
    };
  }

  // Increment count
  existingRecord.count += 1;
  rateLimitStore.set(identifier, existingRecord);

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_WINDOW - existingRecord.count,
    resetTime: existingRecord.resetTime,
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Update Supabase session for all requests
  let response = await updateSession(request);

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api/generate-idea')) {
    const identifier = getClientIdentifier(request);
    const { allowed, remaining, resetTime } = checkRateLimit(identifier);

    if (!allowed) {
      const resetIn = Math.ceil((resetTime - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Please try again in ${resetIn} seconds.`,
          retryAfter: resetIn,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(resetIn),
            'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(resetTime / 1000)),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS_PER_WINDOW));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.floor(resetTime / 1000)));
  }

  // Content Security Policy - Updated to include Supabase
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval/inline
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://*.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspHeader);

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
