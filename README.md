# Idea Printer 🖨️

> Generate unique, market-driven app ideas with a retro printer interface powered by AI

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-orange)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Status**: ✅ 100% Complete / Production Ready | **Last Updated**: 2026-02-02

## 🎯 Overview

Idea Printer is a web application that generates unique, market-driven app ideas using Google's Gemini AI. Each idea includes:

- **App Name**: A memorable, catchy name
- **Category**: Market segment (Technology, Travel, Finance, etc.)
- **Concept**: One-sentence description
- **The Gap**: Clear problem statement
- **The Fix**: Solution explanation

The app features a delightful retro printer aesthetic with animations, sound effects, and shareable QR codes.

## 📊 Project Status

**✅ 100% Complete & Production Ready**

| Metric | Status | Details |
|--------|--------|---------|
| **Core Features** | ✅ 100% | All 100 planned tasks completed |
| **Build Status** | ✅ Passing | Zero ESLint errors, TypeScript strict mode |
| **Code Quality** | ✅ Excellent | Clean architecture, type-safe, well-documented |
| **Accessibility** | ✅ WCAG 2.1 AA | Full keyboard navigation, screen reader support |
| **Performance** | ✅ Optimized | FCP 256ms, LCP 256ms, code splitting enabled |
| **Security** | ✅ Hardened | CSP headers, rate limiting, AES-256-GCM encryption |
| **Documentation** | ✅ Complete | 6 comprehensive documentation files |
| **Deployment** | ✅ Ready | Vercel-optimized, environment configs set |

The project has evolved from a simple idea generator to a comprehensive platform with trend-based generation, async job processing, and history management. See [docs/PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md) for the complete feature list.

## 🎬 Demo

Watch the app in action:

[https://github.com/user-attachments/assets/55ec3f5f-3c11-4cfb-8365-57f2ace67508](https://github.com/user-attachments/assets/c3474ab7-3cdd-4f2f-92d9-098ba9ef992c)

## 🆕 Recent Updates

For the full shipped feature list and technical details, see [docs/PROJECT_SUMMARY.md](docs/PROJECT_SUMMARY.md).

- **Trend-Based Generation (2026-01)**: Implemented async job pipeline for HackerNews, RSS Bundle, and X/Twitter trend sources. Privacy-first metadata-only storage with intelligent deduplication. Ideas now include "Gap Candidates" and "Signals Used" provenance tracking.
- **Trend Sync Bug Fix (2026-01-04)**: Fixed critical bug where trend refresh didn't update cached posts when history exists. Refactored deduplication logic to properly prioritize new content over cached entries, added comprehensive unit test coverage (15/15 tests passing), and verified fix with automated browser testing showing proper merge behavior (30→37 posts after refresh).
- **Responsive UI Redesign (2026-01-03)**: Completed comprehensive mobile/desktop responsive implementation with 44px+ touch targets, zero horizontal overflow, improved error handling on share page, and enhanced focus states for accessibility (WCAG 2.1 AA compliant)
- **Test Coverage**: Added comprehensive E2E and unit tests with >80% coverage, including accessibility testing with axe-core
- **Idea History**: Browse, sort, search, and manage previously generated ideas with full keyboard navigation
- **Sharing & Export**: QR code generation with reliable error handling, copy/export flows, and dedicated share page with loading states
- **Security & Performance**: Rate limiting, CSP headers, optimized delivery with excellent Web Vitals (FCP 256ms, LCP 256ms)

## ✨ Features

### Core Functionality

- **AI-Powered Idea Generation**: Generate ideas via Google Gemini 2.0 Flash
- **Random Mode**: Generate ideas based on selected or random categories
- **Trend-Based Generation**: Generate ideas inspired by real-time trends from HackerNews, ProductHunt, Reddit, and X/Twitter
- **Async Job Pipeline**: Long-running trend ingestion with polling status updates
- **QR Code Sharing**: Share ideas via a dedicated share page with compressed URL params

### User Experience

- **Retro Printer Aesthetic**: Animations and optional sound effects
- **Responsive + Accessible**: Keyboard navigation and reduced-motion support

### Configuration & Customization

- **Custom Gemini API Key Support**: Bring your own key (optional)
- **Encrypted Local Storage**: API keys stored securely (AES-256-GCM)
- **Category Preferences**: Select up to 5 preferred categories
- **Trend Source Selection**: Choose from HackerNews, RSS Bundle, or X/Twitter
- **X/Twitter Integration**: Bring your own bearer token for custom trend queries

### History & Management

- **Idea History View**: Browse and manage previously generated ideas
- **Management Tools**: Search/filter, sorting, pagination, and soft delete
- **Provenance Tracking**: View source attribution for trend-based ideas
- **Statistics Dashboard**: Total ideas, monthly count, category distribution

### Performance & Optimization

- **Web Vitals Monitoring**: Client-side performance reporting
- **Optimized Delivery**: Code splitting and caching for fast loads

### Security

- **Content Security Policy (CSP)** and hardened headers
- **Rate Limiting** for fair usage protection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Gemini API key (get one at [Google AI Studio](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ideaprinter.git
   cd ideaprinter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your Gemini API key and site origin:

   ```env
   GEMINI_API_KEY=your_api_key_here
   NEXT_PUBLIC_SITE_ORIGIN=http://localhost:3000
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Generating Ideas

1. **Click the Print Button** on the main interface
2. **Wait 2-5 seconds** for the AI to generate your idea
3. **View your printout** with all the details

### Using Custom API Key

1. **Click the Settings icon** (⚙️) in the top-right corner
2. **Enter your Gemini API key** in the configuration form
3. **Select preferred categories** (optional, max 5)
4. **Click Save Configuration**

Your API key is encrypted and stored locally in your browser - it never leaves your device.

### Exporting Ideas

- **Copy to Clipboard**: Click the copy icon on any generated idea
- **Download as Text**: Click the download icon for a `.txt` file
- **Share via QR Code**: Scan the QR code at the bottom of the printout

## 🏗️ Project Structure

```
ideaprinter/
├── app/                      # Next.js 14 App Router
│   ├── api/                 # API routes
│   │   ├── config/         # Configuration endpoints
│   │   ├── generate-idea/  # Idea generation endpoint
│   │   ├── trends/         # Trend ingestion and polling
│   │   ├── ideas/          # History and CRUD endpoints
│   │   └── session/        # Session management
│   ├── config/             # Configuration page
│   ├── printer/            # Printer interface page
│   ├── history/            # History view page
│   ├── share/              # Share page for QR codes
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Landing page
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404 page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── common/            # Reusable components
│   ├── config/            # Configuration components
│   ├── landing/           # Landing page components
│   ├── history/           # History view components
│   └── printer/           # Printer interface components
├── lib/                   # Utilities and libraries
│   ├── auth/             # Session management
│   ├── gemini/           # Gemini AI client
│   ├── monitoring/       # Performance metrics
│   ├── trends/           # Trend source providers
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── docs/                 # Documentation
│   ├── API_DOCS.md      # API reference
│   ├── PROJECT_SUMMARY.md  # Complete project overview
│   └── AUDIT_REPORT.md  # Accessibility audit
├── public/               # Static assets
│   ├── assets/          # Printer sounds, icons
│   └── manifest.json    # PWA manifest
└── middleware.ts         # Rate limiting & CSP
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI**: [Google Gemini 2.0 Flash](https://ai.google.dev/)
- **Storage**: Browser localStorage with Web Crypto API encryption
- **Icons**: [Lucide React](https://lucide.dev/)
- **QR Codes**: [qrcode.react](https://github.com/zpao/qrcode.react)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Gemini AI API Key (required)
GEMINI_API_KEY=your_gemini_api_key_here

# Required for Production: Public site origin for share URLs
NEXT_PUBLIC_SITE_ORIGIN=https://ideaprinter.rytix.tech

# Optional: Override the default model
GEMINI_MODEL=gemini-2.5-flash
```

### Customization

#### Printer Colors

Edit `components/printer/PrinterInterface.tsx` to change the printer color scheme:

```tsx
className = 'bg-[#E63946]'; // Printer body color (currently red)
```

#### Categories

Edit `lib/types/idea.ts` to add/remove categories:

```typescript
export const IDEA_CATEGORIES = [
  'Technology',
  'Travel',
  // Add your categories here
] as const;
```

## 📝 Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint (passes with 0 errors)
npm run type-check   # Run TypeScript compiler
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository
   - Add environment variables
   - Deploy!

### Environment Variables in Production

Set these in your Vercel dashboard:

- `GEMINI_API_KEY`: Your Gemini API key
- `NEXT_PUBLIC_SITE_ORIGIN`: Your production domain

## 🔐 Security

- **API Key Encryption**: Uses AES-256-GCM with PBKDF2 key derivation
- **Client-Side Storage**: All sensitive data stored in browser, never on server
- **HTTPS Required**: Encryption only works over secure connections
- **No Database**: Zero server-side persistence of user data

## ♿ Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: ARIA labels and semantic HTML
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **Color Contrast**: WCAG 2.1 AA compliant

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for the powerful language model
- **Next.js team** for the amazing framework
- **Framer Motion** for smooth animations
- **Lucide** for beautiful icons

## 📮 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/ideaprinter/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ideaprinter/discussions)
- **Email**: support@ideaprinter.app

## 📚 Additional Documentation

- **[API Documentation](docs/API_DOCS.md)**: Complete API reference with examples
- **[Contributing Guide](docs/CONTRIBUTING.md)**: Development setup and guidelines
- **[Deployment Guide](docs/DEPLOYMENT.md)**: Step-by-step deployment instructions
- **[Project Summary](docs/PROJECT_SUMMARY.md)**: Complete project overview and status (100/100 tasks)
- **[Audit Report](docs/AUDIT_REPORT.md)**: Accessibility and responsiveness audit results

## 🗺️ Roadmap

### Completed ✅

- [x] **100/100 Core Tasks**: All foundational features complete
- [x] **Trend-Based Generation**: HackerNews, RSS Bundle, X/Twitter integration
- [x] **Accessibility Audit**: WCAG 2.1 AA compliance verified
- [x] **Responsive Design**: Mobile-first, 320px-2560px tested
- [x] **Security Hardening**: CSP headers, rate limiting, AES-256-GCM encryption
- [x] **Performance Optimization**: Web Vitals optimized (FCP 256ms, LCP 256ms)

### Future Enhancements

**High Priority:**
- [ ] Database backend (PostgreSQL + Prisma) for persistence and multi-device sync
- [ ] User authentication and account management
- [ ] Icon assets (favicon, OG image, PWA icons)
- [ ] Expand test coverage (unit + integration tests)

**Medium Priority:**
- [ ] PDF export format
- [ ] Advanced full-text search
- [ ] Collaborative features (teams, shared workspaces)
- [ ] Analytics dashboard

**Low Priority:**
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Third-party API for integrations
- [ ] Multi-language support (i18n)

---

**Made with ❤️ and AI** | [ideaprinter.app](https://ideaprinter.rytix.tech)
