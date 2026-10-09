// Client-safe constants shared by server and browser code.

export const BRAND = {
  name: 'Heritage Bites',
  tagline: 'A Taste of Heritage, Made With Love',
  established: '2025',
  description:
    'Heritage Bites is a culturally inspired African restaurant and takeaway in Pretoria Central, serving authentic South African traditional meals in a clean, modern and welcoming environment.',
  street: '323 Sisulu St',
  suburb: 'Pretoria Central',
  city: 'Pretoria',
  region: 'Gauteng',
  postcode: '0002',
  country: 'ZA',
  phoneDisplay: '+27 67 013 7587',
  phoneTel: '+27670137587',
  whatsappNumber: '27670137587',
  email: 'heritagebitesfood@gmail.com',
  mapQuery: '323 Sisulu St, Pretoria Central, Pretoria, 0002, South Africa',
} as const;

export const CURRENCY = 'ZAR';
/** South African standard VAT. Menu prices are shown VAT-inclusive. */
export const VAT_RATE = 0.15;
export const TIMEZONE = 'Africa/Johannesburg';

export const SITE_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

export const DEFAULT_STORE_LINKS = {
  ubereats: 'https://www.ubereats.com/za',
  mrd: 'https://www.mrd.com/',
} as const;

export const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const LONG_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/about#vision', label: 'Vision' },
  { href: '/about#mission', label: 'Mission' },
  { href: '/about#how-we-started', label: 'How We Started' },
  { href: '/menu', label: 'Offering / Meals' },
  { href: '/specials', label: 'Specials' },
  { href: '/contact', label: 'Contact' },
] as const;
