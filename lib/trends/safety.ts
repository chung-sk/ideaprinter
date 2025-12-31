/**
 * Safety Filtering
 * 
 * Content safety checks per FR-006 definition in spec.md.
 * Blocked content must not be stored or displayed.
 */

export interface SafetyCheckResult {
  safe: boolean
  reason?: string
}

/**
 * Patterns for unsafe content categories
 * Per FR-006: hate/harassment, explicit sexual content, minors, wrongdoing, self-harm, secrets/PII
 */
const UNSAFE_PATTERNS = [
  // Explicit sexual content
  { pattern: /\b(xxx|explicit adult|pornographic|sexual content)\b/i, reason: 'explicit sexual content' },
  
  // Hate speech and harassment
  { pattern: /\b(hate speech|harassment|bullying)\b/i, reason: 'hate speech or harassment' },
  
  // Self-harm
  { pattern: /\b(self-harm|suicide methods|promoting suicide)\b/i, reason: 'self-harm content' },
  
  // Secrets and credentials (more sensitive patterns)
  { pattern: /\b(api[_-]?key|secret[_-]?key|access[_-]?token)\s*[=:]\s*['"]?\S{10,}/i, reason: 'potential secret or credential' },
  { pattern: /\b(password|passwd|pwd)\s*[=:]\s*['"]?\S{6,}/i, reason: 'potential credential' },
  { pattern: /Bearer\s+[\w\-._~+/]+=*/i, reason: 'potential credential (bearer token)' },
  { pattern: /\baws[_-]?secret[_-]?access[_-]?key/i, reason: 'AWS secret credential' },
  
  // PII patterns
  { pattern: /\bSSN\s+(is|:)?\s*\d{3}[- ]?\d{2}[- ]?\d{4}\b/i, reason: 'potential SSN (PII)' },
  { pattern: /\b(credit\s+card|card\s+number)\s*[:\s]\s*\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/i, reason: 'potential credit card (PII)' },
  { pattern: /\bemail\s+me\s+at\s+[\w.+-]+@[\w.-]+\.\w+\s+with\s+personal/i, reason: 'PII sharing request' },
]

/**
 * Technical context allowlist (reduce false positives)
 */
const TECHNICAL_CONTEXT_PATTERNS = [
  /\busing bearer tokens?\b/i,
  /\bpassword hashing\b/i,
  /\bapi key management\b/i,
  /\bsecurity vulnerabilit(y|ies)\b/i,
  /\bauthentication\b/i,
]

/**
 * Check if content is safe per FR-006 definition
 */
export function isSafeContent(content: string): SafetyCheckResult {
  // Empty or whitespace-only content is safe
  if (!content || content.trim().length === 0) {
    return { safe: true }
  }
  
  // Check if content is technical discussion (allowlist)
  const isTechnicalContext = TECHNICAL_CONTEXT_PATTERNS.some(pattern => 
    pattern.test(content)
  )
  
  // If it's technical context, be more lenient with certain patterns
  const patternsToCheck = isTechnicalContext
    ? UNSAFE_PATTERNS.filter(p => !p.reason.includes('credential') && !p.reason.includes('token'))
    : UNSAFE_PATTERNS
  
  // Check against unsafe patterns
  for (const { pattern, reason } of patternsToCheck) {
    if (pattern.test(content)) {
      return { safe: false, reason }
    }
  }
  
  return { safe: true }
}

/**
 * Filter out unsafe posts from a collection
 */
export function filterSafePosts<T extends { excerpt: string }>(posts: T[]): T[] {
  return posts.filter(post => isSafeContent(post.excerpt).safe)
}
