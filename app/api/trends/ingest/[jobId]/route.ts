/**
 * GET /api/trends/ingest/[jobId]
 * Get status of an ingestion job
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJob, isTerminalState } from '@/lib/trends/ingestionJobStore';

interface RouteContext {
  params: {
    jobId: string;
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { jobId } = context.params;

    // Get job from store
    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Build response based on job status
    const response: Record<string, unknown> = {
      jobId: job.id,
      status: job.status,
      sourceKind: job.source,
      createdAt: job.startedAt,
    };

    if (isTerminalState(job.status)) {
      response.completedAt = job.completedAt;

      if (job.status === 'completed') {
        response.posts = job.posts || [];
        response.postCount = job.ingestedCount || 0;
      } else if (job.status === 'failed') {
        response.error = job.error || 'Unknown error';
      }
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error(`GET /api/trends/ingest/${context.params.jobId} error:`, error);
    return NextResponse.json({ error: 'Failed to get job status' }, { status: 500 });
  }
}
