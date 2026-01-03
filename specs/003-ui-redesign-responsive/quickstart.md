# Quickstart: Responsive UI Redesign

This quickstart covers how to run the app and validate the responsive UI redesign feature.

## Prereqs

- Node.js >= 18.17
- npm >= 9

## Run locally

- Install: `npm install`
- Dev server: `npm run dev`
- Open: `http://localhost:3000`

## Manual validation checklist (matches `spec.md`)

### Core flow (P1)

- On mobile width (320–430px): configure → generate idea → view output
- On desktop width (1024–1440px): same flow
- Confirm:
  - no horizontal scrolling on primary pages
  - primary actions are visible and usable

### Touch targets (FR-004)

- On a mobile viewport (~390×844): ensure primary actions and key controls are at least 44×44px.

### Viewport switching (P2)

- Start typing in config, rotate/resize, confirm inputs persist.

### Share reliability (P2)

- Create an idea, generate a share link (or QR) and open `/share?data=...`.
- Also open `/share` without data.
- Confirm:
  - page never renders blank
  - valid payload renders idea
  - invalid/missing payload renders a friendly actionable state

## Automated tests

- Unit/integration: `npm test`
- Coverage: `npm run test:coverage`
- E2E (Playwright): `npm run test:e2e`

## Notes

- Some API routes validate requests but the app persists history/config client-side in `localStorage`.
- If you see dev-only chunking/HMR runtime errors, confirm custom webpack chunking remains production-only.
