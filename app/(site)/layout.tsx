import type { ReactNode } from 'react';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { CartProvider } from '@/components/cart/CartProvider';
import { BackToTop } from '@/components/site/BackToTop';
import { BottomNav } from '@/components/site/BottomNav';
import { JsonLd } from '@/components/site/JsonLd';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteHeader } from '@/components/site/SiteHeader';
import { brandLogos } from '@/lib/brand';
import { getSiteSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default function SiteLayout({ children }: { children: ReactNode }) {
  const settings = getSiteSettings();
  const logos = brandLogos();
  return (
    <CartProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader logo={logos.color} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter logo={logos.white} contact={settings.contact} social={settings.social} />
      <CartDrawer />
      <BottomNav />
      <BackToTop />
      <JsonLd hours={settings.hours} contact={settings.contact} />
    </CartProvider>
  );
}
