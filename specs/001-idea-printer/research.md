# Research Document: Idea Printer

**Feature**: Idea Printer  
**Branch**: `001-idea-printer`  
**Date**: December 23, 2025  
**Status**: Complete

## Purpose

This document resolves all technical uncertainties identified in [plan.md](plan.md) Technical Context section. Each decision is based on project requirements: Next.js 14+ web application, retro printer animations, AI idea generation with 5-second limit, 100 concurrent user target, and mobile-responsive design.

---

## Decision 1: Animation Library

**Decision**: Framer Motion

**Rationale**:
- **Native React integration**: Seamlessly works with Next.js 14+ and React Server Components
- **Declarative API**: Fits React's component model perfectly, making animations maintainable
- **Sequential animations**: Built-in support for `variants` and `transition` orchestration, ideal for paper feed effects
- **Performance**: Uses GPU acceleration and automatically optimizes animations
- **Mobile-responsive**: Handles touch gestures and reduced motion preferences out of the box
- **TypeScript support**: First-class TypeScript definitions
- **Free and MIT licensed**: No licensing concerns for commercial use

**Alternatives Considered**:
- **React Spring**: Physics-based animations are excellent but overkill for retro printer effects. More complex API for simple sequential animations. Better suited for natural motion like springs/gravity
- **GSAP**: Most powerful and best raw performance, but requires GreenSock license for commercial use ($99+/year). Imperative API doesn't align with React's declarative approach. Better for complex timeline-based animations or canvas work

**Implementation Notes**:
- Create animation variants for paper feed sequence
- Use `initial`, `animate`, `exit` props for printer state transitions
- Leverage `layoutId` for shared element transitions between states
- Configure `prefersReducedMotion` accessibility support

---

## Decision 2: Backend Storage

**Decision**: PostgreSQL (via Vercel Postgres or Supabase)

**Rationale**:
- **Security-first**: User credentials and API keys require ACID compliance and row-level security
- **Structured data model**: Clear relationships between users, API keys, generation history, and usage limits
- **Scalability**: Handles 100+ concurrent users with connection pooling
- **Prisma ORM integration**: Type-safe database queries with excellent Next.js support
- **Backup and recovery**: Built-in WAL and point-in-time recovery
- **Query performance**: Indexed lookups for user authentication are faster than document scanning
- **Cost-effective**: Vercel Postgres free tier covers initial needs; predictable pricing

**Alternatives Considered**:
- **MongoDB**: Good for unstructured data, but idea generations and user credentials are highly structured. Lack of JOIN support makes relational queries (user → generations → usage stats) cumbersome. Weaker consistency guarantees for sensitive credential data
- **File-based storage**: Simple for prototypes but fails at scale. No concurrent access handling, no query optimization, security risks with file permissions, no backup strategy, and completely unsuitable for 100 concurrent users

**Implementation Notes**:
- Initialize Prisma with PostgreSQL schema (users, api_keys, generations tables)
- Encrypt API keys at rest using `crypto` module
- Set up connection pooling for serverless functions
- Configure row-level security for multi-tenant data isolation

---

## Decision 3: API Route Testing

**Decision**: Vitest + MSW (Mock Service Worker)

**Rationale**:
- **Speed**: 5-10x faster than Jest due to native ESM and Vite architecture
- **Next.js 14+ compatibility**: Native ESM support matches Next.js App Router
- **Jest-compatible API**: Drop-in replacement, minimal learning curve
- **MSW integration**: Mock Gemini API calls at the network level (more realistic than mocking fetch)
- **TypeScript-first**: Better type inference than Jest
- **Watch mode**: Instant feedback during development
- **Component + API testing**: Single framework for both unit and integration tests

**Alternatives Considered**:
- **Jest + node-mocks-http**: Traditional choice but slow startup times (20-30s for large projects). ESM support still experimental in Jest 29. Requires more boilerplate for API route testing
- **Playwright/Cypress for API routes**: Overkill for unit testing API routes. Better suited for E2E testing the full user flow. Slower execution and harder to debug isolated API logic

**Implementation Notes**:
- Set up Vitest config with Next.js resolver
- Create MSW handlers for Gemini API endpoints
- Write integration tests for `/api/generate-idea` route
- Maintain 80% code coverage target for business logic

---

## Decision 4: Deployment Platform

**Decision**: Vercel

**Rationale**:
- **Next.js optimization**: Built by the Next.js team, best-in-class support for App Router, Server Actions, and streaming
- **Edge Network**: Automatic CDN and edge caching for global performance
- **Built-in database**: Vercel Postgres and KV (Redis) with zero-config integration
- **Preview deployments**: Every PR gets a unique URL for testing
- **Monitoring**: Built-in Web Vitals, function logs, and error tracking
- **Free tier**: 100 GB-hours compute covers 100 concurrent users easily
- **5-second timeout**: Edge Functions support up to 25-second execution (Free tier supports Gemini's streaming)
- **Zero configuration**: Environment variables, HTTPS, and domain management included

**Alternatives Considered**:
- **Netlify**: Good for static sites but limited Next.js support (especially ISR and middleware). Functions have 10-second timeout on free tier (problematic for AI generation). Netlify Edge Functions are more limited than Vercel's
- **Custom deployment (AWS/GCP/Railway)**: More control but significantly more maintenance. Need to configure: load balancing, SSL, CDN, logging, monitoring, auto-scaling, and database. Higher ops burden for a small project. Cost unpredictability with AWS. Better suited for multi-service architectures or specific compliance needs

**Implementation Notes**:
- Configure Vercel project with environment variables for Gemini API
- Set up preview deployments for PR testing
- Enable Web Vitals monitoring for performance tracking
- Configure Edge Config for feature flags if needed

---

## Additional Research: Best Practices

### Gemini 2.0 Flash Integration

**Key Considerations**:
- Use streaming responses for perceived performance (show ideas as they generate)
- Implement retry logic with exponential backoff for API failures
- Structure prompts to consistently return the required format (app name, category, concept, gap, fix)
- Set temperature and top_p parameters for creative but coherent ideas
- Implement content filtering for inappropriate responses

**Prompt Engineering**:
```
System: You are a creative app idea generator that identifies market gaps.

User: Generate a unique app idea addressing a real market gap.

Format:
- APP NAME: [memorable name]
- CATEGORY: [market segment]
- CONCEPT: [one-sentence description]
- THE GAP: [problem being solved]
- THE FIX: [solution approach]
```

### Security Considerations

**API Key Storage**:
- User-provided keys: Encrypt with AES-256 before storing in PostgreSQL
- Default keys: Store in Vercel environment variables (never in code)
- Implement rate limiting per user/API key to prevent abuse
- Log generation requests for monitoring and troubleshooting

**CORS and CSP**:
- Configure Content Security Policy headers in Next.js middleware
- Restrict API routes to same-origin requests
- Implement CSRF protection for state-changing operations

### Performance Optimization

**Bundle Size**:
- Code-split Framer Motion animations (lazy load on interaction)
- Use Next.js Image component for optimized assets
- Tree-shake unused Gemini SDK methods
- Target < 500KB gzipped for initial bundle

**Caching Strategy**:
- Cache generated ideas client-side (localStorage) for offline viewing
- Use SWR or React Query for API request deduplication
- Implement stale-while-revalidate for non-critical data
- Set Cache-Control headers for static assets (fonts, images)

---

## Summary

All technical uncertainties resolved. Recommended stack:

| Category | Technology | Justification |
|----------|-----------|---------------|
| Animation | Framer Motion | React-native, declarative, performance-optimized |
| Database | PostgreSQL (Vercel) | Security, scalability, type-safety with Prisma |
| Testing | Vitest + MSW | Speed, ESM support, network-level mocking |
| Deployment | Vercel | Next.js optimization, zero-config, generous free tier |

**Next Phase**: Proceed to Phase 1 (data model, contracts, quickstart)
