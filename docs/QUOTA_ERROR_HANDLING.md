# Gemini API Quota Error Handling

## Problem

The application was hitting Gemini API quota limits (429 errors) and displaying raw error messages to users. The free tier has strict limits:
- **Gemini 2.5 Flash**: ~20 requests per day (reduced by 90% in Dec 2025)
- **Gemini 2.5 Pro**: 100 requests per day

## Solution Implemented

### 1. Enhanced Error Handling in `lib/gemini/client.ts`

#### Exponential Backoff Retry Logic
- Automatically retries API calls up to 3 times on rate limit errors
- Uses exponential backoff: 1s → 2s → 4s delays
- Extracts retry delay from Gemini error response when available

#### User-Friendly Error Messages
Transforms technical errors into actionable messages:

**Quota Exceeded:**
```
🚫 API quota exceeded. Daily limit: 20 requests. Please try again in 19 seconds.

💡 Solutions:
• Wait for quota to reset (resets daily)
• Add your own Gemini API key in Settings
• Upgrade to Gemini paid tier for higher limits
```

**Other Errors:**
- Invalid API Key → "Invalid API key. Please check your Gemini API key in Settings."
- Model Not Found → "Model \"gemini-x.x-flash\" not found. Please select a valid model."
- Context Length → "Input is too long. Gemini models support up to 1,048,576 tokens."

#### Retry Delay Extraction
Parses Gemini's `RetryInfo` error details to get exact retry timing:
```typescript
{
  "@type": "type.googleapis.com/google.rpc.RetryInfo",
  "retryDelay": "19s"
}
```

### 2. API Route Updates in `app/api/generate-idea/route.ts`

- Catches errors from `geminiClient.generateIdea()`
- Logs failures with detailed context
- Returns appropriate HTTP status codes:
  - 429 for rate limits (with `retryAfter` field)
  - 500 for generation failures

### 3. Enhanced Error Display in `components/common/ErrorMessage.tsx`

#### Visual Differentiation
- **Quota Errors**: Yellow styling (warning, not critical)
- **Other Errors**: Red styling (critical error)

#### Multi-line Support
- Uses `whitespace-pre-line` to display formatted error messages
- Preserves line breaks and bullet points

#### Action Links
- "Try Again" button for retry
- "Go to Settings" link when API key is mentioned

### 4. Frontend Handling in `components/printer/PrinterInterface.tsx`

Already had good error handling:
- Displays rate limit errors with retry time
- Shows upgrade prompt for trial users
- Updates trial status after each generation

## How It Works

### Retry Flow
```
User clicks "Print" 
  → API Call (Attempt 1)
    → 429 Error → Extract retry delay (19s)
    → Wait 19s
  → API Call (Attempt 2)
    → 429 Error → Exponential backoff (2s)
    → Wait 2s
  → API Call (Attempt 3)
    → Success ✅ or Final Error ❌
```

### Error Message Flow
```
Gemini API Error
  ↓
GeminiClient.transformError()
  ↓ 
Extract quota info (limit, retryAfter)
  ↓
Format user-friendly message
  ↓
Return to API route
  ↓
Frontend displays with ErrorMessage component
```

## Testing

### Simulate Quota Error
1. Exhaust your daily quota (generate 20+ ideas)
2. Try to generate another idea
3. Should see:
   - Yellow warning box
   - Formatted error message with solutions
   - Retry information
   - Link to Settings

### Verify Retry Logic
Check terminal logs for retry attempts:
```
🤖 Calling Gemini API with model: gemini-2.5-flash (attempt 1)
❌ Failed to generate idea using gemini-2.5-flash: ...
⏳ Rate limit hit. Retrying in 19000ms (attempt 1/3)...
🤖 Calling Gemini API with model: gemini-2.5-flash (attempt 2)
✅ Successfully generated idea using gemini-2.5-flash
```

## Benefits

1. **Better User Experience**: Clear, actionable error messages instead of technical jargon
2. **Automatic Recovery**: Retries with intelligent delays increase success rate
3. **Reduced Support**: Users know exactly what to do (wait, add API key, or upgrade)
4. **Visual Clarity**: Yellow for quota warnings vs red for critical errors
5. **Actionable UI**: Direct links to Settings when API key needed

## Related Files

- `lib/gemini/client.ts` - Core retry and error transformation logic
- `app/api/generate-idea/route.ts` - API endpoint error handling
- `components/common/ErrorMessage.tsx` - Error display component
- `.agents/skills/google-gemini-api/SKILL.md` - Reference documentation

## Free Tier Limits (As of Dec 2025)

| Model | RPM | TPM | RPD | Notes |
|-------|-----|-----|-----|-------|
| gemini-2.5-flash | 10 | 250K | ~20 | **90% reduction** from 250 |
| gemini-2.5-pro | 5 | 125K | 100 | **80% reduction** from ~250 |
| gemini-2.5-flash-lite | 15 | 250K | 1000 | Unchanged |

Source: [AI Free API Blog](https://www.aifreeapi.com/en/posts/gemini-api-free-tier-limit)

## Recommendations

1. **For Users**: Add your own Gemini API key in Settings for higher limits
2. **For Production**: Consider upgrading to paid tier (1000+ RPM)
3. **For Development**: Use `gemini-2.5-flash-lite` for testing (1000 RPD free)
