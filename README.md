# Idea Printer 🖨️

> Generate unique, market-driven app ideas with a retro printer interface powered by AI

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0%20Flash-orange)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 Overview

Idea Printer is a web application that generates unique, market-driven app ideas using Google's Gemini AI. Each idea includes:

- **App Name**: A memorable, catchy name
- **Category**: Market segment (Technology, Travel, Finance, etc.)
- **Concept**: One-sentence description
- **The Gap**: Clear problem statement
- **The Fix**: Solution explanation

The app features a delightful retro printer aesthetic with animations, sound effects, and shareable QR codes.

## ✨ Features

### Core Features

- **AI-Powered Generation**: Uses Gemini 2.0 Flash for fast (<5s) idea generation
- **Retro Printer Interface**: Memo-Rite style design with paper feed animations
- **Custom API Keys**: Bring your own Gemini API key for unlimited generations
- **Category Preferences**: Select up to 5 preferred categories
- **Shareable Ideas**: QR codes and export functionality (JSON/TXT)
- **Copy to Clipboard**: Quick sharing via clipboard
- **Encrypted Storage**: API keys stored securely using AES-256-GCM

### User Experience

- **Sound Effects**: Optional printer sounds (paper feed, printing, complete)
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: Respects prefers-reduced-motion and keyboard navigation
- **Offline Support**: PWA-ready with local storage

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

   Edit `.env.local` and add your Gemini API key:

   ```env
   GEMINI_API_KEY=your_api_key_here
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
│   │   └── generate-idea/  # Idea generation endpoint
│   ├── config/             # Configuration page
│   ├── share/              # Share page for QR codes
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Home page
│   ├── error.tsx           # Error boundary
│   ├── not-found.tsx       # 404 page
│   └── globals.css         # Global styles
├── components/             # React components
│   ├── common/            # Reusable components
│   ├── config/            # Configuration components
│   └── printer/           # Printer interface components
├── lib/                   # Utilities and libraries
│   ├── gemini/           # Gemini AI client
│   ├── types/            # TypeScript types
│   └── utils/            # Helper functions
├── public/               # Static assets
│   ├── assets/          # Printer sounds, icons
│   └── manifest.json    # PWA manifest
└── specs/               # Feature specifications
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
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
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

## � Additional Documentation

- **[API Documentation](API_DOCS.md)**: Complete API reference with examples
- **[Contributing Guide](CONTRIBUTING.md)**: Development setup and guidelines
- **[Deployment Guide](DEPLOYMENT.md)**: Step-by-step deployment instructions
- **[Project Summary](PROJECT_SUMMARY.md)**: Complete project overview and status
- **[Audit Report](AUDIT_REPORT.md)**: Accessibility and responsiveness audit results

## 🗺️ Roadmap

- [x] User accounts and cloud sync (localStorage implementation)
- [x] Idea history with search and filtering (✅ Completed)
- [x] Rate limiting for fair usage (✅ Completed)
- [ ] More AI models (Claude, GPT-4, etc.)
- [ ] Collaborative idea refinement
- [ ] Export to PDF with custom designs
- [ ] Browser extension

---

**Made with ❤️ and AI** | [ideaprinter.app](https://ideaprinter.app)
