# Quickstart: Idea Printer

This quickstart is intended to stay consistent with the repository README and provides the minimum steps to run the app locally.

## Prerequisites

- Node.js >= 18.17
- npm >= 9
- A Gemini API key (Google AI Studio)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local env file:

   ```bash
   cp .env.example .env.local
   ```

3. Configure required environment variables in `.env.local`:
   - `GEMINI_API_KEY` (required)
   - `NEXT_PUBLIC_SITE_ORIGIN` (recommended for correct share URLs)

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Next Docs

- `docs/PROJECT_SUMMARY.md`
- `docs/DEPLOYMENT.md`
- `docs/API_DOCS.md`
