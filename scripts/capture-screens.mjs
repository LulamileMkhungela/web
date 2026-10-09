// Saves review screenshots of the main screens (desktop and phone) to docs/screenshots.
// Usage: BASE_URL=http://localhost:3000 node scripts/capture-screens.mjs
import fs from 'node:fs';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const OUT = process.env.SHOT_DIR || path.join(process.cwd(), 'docs', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function open(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 90000 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(600);
}

async function save(page, name, quality = 82) {
  await page.screenshot({ path: path.join(OUT, name), type: 'jpeg', quality });
  console.log(`saved ${name}`);
}

async function main() {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
  });
  try {
    const page = await browser.newPage();

    await open(page, '/');
    await save(page, 'home-desktop.jpg');

    await page.evaluate(() => document.getElementById('today-heading')?.scrollIntoView({ block: 'start' }));
    await sleep(500);
    await save(page, 'home-specials-desktop.jpg');

    await open(page, '/menu');
    await page.evaluate(() => document.getElementById('category-hearty')?.scrollIntoView({ block: 'start' }));
    await sleep(800);
    await save(page, 'menu-desktop.jpg');

    // Checkout needs a basket: put two dishes in the cart first, then open checkout.
    await open(page, '/');
    await page.evaluate(() =>
      localStorage.setItem(
        'hb-cart-v1',
        JSON.stringify([
          { key: 'item:mogodu-samp', name: 'Mogodu & Samp', priceCents: 8500, image: '/images/menu/mogodu-1.webp', qty: 1 },
          { key: 'item:chicken-wings', name: 'Chicken Wings', priceCents: 7000, image: '/images/menu/braai-wings-1.webp', qty: 2 },
        ]),
      ),
    );
    await open(page, '/checkout');
    await save(page, 'checkout-desktop.jpg');

    await open(page, '/about');
    await save(page, 'about-desktop.jpg');

    await open(page, '/');
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await sleep(700);
    await save(page, 'footer-desktop.jpg');

    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await open(page, '/');
    await save(page, 'home-phone.jpg', 80);

    await open(page, '/menu');
    await save(page, 'menu-phone.jpg', 80);

    await page.evaluate(() => document.querySelector('nav[aria-label="Quick navigation"] button[aria-expanded]')?.click());
    await sleep(400);
    await save(page, 'menu-sheet-phone.jpg', 80);
    await page.keyboard.press('Escape');

    await open(page, '/checkout');
    await save(page, 'checkout-phone.jpg', 80);
  } finally {
    await browser.close();
  }
  console.log(`Saved screenshots to ${OUT}`);
}

main().catch((error) => {
  console.error('Screenshot run failed:', error);
  process.exit(1);
});
