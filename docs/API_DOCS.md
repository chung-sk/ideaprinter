# API Documentation

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://ideaprinter.vercel.app/api`

## Rate Limiting & Session Protection

All API requests are subject to per-session rate limits to protect service stability.

### Session-Based Limits

The application uses anonymous session tracking to enforce usage limits **without requiring user login**:

- **Session Identifier**: Automatically assigned on first visit, persists across page refreshes via HTTP-only cookie
- **Daily Limit**: 30 idea generations per session per 24-hour window
- **Minute Limit**: 5 idea generations per session per 60-second window
- **Concurrent Requests**: Limits are enforced per session; multiple tabs share the same session quota

### Session Cookie

**Cookie Name**: `ideaprinter-session`  
**Properties**:

- `HttpOnly`: Cannot be accessed via JavaScript
- `Secure`: Transmitted only over HTTPS in production
- `SameSite=Lax`: CSRF protection
- `Max-Age`: 1 year
- **Signed**: HMAC-signed to prevent tampering

The session cookie contains encrypted quota state. Modifying it will invalidate the signature and result in a new session being created.

### Rate Limit Response Headers

**Success Responses** (200 OK) include:

- `X-RateLimit-Limit`: Daily limit (30)
- `X-RateLimit-Remaining`: Remaining requests in current day
- `X-RateLimit-Reset`: ISO timestamp when daily limit resets

**429 Rate Limit Exceeded**:

```json
{
  "error": "Session limit reached. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 45
}
```

**Headers on 429**:

- `Retry-After`: Seconds until the limit resets

### Concurrent Request Handling

If multiple tabs/windows send requests simultaneously:

- Each request validates against the current quota state
- The last response to complete sets the final cookie state
- This may allow slightly exceeding limits during concurrent bursts (e.g., 6 instead of 5 per minute)
- An IP-based middleware throttle provides an additional safety net

### Failed Requests

Failed idea generation attempts (errors, timeouts) **do not count** against your quota. Only successful generations decrement your allowance.

---

## Endpoints

### Get Session Info

Retrieve current session identifier and remaining quota.

**Endpoint**: `GET /api/session`

**Response** (200 OK):

```json
{
  "sessionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "remainingDaily": 27,
  "remainingMinute": 5,
  "dailyResetAt": 1766664000000,
  "minuteResetAt": 1766664060000
}
```

**Notes**:

- Creates a new session if none exists or if the existing cookie is invalid
- Returns current quota accounting for expired windows
- Safe to call frequently; does not consume quota

---

### Generate Idea

Generate a new app idea using Gemini AI. **Subject to per-session rate limits.**

**Endpoint**: `POST /api/generate-idea`

**Request Body**:

```json
{
  "userApiKey": "AIzaSy...", // Optional: Custom Gemini API key
  "preferredCategory": "Travel" // Optional: Preferred category
}
```

**Response** (200 OK):

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "appName": "NomadNest",
  "category": "Travel",
  "concept": "Apartments with verified wifi speeds.",
  "theGap": "Airbnbs claim 'high-speed wifi' but often deliver 2Mbps.",
  "theFix": "A rental platform where every listing requires a verified, timestamped speed test screenshot uploaded weekly.",
  "generatedAt": "2025-12-23T10:30:00Z",
  "uniqueId": "NI4QMZ2B",
  "durationMs": 2340,
  "apiKeySource": "default"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid category
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Generation failed
- `504 Gateway Timeout`: Generation timeout (>5 seconds)

---

### Get Configuration

Get user configuration status (client-side operation).

**Endpoint**: `GET /api/config`

**Response** (200 OK):

```json
{
  "hasCustomApiKey": false,
  "preferredCategories": [],
  "generationCount": 0,
  "message": "Configuration is stored client-side."
}
```

---

### Update Configuration

Validate user configuration (actual storage is client-side).

**Endpoint**: `PUT /api/config`

**Request Body**:

```json
{
  "geminiApiKey": "AIzaSy...", // Optional: Gemini API key
  "preferredCategories": ["Travel", "Technology"] // Optional: Max 5
}
```

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Configuration validated successfully.",
  "hasCustomApiKey": true,
  "preferredCategories": ["Travel", "Technology"]
}
```

**Error Responses**:

- `400 Bad Request`: Invalid API key format or categories
- `500 Internal Server Error`: Validation failed

---

### Clear Configuration

Clear user configuration.

**Endpoint**: `DELETE /api/config`

**Response** (200 OK):

```json
{
  "success": true,
  "message": "Configuration cleared."
}
```

---

## Data Types

### IdeaCategory

```typescript
type IdeaCategory =
  | 'Technology'
  | 'Travel'
  | 'Finance'
  | 'Health'
  | 'Education'
  | 'Entertainment'
  | 'Productivity'
  | 'Social'
  | 'E-commerce'
  | 'Other';
```

### GeneratedIdea

```typescript
interface GeneratedIdea {
  id: string;
  appName: string;
  category: IdeaCategory;
  concept: string;
  theGap: string;
  theFix: string;
  generatedAt: string; // ISO 8601
  uniqueId: string; // 8-char alphanumeric
}
```

---

## Rate Limits

- **Default API Key**: 60 requests per minute
- **Custom API Key**: Based on your Gemini API quota

---

## Error Codes

| Code                  | Description                      |
| --------------------- | -------------------------------- |
| `INVALID_REQUEST`     | Invalid request parameters       |
| `INVALID_API_KEY`     | Invalid Gemini API key format    |
| `INVALID_CATEGORIES`  | Invalid category values          |
| `TOO_MANY_CATEGORIES` | More than 5 categories specified |
| `GENERATION_FAILED`   | AI generation error              |
| `TIMEOUT`             | Generation exceeded 5 seconds    |
| `RATE_LIMIT_EXCEEDED` | Too many requests                |

---

## Examples

### Generate Idea with Custom Key

```bash
curl -X POST https://ideaprinter.vercel.app/api/generate-idea \
  -H "Content-Type: application/json" \
  -d '{
    "userApiKey": "AIzaSy...",
    "preferredCategory": "Technology"
  }'
```

### Validate Configuration

```bash
curl -X PUT https://ideaprinter.vercel.app/api/config \
  -H "Content-Type: application/json" \
  -d '{
    "geminiApiKey": "AIzaSy...",
    "preferredCategories": ["Travel", "Technology"]
  }'
```

---

For full OpenAPI specification, see [contracts/api-spec.yaml](../specs/001-idea-printer/contracts/api-spec.yaml).

### Generate Sourced Idea (Async)

Generate an app idea based on 'today''s signals' (news/social). This is an asynchronous operation.

**Endpoint**: \POST /api/generate-sourced-idea\

**Request Body**:
\\\json
{
"freshnessWindow": "today",
"sources": ["x"],
"socialAuth": {
"xBearerToken": "..." // Required if 'x' source is selected
},
"userApiKey": "AIzaSy...", // Optional
"modelName": "gemini-2.5-flash" // Optional
}
\\\

**Response** (202 Accepted):
\\\json
{
"jobId": "job-123...",
"status": "queued",
"statusUrl": "/api/generate-sourced-idea/job-123..."
}
\\\

---

### Get Sourced Idea Job Status

Poll the status of a sourced idea generation job.

**Endpoint**: \GET /api/generate-sourced-idea/{jobId}\

**Response** (200 OK - Pending):
\\\json
{
"jobId": "job-123...",
"status": "queued" // or "running"
}
\\\

**Response** (200 OK - Succeeded):
\\\json
{
"jobId": "job-123...",
"status": "succeeded",
"result": {
"id": "...",
"appName": "...",
"concept": "...",
"gapCandidates": [...],
"signalsUsed": [...]
}
}
\\\

**Response** (200 OK - Failed):
\\\json
{
"jobId": "job-123...",
"status": "failed",
"error": {
"message": "..."
}
}
\\\

---

## Trend Ingestion Endpoints

### Ingest Trend Posts (Async)

Start a trend ingestion job from an Apify data source. This endpoint enqueues an asynchronous ingestion job that fetches and normalizes social trend posts.

**Endpoint**: `POST /api/trends/ingest`

**Request Body**:

```json
{
  "trendSource": {
    "id": "source-001",
    "actorId": "apify/twitter-scraper",
    "input": {
      "searchQuery": "#AI",
      "maxTweets": 100
    }
  },
  "encryptedApifyToken": "encrypted-token-string"
}
```

**Response** (202 Accepted):

```json
{
  "jobId": "ingestion-1766944274285-abc123"
}
```

**Error Responses**:

- `400 Bad Request`: Missing required field (trendSource)
- `401 Unauthorized`: Apify token not configured
- `500 Internal Server Error`: Ingestion job creation failed

**Notes**:

- The `trendSource` object defines the Apify actor to run and its input configuration
- The `encryptedApifyToken` should be encrypted using the application's encryption utilities
- The response includes a `jobId` that can be used to poll for job status
- Ingestion runs asynchronously in the background after returning 202

---

### Get Trend Ingestion Job Status

Poll the status of a trend ingestion job and retrieve ingested posts when complete.

**Endpoint**: `GET /api/trends/ingest/{jobId}`

**Response** (200 OK - Pending):

```json
{
  "id": "ingestion-1766944274285-abc123",
  "trendSourceId": "source-001",
  "status": "pending",
  "startedAt": "2025-12-28T17:51:14.285Z",
  "ingestedCount": 0,
  "skippedCount": 0
}
```

**Response** (200 OK - Running):

```json
{
  "id": "ingestion-1766944274285-abc123",
  "trendSourceId": "source-001",
  "status": "running",
  "startedAt": "2025-12-28T17:51:14.285Z",
  "ingestedCount": 0,
  "skippedCount": 0,
  "apifyRunId": "run-xyz789"
}
```

**Response** (200 OK - Completed):

```json
{
  "id": "ingestion-1766944274285-abc123",
  "trendSourceId": "source-001",
  "status": "completed",
  "startedAt": "2025-12-28T17:51:14.285Z",
  "completedAt": "2025-12-28T17:51:45.123Z",
  "ingestedCount": 42,
  "skippedCount": 3
}
```

**Response** (200 OK - Failed):

```json
{
  "id": "ingestion-1766944274285-abc123",
  "trendSourceId": "source-001",
  "status": "failed",
  "startedAt": "2025-12-28T17:51:14.285Z",
  "completedAt": "2025-12-28T17:51:30.456Z",
  "ingestedCount": 0,
  "skippedCount": 0,
  "error": "Apify run failed with status: ABORTED"
}
```

**Response** (404 Not Found):

```json
{
  "error": "Job not found"
}
```

**Notes**:

- Job status is one of: `pending`, `running`, `completed`, or `failed`
- Completed jobs include `ingestedCount` (posts successfully ingested) and `skippedCount` (posts filtered/blocked)
- Posts are returned in the response body for completed jobs (client handles deduplication)
- Jobs are stored in-memory and expire after a TTL period (configurable)

---

### Generate Idea from Trend Post

Generate an idea based on a selected trend post. This converts the trend post into signal inputs and generates a market-gap driven idea.

**Endpoint**: `POST /api/generate-sourced-idea`

**Request Body** (when using trend post):

```json
{
  "signalInputs": [
    {
      "text": "Exciting product launch announcement...",
      "source": "x",
      "publishedAt": "2025-12-29T10:00:00Z",
      "url": "https://x.com/example/status/123456",
      "author": "example"
    }
  ],
  "userApiKey": "AIzaSy...", // Optional
  "modelName": "gemini-2.5-flash" // Optional
}
```

**Response** (202 Accepted):

```json
{
  "jobId": "job-sourced-abc123",
  "status": "queued"
}
```

**Notes**:

- The selected trend post is converted to a `SignalItem` format with excerpt, platform, author, timestamp, and URL
- Generated ideas include provenance tracking (link to original post, platform, author, posted date)
- Provenance is displayed in the idea printout and stored in localStorage
- The generation follows the same async pattern as the general sourced idea generation
