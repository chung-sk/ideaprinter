/**
 * Template Trend Source
 *
 * Use this template as a starting point for adding new trend sources.
 * Follow the steps in specs/001-multi-source-trends/quickstart.md
 */

import type { TrendSourceProvider, RawTrendPost, FetchOptions } from './types';

/**
 * Template source provider
 *
 * TODO: Customize this implementation for your source
 */
export const TemplateSource: TrendSourceProvider = {
  // TODO: Change 'template' to your source identifier (lowercase, underscores)
  // @ts-expect-error - This is a template file, replace 'template' with actual source kind
  kind: 'template',

  // TODO: Change to a human-readable name for your source
  displayName: 'Template Source',

  // TODO: Set to true if authentication/credentials are required
  requiresCredential: false,

  /**
   * Fetch posts from the source
   *
   * @param options - Fetch options including limit and credentials
   * @returns Array of raw trend posts
   */
  async fetch(options: FetchOptions = {}): Promise<RawTrendPost[]> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { limit: _limit = 30 } = options;

    try {
      // TODO: Implement your fetching logic here
      // Example:
      // const response = await fetch('https://api.example.com/posts', {
      //   signal: AbortSignal.timeout(10000), // 10s timeout
      // })
      //
      // if (!response.ok) {
      //   throw new Error(`API error: ${response.status}`)
      // }
      //
      // const data = await response.json()
      //
      // Transform to RawTrendPost format:
      // const posts: RawTrendPost[] = data.items.map(item => ({
      //   externalId: item.id,
      //   author: item.author || 'Unknown',
      //   content: item.text || item.title,
      //   postedAt: item.createdAt || new Date().toISOString(),
      //   sourceUrl: item.url,
      // }))
      //
      // return posts.slice(0, _limit)

      throw new Error('Template source not implemented - see lib/trends/sources/_template.ts');
    } catch (error) {
      // Sanitize error messages (no credential leakage)
      if (error instanceof Error) {
        const sanitizedMessage = error.message.replace(
          /Bearer\s+\S+|token|key|password/gi,
          '[REDACTED]'
        );
        throw new Error(`Failed to fetch from template source: ${sanitizedMessage}`);
      }
      throw new Error('Failed to fetch from template source');
    }
  },
};

/**
 * Implementation Checklist:
 *
 * [ ] Update TrendSourceKind in lib/types/trends.ts
 * [ ] Implement fetch() method with proper error handling
 * [ ] Add timeout using AbortSignal.timeout(10000)
 * [ ] Transform API response to RawTrendPost[] format
 * [ ] Register source in lib/trends/sources/registry.ts
 * [ ] If credentials required:
 *     [ ] Add config types to lib/types/idea.ts
 *     [ ] Update CredentialsForm.tsx with UI inputs
 *     [ ] Add credential validation in app/api/trends/ingest/route.ts
 *     [ ] Pass credentials in components/printer/TrendInterface.tsx
 * [ ] Add unit tests (if custom logic exists)
 * [ ] Add integration tests in tests/integration/api/trends-ingest.test.ts
 * [ ] Add MSW handlers in tests/msw/handlers.ts
 * [ ] Run npm run lint && npm run type-check
 * [ ] Update quickstart.md if needed
 */
