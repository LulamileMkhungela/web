// One source of truth for the grouped navigation. The top bar and the mobile bottom bar read the
// same groups. The footer uses the same group names with fewer links.
import { SEED_CATEGORIES } from './seed-data';

export type NavLink = { label: string; href: string };
export type NavGroupId = 'about' | 'menu';
export type NavGroup = { id: NavGroupId; label: string; links: NavLink[] };

export const ABOUT_LINKS: NavLink[] = [
  { label: 'About us', href: '/about' },
  { label: 'Vision', href: '/about#vision' },
  { label: 'Mission', href: '/about#mission' },
  { label: 'How we started', href: '/about#how-we-started' },
];

export const MENU_LINKS: NavLink[] = [
  { label: 'Offering / Meals', href: '/menu' },
  ...SEED_CATEGORIES.map((category) => ({ label: category.name, href: `/menu#category-${category.id}` })),
  { label: 'Specials', href: '/specials' },
];

export const NAV_GROUPS: NavGroup[] = [
  { id: 'about', label: 'About', links: ABOUT_LINKS },
  { id: 'menu', label: 'Menu', links: MENU_LINKS },
];

// Footer: the same group names as the header, with fewer links.
export const FOOTER_MENU_LINKS: NavLink[] = [
  { label: 'Full menu', href: '/menu' },
  { label: 'Weekly specials', href: '/specials' },
];

export const FOOTER_ABOUT_LINKS: NavLink[] = [
  { label: 'About us', href: '/about' },
  { label: 'Vision & mission', href: '/about#vision' },
  { label: 'How we started', href: '/about#how-we-started' },
];

export const FOOTER_HELP_LINKS: NavLink[] = [
  { label: 'FAQ', href: '/contact#faq' },
  { label: 'Privacy notice', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
];
