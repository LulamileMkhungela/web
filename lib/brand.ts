// Server-only: finds the owner's logo files. Upload them from the heritagebites.co.za
// media library as public/brand/heritage-bites-logo.png (dark text, for light backgrounds)
// and public/brand/heritage-bites-logo-white.png (for the navy footer). Until they exist
// the site shows a built-in placeholder mark.
import { existsSync } from 'node:fs';
import path from 'node:path';

export function brandLogos(): { color: string | null; white: string | null } {
  const dir = path.join(process.cwd(), 'public', 'brand');
  const pick = (base: string): string | null => {
    for (const ext of ['png', 'svg', 'webp', 'jpg']) {
      if (existsSync(path.join(dir, `${base}.${ext}`))) return `/brand/${base}.${ext}`;
    }
    return null;
  };
  return { color: pick('heritage-bites-logo'), white: pick('heritage-bites-logo-white') };
}
