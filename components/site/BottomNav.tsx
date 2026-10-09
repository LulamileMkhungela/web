'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/components/cart/CartProvider';
import { BagIcon, ChatIcon, CloseIcon, HomeIcon, InfoIcon, MenuIcon } from '@/components/ui/Icons';
import { ABOUT_LINKS, MENU_LINKS } from '@/lib/nav';

type Sheet = 'about' | 'menu' | null;

/** Mobile bottom bar. About and Menu open the same link groups as the top navigation. */
export function BottomNav() {
  const pathname = usePathname();
  const { count, open: openCart } = useCart();
  const [sheet, setSheet] = useState<Sheet>(null);

  useEffect(() => {
    setSheet(null);
  }, [pathname]);

  useEffect(() => {
    if (!sheet) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSheet(null);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [sheet]);

  const aboutActive = pathname.startsWith('/about');
  const menuActive = pathname.startsWith('/menu') || pathname.startsWith('/specials');
  const links = sheet === 'about' ? ABOUT_LINKS : MENU_LINKS;
  const title = sheet === 'about' ? 'About' : 'Menu';

  return (
    <>
      {sheet ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-navy/60"
            onClick={() => setSheet(null)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="sheet-title"
            className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white px-5 pb-8 pt-4 shadow-lift"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line" aria-hidden="true" />
            <div className="flex items-center justify-between gap-4">
              <h2 id="sheet-title" className="text-2xl font-bold">
                {title}
              </h2>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setSheet(null)}>
                <CloseIcon className="h-4 w-4" />
                Close
              </button>
            </div>
            <ul className="mt-4 flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex min-h-14 items-center justify-between rounded-2xl px-4 text-[1.05rem] font-semibold text-navy no-underline hover:bg-cream"
                  >
                    {link.label}
                    <span aria-hidden="true" className="text-xl text-ochre-deep">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-navy pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-5">
          <li>
            <Link href="/" className="bottom-tab" aria-current={pathname === '/' ? 'page' : undefined}>
              <HomeIcon className="h-6 w-6" />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <button
              type="button"
              className="bottom-tab"
              data-active={aboutActive || sheet === 'about'}
              aria-expanded={sheet === 'about'}
              aria-haspopup="dialog"
              onClick={() => setSheet(sheet === 'about' ? null : 'about')}
            >
              <InfoIcon className="h-6 w-6" />
              <span>About</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              className="bottom-tab"
              data-active={menuActive || sheet === 'menu'}
              aria-expanded={sheet === 'menu'}
              aria-haspopup="dialog"
              onClick={() => setSheet(sheet === 'menu' ? null : 'menu')}
            >
              <MenuIcon className="h-6 w-6" />
              <span>Menu</span>
            </button>
          </li>
          <li>
            <Link href="/contact" className="bottom-tab" aria-current={pathname.startsWith('/contact') ? 'page' : undefined}>
              <ChatIcon className="h-6 w-6" />
              <span>Contact</span>
            </Link>
          </li>
          <li>
            <button type="button" className="bottom-tab" onClick={openCart}>
              <span className="relative">
                <BagIcon className="h-6 w-6" />
                {count > 0 ? (
                  <span className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ochre-bright px-1 text-[0.7rem] font-bold text-navy">
                    {count}
                  </span>
                ) : null}
              </span>
              <span>Cart</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
