# Quickstart Guide: Idea Printer

**Feature**: Idea Printer  
**Branch**: `001-idea-printer`  
**Date**: December 23, 2025

## Overview

This guide provides step-by-step instructions for setting up and running the Idea Printer feature locally. It covers environment setup, dependency installation, database configuration, and running the application.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: Version 18.17 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Git**: For cloning the repository
- **Gemini API Key**: Get one from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Code Editor**: VS Code recommended with ESLint and Prettier extensions

---

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd ideaprinter

# Checkout the feature branch
git checkout 001-idea-printer

# Install dependencies
npm install
```

---

## Step 2: Environment Configuration

Create a `.env.local` file in the project root:

```bash
# .env.local

# Gemini AI Configuration (REQUIRED)
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration (Vercel Postgres)
# If using Vercel Postgres, run: vercel env pull .env.local
POSTGRES_URL="postgres://username:password@host:5432/database"
POSTGRES_PRISMA_URL="postgres://username:password@host:5432/database?pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://username:password@host:5432/database"

# Optional: Session Secret for authentication
SESSION_SECRET=your_random_secret_here_min_32_chars

# Optional: Rate Limiting
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW_MS=60000
```

**Note**: Never commit `.env.local` to version control. It's already in `.gitignore`.

---

## Step 3: Database Setup

Initialize the database with Prisma:

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Optional: Seed database with test data
npx prisma db seed
```

**Verify database connection**:

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to view your database.

---

## Step 4: Run Development Server

Start the Next.js development server:

```bash
npm run dev
```

The application will be available at:

- **Local**: http://localhost:3000
- **Network**: http://192.168.x.x:3000 (for mobile testing)

---

## Step 5: Verify Installation

### Test the Printer Interface

1. Navigate to http://localhost:3000
2. You should see the retro printer interface
3. Click the "Print Idea" button
4. Within 5 seconds, you should see an animated idea printout with:
   - App Name
   - Category
   - Concept
   - The Gap (problem)
   - The Fix (solution)

### Test API Endpoints

Using curl or Postman:

```bash
# Generate an idea
curl -X POST http://localhost:3000/api/generate-idea \
  -H "Content-Type: application/json" \
  -d '{"preferredCategory": "Travel"}'

# Get idea history (requires authentication)
curl http://localhost:3000/api/ideas/history?page=1&limit=20

# Get user configuration
curl http://localhost:3000/api/config
```

---

## Step 6: Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Check test coverage
npm run test:coverage
```

**Expected output**: All tests should pass with >80% coverage for business logic.

---

## Development Workflow

### Code Quality Checks

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run Prettier formatting
npm run format

# Type checking
npm run type-check
```

### Git Hooks (Pre-commit)

The project uses Husky for pre-commit hooks:

- Linting with ESLint
- Formatting with Prettier
- Type checking with TypeScript
- Running unit tests

If pre-commit checks fail, fix the issues before committing.

---

## Common Tasks

### Add a New Idea Category

1. Update `lib/types/idea.ts`:

   ```typescript
   export const IDEA_CATEGORIES = [
     'Technology',
     'Travel',
     'Finance', // ... existing
     'YourNewCategory', // Add here
   ] as const;
   ```

2. Update Prisma enum in `prisma/schema.prisma`:

   ```prisma
   enum Category {
     TECHNOLOGY
     TRAVEL
     // ... existing
     YOUR_NEW_CATEGORY // Add here
   }
   ```

3. Run migration:
   ```bash
   npx prisma migrate dev --name add-new-category
   ```

### Customize Printer Animation

Edit `components/printer/PrinterInterface.tsx`:

```typescript
const paperFeedVariants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.8 } },
  exit: { y: 100, opacity: 0, transition: { duration: 0.5 } },
};
```

### Change AI Prompt Template

Edit `lib/gemini/prompts.ts`:

```typescript
export const IDEA_GENERATION_PROMPT = `
You are a creative app idea generator...
[Modify the system prompt here]
`;
```

---

## Troubleshooting

### Issue: "Module not found" errors

**Solution**: Delete `node_modules` and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Database connection fails

**Solution**: Check your `POSTGRES_URL` in `.env.local`. Verify:

```bash
npx prisma db pull
```

### Issue: Gemini API key invalid

**Solution**: Verify your API key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate a new key if needed
3. Update `GEMINI_API_KEY` in `.env.local`
4. Restart the dev server

### Issue: Tests failing

**Solution**: Clear test cache:

```bash
npm run test:clear
npm test
```

### Issue: Port 3000 already in use

**Solution**: Use a different port:

```bash
PORT=3001 npm run dev
```

---

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub:

   ```bash
   git push origin 001-idea-printer
   ```

2. Connect repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Import Git Repository
   - Select `ideaprinter` repository

3. Configure environment variables in Vercel dashboard:
   - `GEMINI_API_KEY`
   - Database URLs (auto-configured if using Vercel Postgres)

4. Deploy:
   ```bash
   vercel --prod
   ```

### Deploy to Custom Server

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

**Server requirements**:

- Node.js 18+
- PostgreSQL database
- HTTPS enabled (required for secure cookie authentication)

---

## Performance Monitoring

### Enable Web Vitals Reporting

The application automatically tracks:

- First Contentful Paint (FCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

View metrics in Vercel dashboard or add custom reporting:

```typescript
// app/layout.tsx
export function reportWebVitals(metric) {
  console.log(metric);
  // Send to analytics service
}
```

### Monitor API Response Times

Check generation request durations in database:

```sql
SELECT AVG(duration_ms) as avg_duration,
       MAX(duration_ms) as max_duration,
       COUNT(*) as total_requests
FROM generation_requests
WHERE status = 'SUCCESS'
AND created_at > NOW() - INTERVAL '1 day';
```

---

## Additional Resources

- **API Documentation**: [contracts/api-spec.yaml](contracts/api-spec.yaml)
- **Data Model**: [data-model.md](data-model.md)
- **Research Decisions**: [research.md](research.md)
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Framer Motion Docs**: https://www.framer.com/motion

---

## Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review error logs in `logs/` directory
3. Open an issue in the repository with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

## Next Steps

After completing the quickstart:

1. Review the [specification](spec.md) for feature requirements
2. Check the [task list](tasks.md) for implementation phases (created via `/speckit.tasks`)
3. Run E2E tests to verify critical user journeys
4. Deploy to staging environment for testing

**Happy coding!** 🎉
