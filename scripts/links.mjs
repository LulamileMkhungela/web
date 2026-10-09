// Crawls the public pages and checks every internal link, anchor and image.
// Usage: BASE_URL=http://localhost:3000 node scripts/links.mjs
const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const START = [
  '/',
  '/about',
  '/menu',
  '/specials',
  '/contact',
  '/checkout',
  '/checkout?channel=whatsapp',
  '/search',
  '/search?q=kota',
  '/privacy',
  '/terms',
  '/staff/login',
];
const ALLOWED_STATUS = new Map([['/staff', [307, 308]]]);

const pageCache = new Map();
const statusCache = new Map();
const problems = [];
let linksChecked = 0;
let externalLinks = 0;

async function fetchPage(path) {
  if (pageCache.has(path)) return pageCache.get(path);
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' });
  const html = res.status === 200 ? await res.text() : '';
  const entry = { status: res.status, html };
  pageCache.set(path, entry);
  return entry;
}

function idsIn(html) {
  return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
}

function attributeValues(html, attribute) {
  return [...html.matchAll(new RegExp(`\\s${attribute}="([^"]+)"`, 'g'))].map((m) => m[1].replace(/&amp;/g, '&'));
}

async function checkPath(path, fromPage) {
  const [pathname] = path.split('#');
  const allowed = ALLOWED_STATUS.get(pathname) ?? [];
  if (!statusCache.has(pathname)) {
    const page = await fetchPage(pathname);
    statusCache.set(pathname, page.status);
  }
  const status = statusCache.get(pathname);
  const ok = status === 200 || allowed.includes(status);
  if (!ok) problems.push(`${fromPage} -> ${pathname} returned ${status}`);
  return ok;
}

async function main() {
  const queue = [...START];
  const visited = new Set();
  while (queue.length) {
    const path = queue.shift();
    if (visited.has(path)) continue;
    visited.add(path);
    const page = await fetchPage(path);
    if (page.status !== 200) {
      problems.push(`${path} returned ${page.status}`);
      continue;
    }
    const html = page.html;
    const ids = idsIn(html);
    const hrefs = attributeValues(html, 'href');
    for (const href of hrefs) {
      if (/^(mailto:|tel:|javascript:|data:)/.test(href)) continue;
      if (/^https?:\/\//.test(href)) {
        externalLinks += 1;
        if (!href.startsWith(BASE)) continue;
      }
      linksChecked += 1;
      if (href.startsWith('#')) {
        if (!ids.has(href.slice(1))) problems.push(`${path} -> missing anchor ${href}`);
        continue;
      }
      const url = new URL(href, `${BASE}${path}`);
      if (url.origin !== BASE && !href.startsWith(BASE)) continue;
      const target = `${url.pathname}${url.search}`;
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/pay/') || url.pathname.startsWith('/order/')) continue;
      const ok = await checkPath(target + (url.hash ? url.hash : ''), path);
      if (ok && url.hash) {
        const targetPage = await fetchPage(url.pathname);
        if (!idsIn(targetPage.html).has(url.hash.slice(1))) {
          problems.push(`${path} -> ${url.pathname} is missing anchor ${url.hash}`);
        }
      }
      if (ok && !url.pathname.startsWith('/staff') && !url.pathname.startsWith('/checkout') && url.pathname !== '/search') {
        queue.push(url.pathname);
      }
    }
    for (const src of attributeValues(html, 'src')) {
      if (!src.startsWith('/')) continue;
      linksChecked += 1;
      const res = await fetch(`${BASE}${src.split('?')[0]}`, { method: 'HEAD' });
      if (res.status !== 200) problems.push(`${path} -> image ${src} returned ${res.status}`);
    }
  }
  console.log(`Pages crawled: ${visited.size}. Internal links and images checked: ${linksChecked}. External links listed (not fetched): ${externalLinks}.`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    for (const p of [...new Set(problems)]) console.log(`  - ${p}`);
    process.exit(1);
  }
  console.log('No broken internal links, anchors or images.');
}

main().catch((error) => {
  console.error('Link check crashed:', error);
  process.exit(1);
});
