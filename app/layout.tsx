import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import WebVitalsReporter from '@/components/common/WebVitalsReporter';
import { AuthProvider } from '@/components/auth/AuthProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Idea Printer - Generate Unique App Ideas',
  description: 'A retro-styled printer interface that generates unique app ideas addressing specific market gaps using AI.',
  keywords: ['app ideas', 'AI generator', 'startup ideas', 'market gaps', 'Gemini AI', 'idea generation'],
  authors: [{ name: 'Idea Printer Team' }],
  metadataBase: new URL('https://ideaprinter.vercel.app'),
  openGraph: {
    title: 'Idea Printer - Generate Unique App Ideas',
    description: 'Generate market-driven app ideas with our retro printer interface powered by AI',
    type: 'website',
    locale: 'en_US',
    siteName: 'Idea Printer',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Idea Printer - Retro AI-powered idea generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Idea Printer - Generate Unique App Ideas',
    description: 'Generate market-driven app ideas with our retro printer interface',
    images: ['/og-image.png'],
    creator: '@ideaprinter',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180' },
    ],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WebVitalsReporter />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
