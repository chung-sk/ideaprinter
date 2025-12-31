/**
 * POST /api/trends/ingest
 * Start an async ingestion job for a trend source
 */

import { NextRequest, NextResponse } from 'next/server'
import { createJob, updateJob } from '@/lib/trends/ingestionJobStore'
import { getSource, isValidSourceKind } from '@/lib/trends/sources/registry'
import { normalizeTrendPost } from '@/lib/trends/normalize'
import { filterSafePosts } from '@/lib/trends/safety'
import type { TrendSourceKind } from '@/lib/types/trends'

interface IngestRequest {
  sourceKind: string
  xBearerToken?: string
  xQuery?: string
}

/**
 * Validate request body
 */
function validateRequest(body: unknown): body is IngestRequest {
  if (!body || typeof body !== 'object') return false
  const req = body as Record<string, unknown>
  return typeof req.sourceKind === 'string' && req.sourceKind.length > 0
}

/**
 * Execute ingestion job asynchronously
 */
async function executeIngestion(
  jobId: string, 
  sourceKind: TrendSourceKind,
  options: { xBearerToken?: string; xQuery?: string } = {}
) {
  try {
    // Update job to running
    updateJob(jobId, { status: 'running' })

    // Fetch from source with credentials if provided
    const source = getSource(sourceKind)
    const rawPosts = await source.fetch({ 
      limit: 30,
      xBearerToken: options.xBearerToken,
      xQuery: options.xQuery,
    })

    // Normalize posts
    const normalizedPosts = rawPosts.map(raw => normalizeTrendPost(raw, source.kind))

    // Filter safe posts (per FR-006)
    const safePosts = filterSafePosts(normalizedPosts)

    // Update job to completed
    updateJob(jobId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      posts: safePosts,
      ingestedCount: safePosts.length,
    })
  } catch (error) {
    console.error(`Ingestion job ${jobId} failed:`, error)
    
    // Update job to failed (sanitize error message)
    const errorMessage = error instanceof Error 
      ? error.message.replace(/key|token|password|credential|secret|Bearer\s+\S+/gi, '[REDACTED]')
      : 'Unknown error occurred'
    
    updateJob(jobId, {
      status: 'failed',
      completedAt: new Date().toISOString(),
      error: errorMessage,
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request
    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request: sourceKind is required' },
        { status: 400 }
      )
    }

    // Validate source kind
    if (!isValidSourceKind(body.sourceKind)) {
      return NextResponse.json(
        { error: `Invalid source kind: ${body.sourceKind}` },
        { status: 400 }
      )
    }

    const sourceKind = body.sourceKind as TrendSourceKind

    // Validate credentials for sources that require them
    const source = getSource(sourceKind)
    if (source.requiresCredential) {
      // X/Twitter requires bearer token
      if (sourceKind === 'x_twitter' && !body.xBearerToken) {
        return NextResponse.json(
          { error: 'X bearer token is required for X/Twitter source' },
          { status: 400 }
        )
      }
    }

    // Create ingestion job
    const jobId = createJob(sourceKind)

    // Start async ingestion (don't await)
    executeIngestion(jobId, sourceKind, {
      xBearerToken: body.xBearerToken,
      xQuery: body.xQuery,
    }).catch(err => {
      console.error('Ingestion execution error:', err)
    })

    // Return 202 Accepted with job ID
    return NextResponse.json(
      {
        jobId,
        status: 'pending',
        sourceKind: body.sourceKind,
      },
      { status: 202 }
    )
  } catch (error) {
    console.error('POST /api/trends/ingest error:', error)
    return NextResponse.json(
      { error: 'Failed to start ingestion' },
      { status: 500 }
    )
  }
}
