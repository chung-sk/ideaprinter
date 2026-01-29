/**
 * IP Address Utilities
 * 
 * Safely extract client IP address from Next.js request headers
 */

import { NextRequest } from 'next/server';

/**
 * Get client IP address from request
 * Handles proxies, load balancers, and local development
 */
export function getClientIp(request: NextRequest | Request): string {
  const headers = request.headers;
  
  // Try various headers in order of preference
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    if (ips[0]) {
      return ips[0];
    }
  }
  
  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = headers.get('cf-connecting-ip'); // Cloudflare
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  // Fallback for local development
  return '127.0.0.1';
}

/**
 * Hash IP address for privacy (optional)
 * Use this if you want to avoid storing raw IP addresses
 */
export async function hashIp(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + process.env.IP_HASH_SALT || 'default-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
