import type { Idea } from '@/lib/types/idea';

const PAYLOAD_VERSION = 'v1';

/**
 * Encode an Idea as a URL-safe share payload.
 * Uses base64url encoding (no compression to keep bundle small).
 *
 * @param idea The idea to encode
 * @returns URL-safe base64-encoded payload with version prefix
 */
export function encodeSharePayload(idea: Idea): string {
  try {
    // Use shortened field names to reduce payload size
    const compact = {
      v: PAYLOAD_VERSION,
      i: idea.id,
      n: idea.name,
      c: idea.category,
      t: idea.generatedAt,
      co: idea.concept,
      g: idea.gap,
      f: idea.fix,
      ...(idea.provenance && {
        p: {
          k: idea.provenance.sourceKind,
          pl: idea.provenance.platform,
          ...(idea.provenance.sourceUrl && { u: idea.provenance.sourceUrl }),
          ...(idea.provenance.author && { a: idea.provenance.author }),
          ...(idea.provenance.postedAt && { d: idea.provenance.postedAt }),
          ...(idea.provenance.excerpt && { e: idea.provenance.excerpt }),
        },
      }),
    };

    const json = JSON.stringify(compact);

    // Convert to base64url (URL-safe variant)
    // Use unescape/encodeURIComponent to properly handle UTF-8 before base64 encoding
    const base64 = btoa(unescape(encodeURIComponent(json)));
    const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return base64url;
  } catch (error) {
    throw new Error(
      `Failed to encode share payload: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Decode a share payload back into an Idea.
 * Supports both versioned (v1) and legacy (raw JSON) payloads.
 *
 * @param encoded The encoded payload string
 * @returns The decoded Idea
 * @throws Error if payload is invalid or malformed
 */
export function decodeSharePayload(encoded: string): Idea {
  if (!encoded || typeof encoded !== 'string') {
    throw new Error('Invalid share payload: empty or non-string value');
  }

  try {
    // Convert base64url back to base64
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }

    // Decode from base64
    const json = decodeURIComponent(escape(atob(base64)));
    const parsed = JSON.parse(json);

    // Check if v1 compact format
    if (parsed.v === PAYLOAD_VERSION && parsed.i) {
      return {
        id: parsed.i,
        name: parsed.n,
        category: parsed.c,
        generatedAt: parsed.t,
        concept: parsed.co,
        gap: parsed.g,
        fix: parsed.f,
        ...(parsed.p && {
          provenance: {
            sourceKind: parsed.p.k,
            platform: parsed.p.pl,
            ...(parsed.p.u && { sourceUrl: parsed.p.u }),
            ...(parsed.p.a && { author: parsed.p.a }),
            ...(parsed.p.d && { postedAt: parsed.p.d }),
            ...(parsed.p.e && { excerpt: parsed.p.e }),
          },
        }),
      };
    }

    // Legacy v1 format with full field names
    if (parsed.v === PAYLOAD_VERSION && parsed.data) {
      return parsed.data as Idea;
    }

    // Legacy format: assume raw Idea JSON
    // (old share links may have been raw base64url(Idea))
    if (parsed.id && parsed.name) {
      return parsed as Idea;
    }

    throw new Error('Unrecognized payload structure');
  } catch (error) {
    // Log internal error for debugging, but throw friendly message
    console.error('Share payload decode error:', error);
    throw new Error('The share link is invalid or corrupted. Please check the URL.');
  }
}
