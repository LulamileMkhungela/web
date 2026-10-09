import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/about', '/menu', '/specials', '/contact', '/search', '/privacy', '/terms'];
  const now = new Date();
  return pages.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === '/specials' || path === '/menu' ? 'daily' : 'monthly',
    priority: path === '' ? 1 : 0.7,
  }));
}
