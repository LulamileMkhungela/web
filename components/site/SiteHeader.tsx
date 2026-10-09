'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { NAV_LINKS } from '@/lib/config';
import { useCart } from '@/components/cart/CartProvider';
import { SearchBox } from '@/components/search/SearchBox';
import { Logo } from '@/components/ui/Logo';

export function SiteHeader() {
  const pathname = usePathname();
  const cart = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href.includes('#')) return false;
    return href === '/' ? pathname === '/' : pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/95 shadow-[0_1px_0_rgba(183,126,35,0.12)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1240px] items-center gap-3 px-4 py-3 sm:gap-4 sm:px-8 sm:py-3.5">
        <Logo className="min-w-0 shrink" compact />

        <nav aria-label="Main navigation" className="ml-auto hidden min-[1180px]:flex">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`group relative block whitespace-nowrap rounded-full px-3 py-2 text-[0.88rem] font-semibold no-underline transition-colors ${
                      active ? 'text-ochre-deep' : 'text-navy hover:text-ochre-deep'
                    }`}
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0.5 left-3 right-3 h-[2px] origin-left rounded-full bg-ochre transition-transform duration-300 ${
                        active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 min-[1180px]:ml-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-controls="site-search"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/15 bg-white text-navy transition-colors hover:border-ochre hover:text-ochre-deep"
          >
            <span className="sr-only">{searchOpen ? 'Close search' : 'Open search'}</span>
            {searchOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
          </button>

          <button
            type="button"
            onClick={cart.open}
            className="relative inline-flex h-11 items-center gap-2 rounded-full bg-navy px-4 text-sm font-semibold text-cream transition-colors hover:bg-ochre hover:text-navy"
            aria-label={`Open your basket, ${cart.count} item${cart.count === 1 ? '' : 's'}`}
          >
            <ShoppingBag className="h-4.5 w-4.5" aria-hidden="true" />
            <span className="hidden sm:inline">Basket</span>
            <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-ochre px-1.5 text-xs font-bold text-navy">
              {cart.count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy/15 bg-white text-navy min-[1180px]:hidden"
          >
            <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {searchOpen ? (
        <div id="site-search" className="border-t border-navy/10 bg-cream">
          <div className="mx-auto w-full max-w-[1240px] px-5 py-4 sm:px-8">
            <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div id="mobile-menu" className="border-t border-navy/10 bg-cream min-[1180px]:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto w-full max-w-[1240px] px-5 py-5 sm:px-8">
            <ul className="grid gap-1 sm:grid-cols-2">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-base font-semibold text-navy no-underline hover:bg-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/menu" onClick={() => setMenuOpen(false)} className="btn btn-ochre">
                Order now
              </Link>
              <Link href="/checkout?channel=whatsapp" onClick={() => setMenuOpen(false)} className="btn btn-outline">
                Order on WhatsApp
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
