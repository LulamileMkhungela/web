import type { ReactNode } from 'react';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { SiteHeader } from '@/components/site/SiteHeader';
import { SiteFooter } from '@/components/site/SiteFooter';
import { UtilityBar } from '@/components/site/UtilityBar';
import { JsonLd } from '@/components/site/JsonLd';
import { getSiteSettings } from '@/lib/settings';
import { openStatus } from '@/lib/time';

export const dynamic = 'force-dynamic';

export default function SiteLayout({ children }: { children: ReactNode }) {
  const settings = getSiteSettings();
  const status = openStatus(settings.hours);
  return (
    <CartProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="sticky top-0 z-50" data-site-chrome>
        <UtilityBar status={status} contact={settings.contact} />
        <SiteHeader />
      </div>
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter hours={settings.hours} contact={settings.contact} storeLinks={settings.storeLinks} />
      <CartDrawer storeLinks={settings.storeLinks} />
      <JsonLd hours={settings.hours} contact={settings.contact} />
    </CartProvider>
  );
}
