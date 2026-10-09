// One source of truth for the grouped navigation. The top bar, the mobile bottom bar
// and the footer all read from here, so the groups always match.
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
