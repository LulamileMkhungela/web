import type { Metadata } from 'next';
import { MenuBrowser } from '@/components/menu/MenuBrowser';
import { PageHeader } from '@/components/site/PageHeader';
import { listCategories } from '@/lib/menu';
import { getSiteSettings } from '@/lib/settings';
import { openStatus } from '@/lib/time';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Offering / Meals: Our Menu',
  description:
    'The full Heritage Bites menu: traditional favourites, hearty mains, popular favourites, quick takeaways, breakfast and sides. Add to cart or order in one tap.',
  alternates: { canonical: '/menu' },
};

export default function MenuPage() {
  const categories = listCategories();
  const status = openStatus(getSiteSettings().hours);
  return (
    <>
      <PageHeader kicker="Offering / Meals" title="Our menu">
        <p>Every dish is priced including VAT. Add dishes to your cart, or tap Order now to go straight to checkout.</p>
        <p className="mt-5">
          <span className="pill">
            <span className={`dot-status ${status.isOpen ? '' : 'dot-status-closed'}`} aria-hidden="true" />
            {status.label}, {status.detail.toLowerCase()}
          </span>
        </p>
      </PageHeader>
      <MenuBrowser categories={categories} />
    </>
  );
}
