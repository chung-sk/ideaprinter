import { NextRequest, NextResponse } from 'next/server';
import { checkGlobalQuota, incrementGlobalQuota, isUsingSharedKey } from '@/lib/auth/globalQuota';
import { createGeminiClient } from '@/lib/gemini/client';
import { createIdeaPrompt } from '@/lib/gemini/prompts';
import { generateUniqueId } from '@/lib/utils/idGenerator';
import { IdeaGenerationRequest, IdeaGenerationResponse, IDEA_CATEGORIES } from '@/lib/types/idea';
import {
  logGenerationRequest,
  logGenerationSuccess,
  logGenerationFailure,
  logApiError,
  logPerformanceMetric,
} from '@/lib/utils/logging/logger';
import { v4 as uuidv4 } from 'uuid';

// Increase the maximum duration for this API route to 60 seconds
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = uuidv4();
  let userApiKey: string | undefined;

  try {
    // Parse request body
    const body: IdeaGenerationRequest = await request.json().catch(() => ({}));
    userApiKey = body.userApiKey;
    const { preferredCategory, modelName, trendContext } = body;

    // Determine if using shared key
    const usingSharedKey = isUsingSharedKey(userApiKey);

    // Global Quota Check (only for shared key)
    if (usingSharedKey) {
      const quotaStatus = checkGlobalQuota();

      if (!quotaStatus.isAllowed) {
        return NextResponse.json(
          {
            error:
              'Shared API key quota exhausted. Please try again later or provide your own API key.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: quotaStatus.retryAfter,
          },
          { status: 429 }
        );
      }
    }

    // Log generation request
    logGenerationRequest({
      requestId,
      category: preferredCategory,
      apiKeySource: userApiKey ? 'user_provided' : 'default',
      startTime,
    });

    // Validate preferred category if provided
    if (preferredCategory && !IDEA_CATEGORIES.includes(preferredCategory)) {
      logApiError({
        endpoint: '/api/generate-idea',
        method: 'POST',
        statusCode: 400,
        errorMessage: 'Invalid category',
      });
      return NextResponse.json(
        { error: 'Invalid category', code: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Create Gemini client with user API key or default
    const geminiClient = createGeminiClient(userApiKey, modelName);

    // Generate prompt
    const prompt = createIdeaPrompt(preferredCategory, trendContext);

    // Generate idea with 50-second timeout (within the 60s route limit)
    const responseText = await geminiClient.generateIdea(prompt, 50000);

    // Parse JSON response
    let ideaData;
    try {
      // Remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      ideaData = JSON.parse(cleanedText);
    } catch {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse generated idea', code: 'GENERATION_FAILED' },
        { status: 500 }
      );
    }

    // Validate response structure
    const requiredFields = ['appName', 'category', 'concept', 'theGap', 'theFix'];
    for (const field of requiredFields) {
      if (!ideaData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}`, code: 'GENERATION_FAILED' },
          { status: 500 }
        );
      }
    }

    // Generate unique ID
    const uniqueId = generateUniqueId();

    // Calculate duration
    const durationMs = Date.now() - startTime;

    // Increment global quota (only for shared key)
    if (usingSharedKey) {
      incrementGlobalQuota();
    }

    // Construct response
    const response: IdeaGenerationResponse = {
      id: uniqueId,
      appName: ideaData.appName,
      category: ideaData.category,
      concept: ideaData.concept,
      theGap: ideaData.theGap,
      theFix: ideaData.theFix,
      generatedAt: new Date().toISOString(),
      uniqueId: uniqueId,
      durationMs: durationMs,
      apiKeySource: userApiKey ? 'user_provided' : 'default',
    };

    // Log generation time
    console.log(`Idea generated in ${durationMs}ms`);

    // Log performance metric
    logPerformanceMetric({
      metric: 'generation_time',
      value: durationMs,
      unit: 'ms',
      details: {
        requestId,
        category: response.category,
        apiKeySource: response.apiKeySource,
      },
    });

    // Check if exceeded 5-second target
    if (durationMs > 5000) {
      console.warn(`Generation exceeded 5-second target: ${durationMs}ms`);
    }

    // Log success
    logGenerationSuccess({
      requestId,
      ideaId: response.id,
      category: response.category,
      durationMs,
      apiKeySource: response.apiKeySource,
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const durationMs = Date.now() - startTime;

    if (error instanceof Error) {
      // Handle timeout
      if (error.message.includes('timeout')) {
        logGenerationFailure(
          {
            requestId,
            errorMessage: 'Idea generation timed out',
            durationMs,
            apiKeySource: userApiKey ? 'user_provided' : 'default',
          },
          error
        );

        return NextResponse.json(
          { error: 'Idea generation timed out. Please try again.', code: 'TIMEOUT' },
          { status: 504 }
        );
      }

      // Handle API errors
      if (error.message.includes('API key')) {
        logApiError(
          {
            endpoint: '/api/generate-idea',
            method: 'POST',
            statusCode: 400,
            errorMessage: 'Invalid API key',
          },
          error
        );

        return NextResponse.json(
          { error: 'Invalid API key', code: 'INVALID_REQUEST' },
          { status: 400 }
        );
      }

      console.error('Generation error:', error.message);

      logGenerationFailure(
        {
          requestId,
          errorMessage: error.message,
          durationMs,
          apiKeySource: userApiKey ? 'user_provided' : 'default',
        },
        error
      );

      return NextResponse.json(
        { error: 'Failed to generate idea. Please try again.', code: 'GENERATION_FAILED' },
        { status: 500 }
      );
    }

    logGenerationFailure({
      requestId,
      errorMessage: 'Unexpected error',
      durationMs,
      apiKeySource: userApiKey ? 'user_provided' : 'default',
    });

    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
