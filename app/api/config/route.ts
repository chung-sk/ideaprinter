/**
 * Configuration API Routes
 * Handles user configuration for API keys and preferences
 * Note: Using client-side localStorage, these routes primarily validate data
 */

import { NextRequest, NextResponse } from 'next/server';

// Gemini API key pattern validation
const GEMINI_API_KEY_PATTERN = /^AIzaSy[A-Za-z0-9_-]{33}$/;

const VALID_CATEGORIES = [
  'Technology',
  'Travel',
  'Finance',
  'Health',
  'Education',
  'Entertainment',
  'Productivity',
  'Social',
  'E-commerce',
  'Other',
];

export interface UserConfigRequest {
  geminiApiKey?: string;
  preferredCategories?: string[];
}

export interface UserConfigResponse {
  hasCustomApiKey: boolean;
  preferredCategories: string[];
  generationCount: number;
}

/**
 * GET /api/config
 * Get user configuration status
 * Note: Actual data is stored client-side in localStorage
 */
export async function GET() {
  try {
    // Since we use localStorage, this endpoint returns structure guidance
    // The actual data retrieval happens client-side
    return NextResponse.json({
      hasCustomApiKey: false,
      preferredCategories: [],
      generationCount: 0,
      message: 'Configuration is stored client-side. Use client storage utilities.',
    });
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve configuration',
        code: 'CONFIG_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/config
 * Validate and accept user configuration updates
 * Validation happens server-side, storage is client-side
 */
export async function PUT(request: NextRequest) {
  try {
    const body: UserConfigRequest = await request.json();

    // Validate Gemini API key format if provided
    if (body.geminiApiKey !== undefined) {
      if (body.geminiApiKey !== null && body.geminiApiKey !== '') {
        if (!GEMINI_API_KEY_PATTERN.test(body.geminiApiKey)) {
          return NextResponse.json(
            {
              error:
                'Invalid Gemini API key format. Key must start with "AIzaSy" and be 39 characters long.',
              code: 'INVALID_API_KEY',
            },
            { status: 400 }
          );
        }
      }
    }

    // Validate preferred categories if provided
    if (body.preferredCategories !== undefined) {
      if (!Array.isArray(body.preferredCategories)) {
        return NextResponse.json(
          {
            error: 'preferredCategories must be an array',
            code: 'INVALID_CATEGORIES',
          },
          { status: 400 }
        );
      }

      if (body.preferredCategories.length > 5) {
        return NextResponse.json(
          {
            error: 'Maximum 5 preferred categories allowed',
            code: 'TOO_MANY_CATEGORIES',
          },
          { status: 400 }
        );
      }

      // Validate each category
      const invalidCategories = body.preferredCategories.filter(
        (cat) => !VALID_CATEGORIES.includes(cat)
      );

      if (invalidCategories.length > 0) {
        return NextResponse.json(
          {
            error: `Invalid categories: ${invalidCategories.join(', ')}`,
            code: 'INVALID_CATEGORY_VALUES',
            validCategories: VALID_CATEGORIES,
          },
          { status: 400 }
        );
      }
    }

    // If validation passes, return success
    // Client will handle actual localStorage storage
    return NextResponse.json({
      success: true,
      message: 'Configuration validated successfully. Store client-side.',
      hasCustomApiKey: !!body.geminiApiKey && body.geminiApiKey !== '',
      preferredCategories: body.preferredCategories || [],
    });
  } catch (error) {
    console.error('Config PUT error:', error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to update configuration',
        code: 'CONFIG_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/config
 * Clear user configuration (remove custom API key)
 */
export async function DELETE() {
  try {
    // Since storage is client-side, this just confirms the action
    return NextResponse.json({
      success: true,
      message: 'Configuration cleared. Remove from client-side storage.',
    });
  } catch (error) {
    console.error('Config DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear configuration',
        code: 'CONFIG_ERROR',
      },
      { status: 500 }
    );
  }
}
