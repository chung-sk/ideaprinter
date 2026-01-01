/**
 * Get the public site origin for generating shareable URLs.
 *
 * @returns The site origin (e.g., "https://ideaprinter.rytix.tech" or "http://localhost:3000")
 * @throws Error if origin cannot be determined (SSR without env var)
 */
export function getSiteOrigin(): string {
  // Priority 1: Use NEXT_PUBLIC_SITE_ORIGIN if set (production)
  const envOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN?.trim();
  if (envOrigin) {
    // Remove trailing slash if present
    return envOrigin.replace(/\/$/, '');
  }

  // Priority 2: Fall back to window.location.origin (local dev, client-side)
  if (typeof window !== 'undefined' && window.location) {
    return window.location.origin;
  }

  // No origin available (SSR without env var)
  throw new Error(
    'Cannot determine site origin: NEXT_PUBLIC_SITE_ORIGIN not set and window.location unavailable (SSR)'
  );
}
