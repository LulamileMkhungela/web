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

async function main() {
  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    headless: true,
    defaultViewport: { width: 1440, height: 900 },
  });
  try {
    const page = await browser.newPage();
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(900);
    await page.screenshot({ path: path.join(OUT, 'home-desktop.jpg'), type: 'jpeg', quality: 82 });

    await page.evaluate(() => {
      const el = document.querySelector('#today-heading');
      el?.scrollIntoView({ block: 'start' });
    });
    await sleep(500);
    await page.screenshot({ path: path.join(OUT, 'home-specials-desktop.jpg'), type: 'jpeg', quality: 82 });

    await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.evaluate(() => document.getElementById('cat-popular')?.scrollIntoView({ block: 'start' }));
    await sleep(900);
    await page.screenshot({ path: path.join(OUT, 'menu-desktop.jpg'), type: 'jpeg', quality: 82 });

    await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    await page.screenshot({ path: path.join(OUT, 'checkout-desktop.jpg'), type: 'jpeg', quality: 82 });

    await page.goto(`${BASE}/about`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    await page.screenshot({ path: path.join(OUT, 'about-desktop.jpg'), type: 'jpeg', quality: 82 });

    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(700);
    await page.screenshot({ path: path.join(OUT, 'footer-desktop.jpg'), type: 'jpeg', quality: 82 });

    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(900);
    await page.screenshot({ path: path.join(OUT, 'home-phone.jpg'), type: 'jpeg', quality: 80 });
    await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle0', timeout: 90000 });
    await sleep(600);
    await page.screenshot({ path: path.join(OUT, 'menu-phone.jpg'), type: 'jpeg', quality: 80 });
  } finally {
    await browser.close();
  }
  console.log(`Saved screenshots to ${OUT}`);
}

main().catch((error) => {
  console.error('Screenshot run failed:', error);
  process.exit(1);
});
