# Quickstart: Anonymous Session Limits & Branding

## Prerequisites

- Node.js >= 18.17
- npm >= 9

## Install

- `npm install`

## Environment variables

Add these to your local environment (e.g., `.env.local`) for development:

- `GEMINI_API_KEY`: default Gemini API key (existing)
- `SESSION_SECRET`: secret used to sign session/quota cookies (existing in `.env.example`; generate a long random string)

Example (PowerShell):

- `$env:SESSION_SECRET = "<long-random-secret>"`

## Run

- `npm run dev`

## Test

- Unit/integration: `npm test`
- E2E (critical flow): `npm run test:e2e`

## What to verify manually

- Refreshing the page keeps the same session identifier
- `POST /api/generate-idea` enforces per-session limits and returns a clear 429 message with retry timing
- Branding (logo + “ideaprinter” + “powered by rytix.tech”) is visible on primary screens at mobile + desktop sizes
