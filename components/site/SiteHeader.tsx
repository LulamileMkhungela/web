'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CartToggle } from '@/components/cart/CartButtons';
import { SearchBox } from '@/components/search/SearchBox';
import { Logo } from '@/components/ui/Logo';
import { ChevronDownIcon, SearchIcon } from '@/components/ui/Icons';
import { ABOUT_LINKS, MENU_LINKS, type NavLink } from '@/lib/nav';

type OpenGroup = 'about' | 'menu' | null;

function Dropdown({
  id,
  label,
  links,
  open,
  active,
  onToggle,
}: {
  id: string;
  label: string;
  links: NavLink[];
  open: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  const panelId = `${id}-menu`;
  return (
    <div className="relative">
      <button
        type="button"
        className="nav-link"
        aria-expanded={open}
        aria-controls={panelId}
        aria-current={active ? 'true' : undefined}
        onClick={onToggle}
      >
        {label}
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute left-1/2 top-full z-50 mt-3 w-72 -translate-x-1/2 rounded-2xl border border-line bg-white p-2 shadow-lift"
        >
          <ul className="flex max-h-[70vh] flex-col overflow-y-auto">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center rounded-xl px-4 py-2 text-[0.95rem] font-semibold text-navy no-underline hover:bg-cream focus-visible:bg-cream"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader({ logo }: { logo: string | null }) {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<OpenGroup>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // Close menus whenever the page changes.
  useEffect(() => {
    setOpenGroup(null);
    setSearchOpen(false);
  }, [pathname]);

  // Close the open dropdown on outside click or Escape.
  useEffect(() => {
    if (!openGroup) return;
    const onPointer = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpenGroup(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenGroup(null);
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [openGroup]);

  const toggle = (group: Exclude<OpenGroup, null>) => setOpenGroup((current) => (current === group ? null : group));
  const aboutActive = pathname.startsWith('/about');
  const menuActive = pathname.startsWith('/menu') || pathname.startsWith('/specials');

  return (
    <header ref={headerRef} className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
      <div className="container-hb flex h-[4.5rem] items-center justify-between gap-3">
        <Logo src={logo} />

        {/* Desktop navigation: the same two groups as the mobile bottom bar. */}
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          <Link
            href="/"
            className="nav-link"
            aria-current={pathname === '/' ? 'page' : undefined}
          >
            Home
          </Link>
          <Dropdown
            id="about"
            label="About"
            links={ABOUT_LINKS}
            open={openGroup === 'about'}
            active={aboutActive}
            onToggle={() => toggle('about')}
          />
          <Dropdown
            id="menu"
            label="Menu"
            links={MENU_LINKS}
            open={openGroup === 'menu'}
            active={menuActive}
            onToggle={() => toggle('menu')}
          />
          <Link
            href="/contact"
            className="nav-link"
            aria-current={pathname.startsWith('/contact') ? 'page' : undefined}
          >
            Contact
          </Link>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="icon-btn"
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={() => setSearchOpen((value) => !value)}
          >
            <SearchIcon />
            <span className="sr-only">Search the menu</span>
          </button>
          <CartToggle />
        </div>
      </div>

      {searchOpen ? (
        <div id="site-search" className="border-t border-line bg-white">
          <div className="container-hb py-4">
            <SearchBox variant="panel" autoFocus onNavigate={() => setSearchOpen(false)} />
          </div>
        </div>
      ) : null}
    </header>
  );
}
