# Implementation Plan: Idea Printer

**Branch**: `001-idea-printer` | **Date**: December 23, 2025 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-idea-printer/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

The Idea Printer is a web application that generates unique, market-driven app ideas using AI. Users interact with a retro-styled printer interface that produces structured idea printouts containing: app name, category, concept, the gap (problem), and the fix (solution). The system must generate ideas within 5 seconds and support optional user-provided API credentials for customization.

## Technical Context

**Language/Version**: TypeScript/JavaScript (ES2022), Next.js 14+  
**Primary Dependencies**: Next.js (React framework), Google Gemini AI SDK (2.0 Flash for idea generation), Framer Motion (animations)  
**Storage**: Browser localStorage (persistent) and sessionStorage (temporary) - no backend database required  
**Testing**: Vitest + MSW (API mocking), React Testing Library (components), Playwright (E2E)  
**Target Platform**: Web browsers (desktop and mobile), deployed on Vercel serverless
**Project Type**: Web (Next.js full-stack with frontend + API routes)  
**Performance Goals**: AI idea generation < 5 seconds, page load First Contentful Paint < 1.5s, UI interactions < 100ms  
**Constraints**: 5-second generation time limit, mobile-responsive design, secure credential storage (Web Crypto API), graceful error handling  
**Scale/Scope**: Initially MVP with core generation feature, ~5-10 pages/components, single-user device-specific storage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gates (Phase 0)

- [x] **Code Quality Standards Defined**: Linting (ESLint), formatting (Prettier), TypeScript strict mode configuration planned
- [x] **Testing Strategy Outlined**: Vitest + MSW (unit/integration), React Testing Library (components), Playwright (E2E) framework identified
- [x] **UX Consistency Planned**: Retro printer aesthetic with Framer Motion animations, responsive breakpoints, accessibility requirements (WCAG 2.1 AA) documented
- [x] **Performance Targets Set**: 5-second generation limit, page load metrics (FCP < 1.5s, TTI < 3.5s), API response times defined

### Post-Design Gates (Phase 1)

- [x] **Code Quality Implementation**: ESLint + Prettier configs planned, pre-commit hooks (Husky) planned, TypeScript strict mode enabled
- [x] **Test Coverage Plan**: 80% coverage target for business logic, critical user journey E2E test identified (P1 story: idea generation flow)
- [x] **UX Design Deliverables**: Retro printer component structure defined, paper feed animation variants specified, error/loading states planned, mobile-first approach
- [x] **Performance Architecture**: Gemini API streaming responses, localStorage for data persistence (no database), Vercel Edge Network caching, bundle size < 500KB target
- [x] **Security Measures**: Web Crypto API (AES-GCM) encryption for API keys in localStorage, environment variables for default keys, HTTPS required

**Status**: ✅ COMPLETE - All constitution gates passed. Ready for implementation (Phase 2: `/speckit.tasks`).

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── api/
│   └── generate-idea/
│       └── route.ts         # API route for AI idea generation
├── layout.tsx               # Root layout with global styles
├── page.tsx                 # Home page with printer interface
└── globals.css              # Global styles including retro theme

components/
├── printer/
│   ├── PrinterInterface.tsx # Main retro printer UI component
│   ├── PrintButton.tsx      # Animated print button
│   ├── PaperOutput.tsx      # Paper feed animation component
│   └── IdeaPrintout.tsx     # Generated idea display (structured format)
├── config/
│   └── CredentialsForm.tsx  # User credential configuration UI
└── common/
    ├── ErrorMessage.tsx     # Reusable error display
    └── LoadingSpinner.tsx   # Loading state component

lib/
├── gemini/
│   ├── client.ts            # Gemini AI SDK client wrapper
│   └── prompts.ts           # Prompt templates for idea generation
├── storage/
│   └── localStorage.ts      # Helper for credential/history storage
└── types/
    └── idea.ts              # TypeScript types for Generated Idea entity

public/
├── assets/
│   └── printer-sounds/      # Optional: retro printer sound effects
└── fonts/                   # Retro-styled fonts for printer aesthetic

tests/
├── e2e/
│   └── idea-generation.spec.ts  # Playwright E2E for P1 user story
├── integration/
│   └── api/
│       └── generate-idea.test.ts  # API route integration tests
└── unit/
    ├── components/
    │   └── PrinterInterface.test.tsx
    └── lib/
        └── gemini/
            └── client.test.ts

__tests__/                   # Alternative test location (Jest convention)
```

**Structure Decision**: Next.js 14+ App Router structure selected. This is a web application with integrated frontend (React components) and backend (API routes in `app/api/`). The App Router provides file-based routing, server components, and API route co-location. All AI generation logic is handled server-side via API routes to secure API keys.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

---

## Planning Complete

### Deliverables

**Phase 0 (Research)**:
-  [research.md](research.md) - All technical decisions resolved (animation library, database, testing, deployment)

**Phase 1 (Design)**:
-  [data-model.md](data-model.md) - Three core entities with validation rules for localStorage storage
-  [contracts/api-spec.yaml](contracts/api-spec.yaml) - OpenAPI 3.1 specification with API endpoints
-  [quickstart.md](quickstart.md) - Developer setup guide with troubleshooting
-  Agent context updated (GitHub Copilot instructions)

### Technology Stack Summary

| Layer | Technology | Justification |
|-------|-----------|---------------|
| **Frontend** | Next.js 14+ App Router + React | Modern full-stack framework with server components |
| **UI/Animations** | Framer Motion | Declarative animations, React-native, accessibility support |
| **AI Generation** | Google Gemini 2.0 Flash | Fast, cost-effective, streaming responses |
| **Storage** | Browser localStorage + sessionStorage | Zero hosting costs, simple deployment, device-specific data |
| **Encryption** | Web Crypto API (AES-GCM) | Built-in browser encryption for API keys |
| **Testing** | Vitest + MSW + Playwright | Fast, modern, comprehensive coverage |
| **Deployment** | Vercel | Zero-config, Next.js optimization, generous free tier, no database costs |

### Next Steps

1. **Run /speckit.tasks** to generate implementation task list
2. **Initialize project**: Run commands from quickstart.md
3. **Implement Phase 2**: Follow task list for iterative development
4. **Validate Constitution**: Ensure all gates remain satisfied during implementation

### Key Metrics to Track

- Idea generation time (target: < 5 seconds)
- API response time (target: p95 < 500ms)
- Page load FCP (target: < 1.5s)
- Test coverage (target: > 80% for business logic)
- Bundle size (target: < 500KB gzipped)
- User retention (target: 60% week-over-week for 3+ ideas)

**Status**:  Ready for implementation
