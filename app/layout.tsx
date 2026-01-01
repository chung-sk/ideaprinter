import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import WebVitalsReporter from '@/components/common/WebVitalsReporter';
import Branding from '@/components/common/Branding';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'ideaprinter - Generate Unique App Ideas | powered by rytix.tech',
  description:
    'A retro-styled printer interface that generates unique app ideas addressing specific market gaps using AI. Powered by rytix.tech.',
  keywords: [
    'app ideas',
    'AI generator',
    'startup ideas',
    'market gaps',
    'Gemini AI',
    'idea generation',
    'ideaprinter',
    'rytix.tech',
  ],
  authors: [{ name: 'rytix.tech' }],
  metadataBase: new URL('https://ideaprinter.vercel.app'),
  openGraph: {
    title: 'ideaprinter - Generate Unique App Ideas',
    description:
      'Generate market-driven app ideas with our retro printer interface powered by rytix.tech',
    type: 'website',
    locale: 'en_US',
    siteName: 'ideaprinter',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ideaprinter - Retro AI-powered idea generator by rytix.tech',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ideaprinter - Generate Unique App Ideas',
    description:
      'Generate market-driven app ideas with our retro printer interface powered by rytix.tech',
    images: ['/og-image.png'],
    creator: '@rytixtech',
  },
  icons: {
    icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png', sizes: '32x32' }],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WebVitalsReporter />
        {/* Branding Header - centered to avoid session info */}
        <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Branding variant="header" />
        </header>
        {children}
      </body>
    </html>
  );
}
