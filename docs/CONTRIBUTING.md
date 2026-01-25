# Contributing to Idea Printer

Thank you for your interest in contributing to Idea Printer! This document provides guidelines for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Style](#code-style)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Security](#security)

## Code of Conduct

This project follows a code of conduct that promotes respect, inclusivity, and professional behavior. Please be kind and considerate in all interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ideaprinter.git
   cd ideaprinter
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/ideaprinter.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- Google Gemini API key (get from [Google AI Studio](https://aistudio.google.com/))

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Add your Gemini API key to `.env.local`:

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
ideaprinter/
├── app/                  # Next.js App Router pages
│   ├── api/             # API routes
│   ├── config/          # Configuration page
│   ├── share/           # Share page
│   └── layout.tsx       # Root layout
├── components/          # React components
│   ├── common/          # Shared components
│   ├── printer/         # Printer-specific components
│   └── config/          # Configuration components
├── lib/                 # Utility libraries
│   ├── gemini/         # Gemini AI client
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── public/             # Static assets
└── specs/              # Project specifications
```

## Development Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-name` - Bug fixes
- `docs/doc-name` - Documentation updates
- `refactor/refactor-name` - Code refactoring
- `test/test-name` - Test additions

### Before Starting Work

1. Sync with upstream:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

- Place test files next to the code they test: `component.tsx` → `component.test.tsx`
- Use descriptive test names that explain the behavior being tested
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies (API calls, localStorage, etc.)

Example:

```typescript
describe('IdeaPrintout', () => {
  it('should render idea with all fields', () => {
    // Arrange
    const idea = { /* mock idea */ };

    // Act
    render(<IdeaPrintout idea={idea} />);

    // Assert
    expect(screen.getByText(idea.appName)).toBeInTheDocument();
  });
});
```

## Code Style

### TypeScript

- Use strict TypeScript mode
- Define explicit types for all function parameters and return values
- Avoid `any` type - use `unknown` when type is truly unknown
- Use interfaces for object shapes, types for unions/intersections

### React

- Use functional components with hooks
- Follow React hooks rules (no conditional hooks)
- Use descriptive component names in PascalCase
- Prop drilling max 2 levels - use context for deeper state

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Use semantic HTML elements
- Ensure WCAG 2.1 AA accessibility compliance

### Naming Conventions

- Files: `camelCase.tsx`, `PascalCase.tsx` (components)
- Functions: `camelCase`
- Components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Test additions or updates
- `chore`: Build process or tooling changes

### Examples

```
feat(printer): add sound effects to printing animation

Add Web Audio API-based sound effects for paper feed, printing, and completion events.
Respects prefers-reduced-motion accessibility setting.

Closes #42
```

```
fix(api): handle timeout errors in idea generation

Add 5-second timeout to Gemini API calls to prevent hanging requests.
Return 504 Gateway Timeout error to client.

Fixes #58
```

## Pull Request Process

1. **Update your branch** with latest upstream changes:

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run checks locally**:

   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

3. **Push your branch**:

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create Pull Request**:
   - Use a clear, descriptive title
   - Reference related issues
   - Provide detailed description of changes
   - Include screenshots for UI changes
   - List any breaking changes

5. **Address review feedback**:
   - Make requested changes
   - Push updates to your branch
   - Respond to comments
   - Mark conversations as resolved

6. **Merge requirements**:
   - All CI checks passing
   - At least one approving review
   - No merge conflicts
   - Branch is up-to-date with main

## Security

### Reporting Security Issues

**DO NOT** create public GitHub issues for security vulnerabilities.

Instead, email security concerns to: [security@example.com]

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Security Best Practices

- Never commit API keys or secrets
- Use environment variables for sensitive data
- Validate all user inputs server-side
- Sanitize user-generated content
- Use HTTPS in production
- Keep dependencies updated
- Follow OWASP security guidelines

## Questions?

- Check existing issues and discussions
- Ask in GitHub Discussions
- Review project documentation in `/specs`

Thank you for contributing! 🎉
