import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Business AI - Multi-Agent Intelligence Platform',
  description: 'Analyze your entire business using specialized AI agents with access to real data from Mixpanel, Google Analytics, and more.',
  keywords: ['business intelligence', 'AI agents', 'analytics', 'data visualization'],
  authors: [{ name: 'Business AI Team' }],
  creator: 'Business AI',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: 'Business AI Platform',
    description: 'Multi-agent business intelligence powered by Claude',
    siteName: 'Business AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Business AI Platform',
    description: 'Multi-agent business intelligence powered by Claude',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Business AI',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1a1a1a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">
        {children}
      </body>
    </html>
  );
}
