# ideaprinter Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-12-23

## Active Technologies

- TypeScript 5.6 (Node.js >= 18.17) + Next.js 14.2 (App Router), React 18.3, TailwindCSS 3.4, framer-motion, lucide-react, qrcode.react (003-ui-redesign-responsive)
- No server database; client-side `localStorage` for history/config; cookies/session utilities for server-side session enforcement where applicable (003-ui-redesign-responsive)

- TypeScript, Next.js 14 (Node.js >= 18.17) + Next.js App Router, React 18, `@google/generative-ai`, `uuid` (001-session-branding)
- No database; browser storage exists for client preferences; server enforcement uses signed cookies (stateless) (001-session-branding)
- TypeScript 5.6, React 18.3, Next.js 14.2 (App Router) + `next`, `react`, `@google/generative-ai`, `vitest`, `@testing-library/react`, `msw`, `playwright` (001-multi-source-trends)

- TypeScript/JavaScript (ES2022), Next.js 14+ + Next.js (React framework), Google Gemini AI SDK (2.0 Flash for idea generation), React animation libraries (NEEDS CLARIFICATION: Framer Motion, React Spring, or GSAP?) (001-idea-printer)

## Project Structure

```text
app/
components/
lib/
tests/
```

## Commands

npm test; npm run lint; npm run type-check

## Code Style

TypeScript/JavaScript (ES2022), Next.js 14+: Follow standard conventions

## Recent Changes

- 003-ui-redesign-responsive: Added TypeScript 5.6 (Node.js >= 18.17) + Next.js 14.2 (App Router), React 18.3, TailwindCSS 3.4, framer-motion, lucide-react, qrcode.react

- 001-multi-source-trends: Added TypeScript 5.6, React 18.3, Next.js 14.2 (App Router) + `next`, `react`, `@google/generative-ai`, `vitest`, `@testing-library/react`, `msw`, `playwright`

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
