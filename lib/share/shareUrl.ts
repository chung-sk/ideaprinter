import { getSiteOrigin } from './siteOrigin';
import { encodeSharePayload } from './sharePayload';
import type { Idea } from '@/lib/types/idea';

// QR codes can handle up to 2953 chars at level L, but we use level M (error correction)
// which supports ~2331 chars. We set a conservative limit of 2000 chars to ensure
// reliable scanning across all devices while allowing reasonable idea lengths.
const MAX_SHARE_URL_LENGTH = 2000;

/**
 * Build a shareable URL for an idea.
 * Uses the configured public site origin and encodes the idea as a payload parameter.
 *
 * @param idea The idea to share
 * @returns Complete share URL (e.g., "https://ideaprinter.rytix.tech/share?data=...")
 * @throws Error if the generated URL exceeds MAX_SHARE_URL_LENGTH (2000 chars)
 */
export function buildShareUrl(idea: Idea): string {
  const origin = getSiteOrigin();
  const payload = encodeSharePayload(idea);

  const url = `${origin}/share?data=${payload}`;

  // Enforce max Share URL length per FR-011/SC-006
  if (url.length > MAX_SHARE_URL_LENGTH) {
    throw new Error(
      `Share URL too long (${url.length} characters). The idea content is too large to share via QR code. ` +
        `Maximum allowed: ${MAX_SHARE_URL_LENGTH} characters.`
    );
  }

  return url;
}
