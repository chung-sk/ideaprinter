import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ideas/[ideaId]
 *
 * Get a specific idea by ID (client-side implementation)
 */
export async function GET(request: NextRequest, { params }: { params: { ideaId: string } }) {
  try {
    const { ideaId } = params;

    if (!ideaId) {
      return NextResponse.json(
        {
          error: 'MISSING_IDEA_ID',
          message: 'Idea ID is required.',
        },
        { status: 400 }
      );
    }

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(ideaId)) {
      return NextResponse.json(
        {
          error: 'INVALID_IDEA_ID',
          message: 'Invalid idea ID format. Must be a valid UUID.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Ideas are stored client-side in localStorage.',
      ideaId,
      instructions:
        'Use lib/utils/storage.ts getIdeaById() to retrieve the idea from localStorage.',
    });
  } catch (error) {
    console.error('Get idea API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to process request.',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ideas/[ideaId]
 *
 * Soft delete an idea (client-side implementation)
 */
export async function DELETE(request: NextRequest, { params }: { params: { ideaId: string } }) {
  try {
    const { ideaId } = params;

    if (!ideaId) {
      return NextResponse.json(
        {
          error: 'MISSING_IDEA_ID',
          message: 'Idea ID is required.',
        },
        { status: 400 }
      );
    }

    // Validate ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(ideaId)) {
      return NextResponse.json(
        {
          error: 'INVALID_IDEA_ID',
          message: 'Invalid idea ID format. Must be a valid UUID.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Ideas are stored client-side in localStorage.',
      ideaId,
      instructions: 'Use lib/utils/storage.ts deleteIdea() to remove the idea from localStorage.',
    });
  } catch (error) {
    console.error('Delete idea API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: 'Failed to process delete request.',
      },
      { status: 500 }
    );
  }
}
