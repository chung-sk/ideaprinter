# Quickstart: Multi-Source Trend Sourcing

## Prereqs

- Node.js `>=18.17`
- npm `>=9`

## Install & Run

- `npm install`
- `npm run dev`
- Open `http://localhost:3000/`

## Configure

Open `http://localhost:3000/config`.

### Free sources (P1)

- Select a free trend source (Hacker News / Tech News).
- Save configuration.

No API key is required for the free sources.

### X/Twitter (P2)

- Provide an official X/Twitter credential (bearer token) and a query to ingest recent posts.
- Save configuration.

## Use

1. Go to `http://localhost:3000/`
2. Start trend ingestion
3. Wait until ingestion completes
4. Select one trend post
5. Generate idea from selected post
6. Verify provenance appears in the printout and history

## Validation Commands

- `npm run lint`
- `npm run type-check`
- `npm test -- --run`
- `npm run test:e2e`

## Troubleshooting

- If ingestion fails immediately, verify config requirements for the selected source.
- If polling never stops, verify the status endpoint returns a terminal job status and the client stops polling on terminal states.
- If posts look empty/too long, verify excerpt capping and HTML stripping rules.

---

## Adding a New Trend Source (P3)

This section explains how to add a new trend source without requiring UX changes.

### Source Contract

Every trend source must implement the `TrendSourceProvider` interface from `lib/trends/sources/types.ts`:

```typescript
export interface TrendSourceProvider {
  kind: TrendSourceKind;              // Unique identifier (e.g., 'hackernews', 'x_twitter')
  displayName: string;                 // Human-readable name (e.g., 'Hacker News', 'X (Twitter)')
  requiresCredential: boolean;         // True if authentication is required
  fetch(options?: FetchOptions): Promise<RawTrendPost[]>;  // Fetch and return raw posts
}
```

### Step-by-Step Guide

#### 1. Define the Source Kind

Add your new source kind to `lib/types/trends.ts`:

```typescript
export type TrendSourceKind = 
  | 'hackernews'
  | 'rss_bundle'
  | 'x_twitter'
  | 'reddit'           // Example: Add your new source here
  | /* ... more sources */
```

#### 2. Create Source Provider File

Create a new file in `lib/trends/sources/` (e.g., `reddit.ts`):

```typescript
import type { TrendSourceProvider, RawTrendPost, FetchOptions } from './types'

export const RedditSource: TrendSourceProvider = {
  kind: 'reddit',
  displayName: 'Reddit',
  requiresCredential: false,  // Set to true if authentication needed

  async fetch(options: FetchOptions = {}): Promise<RawTrendPost[]> {
    const { limit = 30 } = options

    try {
      // Implement your fetching logic here
      const response = await fetch('https://www.reddit.com/r/programming/hot.json', {
        signal: AbortSignal.timeout(10000), // 10s timeout
      })

      if (!response.ok) {
        throw new Error(`Reddit API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Transform to RawTrendPost format
      const posts: RawTrendPost[] = data.data.children
        .slice(0, limit)
        .map((child: any) => ({
          externalId: child.data.id,
          author: child.data.author,
          content: child.data.title,
          postedAt: new Date(child.data.created_utc * 1000).toISOString(),
          sourceUrl: `https://reddit.com${child.data.permalink}`,
        }))

      return posts
    } catch (error) {
      // Sanitize error messages (no credential leakage)
      if (error instanceof Error) {
        throw new Error(`Failed to fetch from Reddit: ${error.message}`)
      }
      throw new Error('Failed to fetch from Reddit')
    }
  },
}
```

#### 3. Register the Source

Add your source to the registry in `lib/trends/sources/registry.ts`:

```typescript
import { RedditSource } from './reddit'

const SOURCES: TrendSourceProvider[] = [
  HackerNewsSource,
  RssBundleSource,
  XTwitterSource,
  RedditSource,  // Add your source here
]
```

#### 4. Handle Credentials (If Required)

If your source requires credentials (`requiresCredential: true`):

**a) Update types in `lib/types/config.ts` or `lib/types/idea.ts`:**

```typescript
export interface UserConfiguration {
  // ... existing fields
  redditConfig?: {
    hasToken: boolean;
    defaultSubreddit?: string;
  };
  encryptedRedditToken?: string;
}
```

**b) Update config form in `components/config/CredentialsForm.tsx`:**

- Add UI inputs for credential and configuration
- Encrypt credentials before saving (use `encryptApiKey()`)
- Decrypt and mask for display (use `decryptApiKey()`)

**c) Update ingestion route in `app/api/trends/ingest/route.ts`:**

```typescript
// Validate credentials for sources that require them
if (source.requiresCredential) {
  if (sourceKind === 'reddit' && !body.redditToken) {
    return NextResponse.json(
      { error: 'Reddit token is required' },
      { status: 400 }
    )
  }
}
```

**d) Pass credentials in `components/printer/TrendInterface.tsx`:**

```typescript
if (preferredSource === 'reddit' && userConfig?.redditConfig?.hasToken) {
  const decryptedToken = await decryptApiKey(userConfig.encryptedRedditToken);
  requestBody.redditToken = decryptedToken;
}
```

#### 5. Testing

**a) Add unit tests** for any custom logic (if applicable):

```typescript
// tests/unit/trends/sources/reddit.test.ts
describe('Reddit Source', () => {
  it('should fetch posts from Reddit API', async () => {
    // Mock fetch and test
  })
})
```

**b) Add integration tests** in `tests/integration/api/trends-ingest.test.ts`:

```typescript
it('should ingest from reddit source', async () => {
  // Test ingestion with your source
})
```

**c) Update MSW handlers** in `tests/msw/handlers.ts` for deterministic tests:

```typescript
http.get('https://www.reddit.com/r/programming/hot.json', () => {
  return HttpResponse.json({
    data: {
      children: [/* mock data */]
    }
  })
})
```

### Best Practices

1. **Error Handling**: Always catch errors and provide user-friendly messages
2. **Timeouts**: Use `AbortSignal.timeout(10000)` for all external fetches
3. **No Credential Leaks**: Never include tokens/keys in error messages or logs
4. **Rate Limiting**: Handle 429 responses gracefully
5. **Data Validation**: Validate external API responses before processing
6. **Normalization**: Return consistent `RawTrendPost` format
7. **Testing**: Add MSW mocks for deterministic integration tests

### Source Template

A minimal source template is available in `lib/trends/sources/_template.ts`:

```typescript
import type { TrendSourceProvider, RawTrendPost, FetchOptions } from './types'

export const TemplateSource: TrendSourceProvider = {
  kind: 'template',
  displayName: 'Template Source',
  requiresCredential: false,

  async fetch(options: FetchOptions = {}): Promise<RawTrendPost[]> {
    const { limit = 30 } = options

    // TODO: Implement your fetching logic
    throw new Error('Template source not implemented')
  },
}
```

### Source Registration Order

Sources are processed in the order they appear in the registry. Consider:

- **Free sources first** (better UX for onboarding)
- **Popular sources** before niche ones
- **Alphabetical order** within each category (free vs credentialed)

