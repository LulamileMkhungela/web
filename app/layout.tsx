import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { BRAND, SITE_URL } from '@/lib/config';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Heritage Bites | Traditional African Restaurant & Takeaway in Pretoria Central',
    template: '%s | Heritage Bites',
  },
  description: BRAND.description,
  applicationName: 'Heritage Bites',
  keywords: [
    'Heritage Bites',
    'Pretoria restaurant',
    'Pretoria Central takeaway',
    'traditional African food',
    'mogodu',
    'samp and beans',
    'kota',
    'magwinya',
    'motogo wa mabele',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    siteName: 'Heritage Bites',
    title: 'Heritage Bites | A Taste of Heritage, Made With Love',
    description: BRAND.description,
    images: [{ url: '/images/menu/mogodu-1.webp', alt: 'Mogodu and samp at Heritage Bites' }],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#001938',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-ZA">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
