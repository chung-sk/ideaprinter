# Tasks: Idea Printer

**Input**: Design documents from `/specs/001-idea-printer/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api-spec.yaml ✅

**Tests**: Not explicitly requested in specification - focusing on implementation tasks only. Tests can be added later if TDD approach is preferred.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Using Next.js 14+ App Router structure as defined in plan.md:

- **App routes**: `app/` (pages and API routes)
- **Components**: `components/`
- **Libraries**: `lib/`
- **Tests**: `tests/` and `__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure per plan.md

- [x] T001 Initialize Next.js 14+ project with TypeScript and App Router in project root
- [x] T002 Install core dependencies: @google/generative-ai, framer-motion, @prisma/client
- [x] T003 [P] Configure ESLint with Next.js rules and Prettier in .eslintrc.json and .prettierrc
- [x] T004 [P] Configure TypeScript strict mode in tsconfig.json
- [x] T005 [P] Setup Husky pre-commit hooks for linting and formatting in .husky/
- [x] T006 Create global styles with retro printer theme variables in app/globals.css
- [x] T007 Create root layout with metadata and font configuration in app/layout.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Architecture Note**: Using localStorage instead of PostgreSQL database to avoid hosting costs (Clarification: 2025-12-23)

- [x] T008 ~~Initialize Prisma with PostgreSQL connection in prisma/schema.prisma~~ NOT APPLICABLE (using localStorage)
- [x] T009 ~~Create GeneratedIdea Prisma model per data-model.md in prisma/schema.prisma~~ NOT APPLICABLE (using localStorage)
- [x] T010 ~~Create UserConfiguration Prisma model per data-model.md in prisma/schema.prisma~~ NOT APPLICABLE (using localStorage)
- [x] T011 ~~Create GenerationRequest Prisma model per data-model.md in prisma/schema.prisma~~ NOT APPLICABLE (using localStorage)
- [x] T012 ~~Create RequestStatus and ApiKeySource enums in prisma/schema.prisma~~ NOT APPLICABLE (using localStorage)
- [x] T013 ~~Run initial Prisma migration to create database schema~~ NOT APPLICABLE (using localStorage)
- [x] T014 [P] Create TypeScript types for Generated Idea entity in lib/types/idea.ts
- [x] T015 [P] Create TypeScript types for User Configuration in lib/types/config.ts
- [x] T016 [P] Setup environment variables structure in .env.example
- [x] T017 [P] Create Gemini AI client wrapper with error handling in lib/gemini/client.ts
- [x] T018 [P] Create localStorage helper utilities in lib/utils/storage.ts
- [x] T019 [P] Create reusable ErrorMessage component in components/common/ErrorMessage.tsx
- [x] T020 [P] Create reusable LoadingSpinner component in components/common/LoadingSpinner.tsx
- [x] T021 [P] Create localStorage verification utility to test read/write operations in lib/utils/storage.ts
- [x] T022 [P] Create Web Crypto API encryption helper for API keys in lib/utils/encryption.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Generate Market-Driven App Idea (Priority: P1) 🎯 MVP

**Goal**: Users can generate unique app ideas with structured printout (name, category, concept, gap, fix) within 5 seconds

**Independent Test**: Open app, click generate, receive complete idea printout with all required fields within 5 seconds

### Implementation for User Story 1

- [x] T023 [P] [US1] Create idea generation prompt template in lib/gemini/prompts.ts
- [x] T024 [P] [US1] Implement unique ID generator (8-char alphanumeric) in lib/utils/idGenerator.ts
- [x] T025 [US1] Create POST /api/generate-idea route handler per contracts/api-spec.yaml in app/api/generate-idea/route.ts
- [x] T026 [US1] Implement Gemini API call with streaming in app/api/generate-idea/route.ts
- [x] T027 [US1] Add response parsing and validation for structured idea format in app/api/generate-idea/route.ts
- [x] T028 [US1] Implement localStorage storage for GenerationRequest and GeneratedIdea in components/printer/PrinterInterface.tsx
- [x] T029 [US1] Add error handling for API failures, timeouts, and validation errors in app/api/generate-idea/route.ts
- [x] T030 [US1] Implement 5-second timeout constraint in app/api/generate-idea/route.ts
- [x] T031 [P] [US1] Create IdeaPrintout component for displaying structured idea in components/printer/IdeaPrintout.tsx
- [x] T032 [P] [US1] Style IdeaPrintout with retro printout format (monospace font, paper texture) in components/printer/IdeaPrintout.tsx
- [x] T033 [P] [US1] Create PrintButton component with basic styling in components/printer/PrintButton.tsx
- [x] T034 [US1] Create basic PrinterInterface component structure in components/printer/PrinterInterface.tsx
- [x] T035 [US1] Implement API call to /api/generate-idea from PrinterInterface in components/printer/PrinterInterface.tsx
- [x] T036 [US1] Add loading state handling during generation in components/printer/PrinterInterface.tsx
- [x] T037 [US1] Add error state handling with ErrorMessage component in components/printer/PrinterInterface.tsx
- [x] T038 [US1] Display IdeaPrintout when generation completes in components/printer/PrinterInterface.tsx
- [x] T039 [US1] Create main page with PrinterInterface in app/page.tsx
- [x] T040 [US1] Add mobile-responsive layout for printer interface in app/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional - users can generate and view ideas

---

## Phase 4: User Story 2 - Experience Retro Printer Aesthetic (Priority: P2)

**Goal**: Enhance UI with retro printer animations, paper feed effects, and satisfying visual feedback

**Independent Test**: Generate an idea and observe smooth paper feed animation, printer sounds (optional), and retro visual effects

### Implementation for User Story 2

- [x] T039 [P] [US2] Define Framer Motion animation variants for paper feed in components/printer/animations.ts
- [x] T040 [P] [US2] Define animation variants for printer idle, printing, and complete states in components/printer/animations.ts
- [x] T041 [US2] Create PaperOutput component with paper feed animation in components/printer/PaperOutput.tsx
- [x] T042 [US2] Add Framer Motion AnimatePresence wrapper for enter/exit animations in components/printer/PaperOutput.tsx
- [x] T043 [US2] Style PaperOutput with paper texture, borders, and shadows in components/printer/PaperOutput.tsx
- [x] T044 [US2] Add typewriter effect animation for text reveal in components/printer/IdeaPrintout.tsx
- [x] T045 [US2] Integrate PaperOutput animation into PrinterInterface in components/printer/PrinterInterface.tsx
- [x] T046 [US2] Add printer body visual elements (paper tray, buttons, LCD display) in components/printer/PrinterInterface.tsx
- [x] T047 [US2] Add retro color scheme (beige, brown, monochrome green) in components/printer/PrinterInterface.tsx
- [x] T047a [US2] Update printer color scheme to Red & Dark Grey (Memo-Rite aesthetic) in components/printer/PrinterInterface.tsx
- [x] T048 [US2] Enhance PrintButton with hover effects and click animation in components/printer/PrintButton.tsx
- [x] T048a [US2] Add Shuffle button (randomize inputs) in components/printer/PrinterInterface.tsx
- [x] T048b [US2] Add Trash button (clear/reset) in components/printer/PrinterInterface.tsx
- [x] T048c [US2] Implement Shuffle logic (randomize category) in components/printer/PrinterInterface.tsx
- [x] T048d [US2] Implement Trash logic (clear state) in components/printer/PrinterInterface.tsx
- [x] T049 [US2] Add dot-matrix or thermal printer font styling in app/globals.css
- [x] T031a [US1] Add QR Code to IdeaPrintout with encoded URL in components/printer/IdeaPrintout.tsx
- [x] T050 [P] [US2] Add optional printer sound effects (paper feed, printing) in public/assets/printer-sounds/
- [x] T051 [US2] Integrate sound effects with animation triggers (if sounds added) in components/printer/PrinterInterface.tsx
- [x] T052 [US2] Add accessibility support for prefers-reduced-motion in components/printer/animations.ts
- [x] T053 [US2] Optimize animations for mobile devices (reduce complexity) in components/printer/PrinterInterface.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - users get animated, delightful experience

---

## Phase 5: User Story 3 - Configure Generation Parameters (Priority: P3)

**Goal**: Allow users to provide their own Gemini API key and manage configuration preferences

**Independent Test**: Add custom API key, verify it's used for generation, clear it and verify fallback to default

### Implementation for User Story 3

- [x] T054 [P] [US3] Create GET /api/config route handler per contracts/api-spec.yaml in app/api/config/route.ts
- [x] T055 [P] [US3] Create PUT /api/config route handler per contracts/api-spec.yaml in app/api/config/route.ts
- [x] T056 [US3] Implement AES-256 encryption helper for API keys in lib/utils/encryption.ts (already existed)
- [x] T057 [US3] Add localStorage query for user configuration retrieval in app/api/config/route.ts (adapted for localStorage)
- [x] T058 [US3] Add localStorage save for user configuration updates in app/api/config/route.ts (adapted for localStorage)
- [x] T059 [US3] Add API key format validation (Gemini key pattern) in app/api/config/route.ts
- [x] T060 [P] [US3] Create CredentialsForm component structure in components/config/CredentialsForm.tsx
- [x] T061 [US3] Add form fields for Gemini API key input (password type) in components/config/CredentialsForm.tsx
- [x] T062 [US3] Add form fields for preferred categories (multi-select) in components/config/CredentialsForm.tsx
- [x] T063 [US3] Implement form submission to PUT /api/config in components/config/CredentialsForm.tsx
- [x] T064 [US3] Add form validation and error display in components/config/CredentialsForm.tsx
- [x] T065 [US3] Add clear/reset functionality to remove custom API key in components/config/CredentialsForm.tsx
- [x] T066 [US3] Add visual feedback for successful configuration save in components/config/CredentialsForm.tsx
- [x] T067 [US3] Update /api/generate-idea to check for user-provided API key in components/printer/PrinterInterface.tsx
- [x] T068 [US3] Implement API key selection logic (user key vs default) in components/printer/PrinterInterface.tsx
- [x] T069 [US3] Create configuration page for CredentialsForm in app/config/page.tsx
- [x] T070 [US3] Add navigation to configuration page from main interface in components/printer/PrinterInterface.tsx
- [x] T071 [US3] Store configuration preferences in localStorage for offline access in components/config/CredentialsForm.tsx

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Features that span multiple user stories and final optimizations

- [x] T072 [P] Create GET /api/ideas/history route handler per contracts/api-spec.yaml in app/api/ideas/history/route.ts
- [x] T073 [P] Implement pagination for idea history in app/api/ideas/history/route.ts
- [x] T074 [P] Create GET /api/ideas/[ideaId] route handler per contracts/api-spec.yaml in app/api/ideas/[ideaId]/route.ts
- [x] T075 [P] Create DELETE /api/ideas/[ideaId] route handler (soft delete) per contracts/api-spec.yaml in app/api/ideas/[ideaId]/route.ts
- [x] T076 [P] Add rate limiting middleware to prevent abuse in middleware.ts
- [x] T077 [P] Implement session management for user tracking in lib/auth/session.ts
- [x] T078 [P] Add save/export functionality for generated ideas (download as text/JSON) in components/printer/IdeaPrintout.tsx
- [x] T079 [P] Add copy to clipboard functionality for idea text in components/printer/IdeaPrintout.tsx
- [x] T080 [P] Create history view component to display past ideas in components/history/IdeaHistory.tsx
- [x] T081 [P] Add filter by category in history view in components/history/IdeaHistory.tsx
- [x] T082 [P] Implement idea uniqueness check (prevent duplicates in session) in app/api/generate-idea/route.ts
- [x] T083 [P] Add OpenGraph and Twitter Card meta tags for sharing in app/layout.tsx
- [x] T084 [P] Create favicon and PWA icons in public/
- [x] T085 [P] Add Web Vitals reporting configuration in app/layout.tsx
- [x] T086 [P] Implement error boundary for React error handling in app/error.tsx
- [x] T087 [P] Create 404 not found page in app/not-found.tsx
- [x] T088 Optimize bundle size (code splitting, lazy loading) in next.config.js
- [x] T089 Add image optimization config for retro assets in next.config.js
- [x] T090 Configure caching headers for static assets in next.config.js
- [x] T091 Add Content Security Policy headers in middleware.ts
- [x] T092 Implement logging for generation requests in lib/logging/logger.ts
- [x] T093 Add monitoring for performance metrics in lib/monitoring/metrics.ts
- [x] T094 Create README.md with project overview and setup instructions
- [x] T095 Update .gitignore for Next.js, Prisma, and environment files
- [x] T096 Create deployment configuration for Vercel in vercel.json
- [x] T097 Document API endpoints in API_DOCS.md (reference to contracts/api-spec.yaml)
- [x] T098 Create CONTRIBUTING.md with development guidelines
- [x] T099 Final mobile responsiveness check across all breakpoints
- [x] T100 Final accessibility audit (WCAG 2.1 AA compliance)

---

## Dependencies & Parallel Execution

### User Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational) → MUST COMPLETE BEFORE USER STORIES
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ↓                                             ↓
              Phase 3 (US1) 🎯 MVP                        Phase 4 (US2) [Can start]
              Generate Ideas                              Retro Animations
                    ↓                                             ↓
                    └─────────────────────┬─────────────────────┘
                                          ↓
                                   Phase 5 (US3)
                                   Configuration
                                          ↓
                                   Phase 6 (Polish)
                                   Cross-cutting features
```

### MVP Delivery Strategy

**Minimal Viable Product** = Phase 1 + Phase 2 + Phase 3 (User Story 1)

This delivers core value: AI-powered idea generation with structured printout.

**Enhanced Experience** = MVP + Phase 4 (User Story 2)

Adds delightful retro printer aesthetic and animations.

**Full Feature Set** = Enhanced + Phase 5 (User Story 3) + Phase 6 (Polish)

Adds customization, configuration, and production-ready polish.

### Parallel Execution Examples

**Phase 2 Foundational** - Can be parallelized:

- Group A: T008-T013 (Database schema)
- Group B: T014-T015 (TypeScript types)
- Group C: T016-T018 (Utilities)
- Group D: T019-T020 (Common components)

**Phase 3 User Story 1** - Can be parallelized:

- Group A: T021-T022 (Prompt & ID generation)
- Group B: T029-T031 (UI components)
- After T023-T028 complete (API route): T032-T038 (Integration)

**Phase 4 User Story 2** - Can be parallelized:

- Group A: T039-T040 (Animation definitions)
- Group B: T041-T043 (PaperOutput component)
- Group C: T048-T049 (Button & styles)
- Group D: T050 (Sound effects - optional)

**Phase 5 User Story 3** - Can be parallelized:

- Group A: T054-T059 (API routes)
- Group B: T056 (Encryption utility)
- Group C: T060-T066 (Form component)

**Phase 6 Polish** - Most tasks marked [P] can run in parallel

---

## Implementation Strategy

### Incremental Delivery

1. **Week 1**: Phase 1 + Phase 2 (Foundation)
2. **Week 2**: Phase 3 (User Story 1 - MVP) 🎯
3. **Week 3**: Phase 4 (User Story 2 - Enhanced UX)
4. **Week 4**: Phase 5 (User Story 3 - Configuration) + Phase 6 (Polish)

### Testing Strategy (Optional - Add if TDD Preferred)

If implementing tests, add before each user story phase:

- Contract tests for API endpoints (Vitest + MSW)
- Component tests for React components (React Testing Library)
- E2E test for critical user journey (Playwright)

Example test tasks that could be added:

```
- [ ] T###[P] [US1] Contract test for POST /api/generate-idea in tests/integration/api/generate-idea.test.ts
- [ ] T###[P] [US1] Component test for PrinterInterface in __tests__/components/printer/PrinterInterface.test.tsx
- [ ] T###[P] [US1] E2E test for idea generation flow in tests/e2e/idea-generation.spec.ts
```

### Code Quality Checkpoints

After each phase, verify:

- [ ] All TypeScript errors resolved
- [ ] ESLint passes with no warnings
- [ ] Prettier formatting applied
- [ ] No console errors in browser
- [ ] Mobile responsive on 3 breakpoints (mobile, tablet, desktop)
- [ ] Accessibility: keyboard navigation works, screen reader compatible

---

## Task Count Summary

- **Phase 1 (Setup)**: 7 tasks
- **Phase 2 (Foundational)**: 13 tasks
- **Phase 3 (User Story 1)**: 18 tasks
- **Phase 4 (User Story 2)**: 15 tasks
- **Phase 5 (User Story 3)**: 18 tasks
- **Phase 6 (Polish)**: 29 tasks

**Total**: 100 tasks

**Parallel Opportunities**: 42 tasks marked [P] can run in parallel when dependencies are met

**MVP Scope**: Tasks T001-T038 (38 tasks = Phase 1 + 2 + 3)

---

## Validation Checklist

Format validation - ALL tasks follow required format:

- [x] Every task has checkbox `- [ ]`
- [x] Every task has sequential Task ID (T001, T002, etc.)
- [x] User story tasks have [Story] label ([US1], [US2], [US3])
- [x] Parallelizable tasks have [P] marker
- [x] Every task has specific file path in description
- [x] Tasks organized by user story phases
- [x] Each phase has independent test criteria
- [x] Dependencies section shows completion order
- [x] Parallel execution examples provided
- [x] MVP scope clearly identified (Phase 3 = User Story 1)
