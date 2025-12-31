/**
 * Ingestion Job Store
 * 
 * In-memory store for async ingestion jobs with TTL.
 * Uses globalThis singleton for HMR safety in dev mode.
 */

import type { IngestionRun, IngestionStatus, TrendSourceKind } from '@/lib/types/trends'
import { v4 as uuidv4 } from 'uuid'

export type { IngestionRun as IngestionJob, IngestionStatus }

interface JobStoreState {
  jobs: Map<string, IngestionRun>
  lastCleanup: number
}

// TTL for completed jobs (30 minutes)
const JOB_TTL_MS = 30 * 60 * 1000

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000

/**
 * Get or initialize the global job store (HMR-safe)
 */
function getStore(): JobStoreState {
  const globalKey = '__ideaprinter_ingestion_jobs__'
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!(global as any)[globalKey]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any)[globalKey] = {
      jobs: new Map<string, IngestionRun>(),
      lastCleanup: Date.now(),
    }
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (global as any)[globalKey] as JobStoreState
}

/**
 * Clean up expired jobs (TTL enforcement)
 */
function cleanupExpiredJobs(): void {
  const store = getStore()
  const now = Date.now()
  
  // Only cleanup if enough time has passed
  if (now - store.lastCleanup < CLEANUP_INTERVAL_MS) {
    return
  }
  
  const expiredJobs: string[] = []
  
  for (const [jobId, job] of store.jobs.entries()) {
    const jobTime = new Date(job.startedAt).getTime()
    const age = now - jobTime
    
    // Remove jobs older than TTL
    if (age > JOB_TTL_MS) {
      expiredJobs.push(jobId)
    }
  }
  
  expiredJobs.forEach(jobId => store.jobs.delete(jobId))
  store.lastCleanup = now
}

/**
 * Create a new ingestion job
 */
export function createJob(
  source: TrendSourceKind,
  params?: { limit?: number; xQuery?: string }
): string {
  cleanupExpiredJobs()
  
  const store = getStore()
  const jobId = `ingestion-${uuidv4()}`
  
  const job: IngestionRun = {
    id: jobId,
    trendSourceId: source,
    source,
    status: 'pending',
    startedAt: new Date().toISOString(),
    ingestedCount: 0,
    skippedCount: 0,
    ...params,
  }
  
  store.jobs.set(jobId, job)
  
  return jobId
}

/**
 * Get a job by ID
 */
export function getJob(jobId: string): IngestionRun | undefined {
  cleanupExpiredJobs()
  
  const store = getStore()
  return store.jobs.get(jobId)
}

/**
 * Update a job
 */
export function updateJob(
  jobId: string,
  updates: Partial<Omit<IngestionRun, 'id' | 'trendSourceId' | 'startedAt'>>
): void {
  const store = getStore()
  const job = store.jobs.get(jobId)
  
  if (!job) {
    throw new Error(`Job not found: ${jobId}`)
  }
  
  const updatedJob: IngestionRun = {
    ...job,
    ...updates,
  }
  
  store.jobs.set(jobId, updatedJob)
}

/**
 * Check if a job is in a terminal state
 */
export function isTerminalState(status: IngestionStatus): boolean {
  return status === 'completed' || status === 'failed'
}

/**
 * List all jobs (for debugging)
 */
export function listJobs(): IngestionRun[] {
  cleanupExpiredJobs()
  
  const store = getStore()
  return Array.from(store.jobs.values())
}
