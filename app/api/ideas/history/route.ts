import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ideas/history
 * 
 * Get paginated idea history (client-side implementation)
 * This endpoint validates query parameters and returns instructions
 * for client-side history retrieval from localStorage.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const category = searchParams.get('category') || undefined;
    const sortBy = searchParams.get('sortBy') || 'generatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Validate parameters
    if (!['generatedAt', 'appName', 'category'].includes(sortBy)) {
      return NextResponse.json(
        {
          error: 'INVALID_SORT_BY',
          message: 'sortBy must be one of: generatedAt, appName, category',
        },
        { status: 400 }
      );
    }

    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        {
          error: 'INVALID_SORT_ORDER',
          message: 'sortOrder must be one of: asc, desc',
        },
        { status: 400 }
      );
    }

    // Return validation success and pagination config
    return NextResponse.json({
      message: 'History is stored client-side in localStorage.',
      pagination: {
        page,
        limit,
        category,
        sortBy,
        sortOrder,
      },
      instructions: 'Use lib/utils/storage.ts getAllIdeas() to retrieve history from localStorage.',
    });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to process history request.',
      },
      { status: 500 }
    );
  }
}
