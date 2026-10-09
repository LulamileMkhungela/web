import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name}: ${BRAND.tagline}`,
    short_name: BRAND.name,
    description: BRAND.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#F8F4EC',
    theme_color: '#001938',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
