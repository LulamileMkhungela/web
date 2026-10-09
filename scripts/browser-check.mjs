// Headless-browser checks for the live site: carousels, add to cart, checkout
// (card, Yoco, WhatsApp), field alignment, the staff board, and screenshots.
// Usage: BASE_URL=http://localhost:3000 STAFF_PIN=1234 node scripts/browser-check.mjs
import fs from 'node:fs';
import path from 'node:path';
import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const PIN = process.env.STAFF_PIN || '1234';
const OUT = process.env.SHOT_DIR || path.join(process.cwd(), 'test-artifacts', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

let passes = 0;
let failures = 0;
function check(name, condition, detail = '') {
  if (condition) {
    passes += 1;
    console.log(`  ok   ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name}${detail ? ` :: ${detail}` : ''}`);
  }
}

const pageErrors = [];

async function shot(page, name, fullPage = false) {
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
}

async function waitForPath(page, prefix, timeout = 20000) {
  await page.waitForFunction((p) => window.location.pathname.startsWith(p), { timeout }, prefix);
}

async function carouselState(page, selector) {
  return page.$eval(selector, (region) => {
    const tabs = Array.from(region.querySelectorAll('[role="tab"]'));
    const selected = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
    const figures = Array.from(region.querySelectorAll('figure'));
    const visible = figures.find((f) => f.getAttribute('aria-hidden') !== 'true');
    const img = visible?.querySelector('img');
    const track = region.querySelector('div');
    return {
      tabs: tabs.length,
      selected,
      src: img?.getAttribute('src') ?? '',
      transform: track?.style.transform ?? '',
      counter: region.querySelector('span')?.textContent ?? '',
    };
  });
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
    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !/favicon|Failed to load resource: the server responded with a status of 404/.test(msg.text())) {
        pageErrors.push(`console: ${msg.text()}`);
      }
    });

    console.log('Home page');
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 90000 });
    check('home headline is the traditional-food message', (await page.$eval('h1', (h) => h.textContent)).includes('Traditional African food'));
    const hero = 'section[class*="grain"] [role="region"][aria-roledescription="carousel"]';
    const first = await carouselState(page, hero);
    check('hero carousel shows four dots', first.tabs === 4, JSON.stringify(first));
    check('hero starts on the first photo', first.selected === 0 && first.src.includes('mogodu-1'));
    const dots = await page.$$(`${hero} [role="tab"]`);
    await dots[2].click();
    await new Promise((r) => setTimeout(r, 700));
    const afterDot = await carouselState(page, hero);
    check('clicking dot 3 switches the hero photo', afterDot.selected === 2 && afterDot.src.includes('motogo-2'), JSON.stringify(afterDot));
    await page.click(`${hero} button[aria-label="Next photo"]`);
    await new Promise((r) => setTimeout(r, 700));
    const afterNext = await carouselState(page, hero);
    check('next arrow moves to photo 4', afterNext.selected === 3 && afterNext.src.includes('magwinya-3'), JSON.stringify(afterNext));
    await page.click(`${hero} button[aria-label="Previous photo"]`);
    await page.click(`${hero} button[aria-label="Previous photo"]`);
    await new Promise((r) => setTimeout(r, 700));
    check('previous arrow moves back', (await carouselState(page, hero)).selected === 1);
    await shot(page, '01-home-desktop', false);
    await shot(page, '02-home-full', true);

    console.log('\nMenu and product cards');
    await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle0', timeout: 90000 });
    const card = '#item-mogodu-samp [role="region"][aria-roledescription="carousel"]';
    const cardState = await carouselState(page, card);
    check('product card has three photos', cardState.tabs === 3, JSON.stringify(cardState));
    const cardDots = await page.$$(`${card} [role="tab"]`);
    await cardDots[1].click();
    await new Promise((r) => setTimeout(r, 700));
    const cardAfter = await carouselState(page, card);
    check('product dot 2 switches the photo', cardAfter.selected === 1 && cardAfter.src.includes('mogodu-2'), JSON.stringify(cardAfter));
    await page.click(`${card} button[aria-label="Next photo"]`);
    await new Promise((r) => setTimeout(r, 700));
    check('product next arrow moves to photo 3', (await carouselState(page, card)).src.includes('mogodu-3'));
    await page.click(`${card} figure[aria-hidden="false"] img`);
    await new Promise((r) => setTimeout(r, 300));
    const dialogInfo = await page.evaluate(() => {
      const dialogs = Array.from(document.querySelectorAll('dialog[open]'));
      return dialogs.map((d) => ({ thumbs: d.querySelectorAll('[role="listitem"]').length }));
    });
    check('clicking a photo opens the lightbox with all photos', dialogInfo.some((d) => d.thumbs === 3), JSON.stringify(dialogInfo));
    await page.keyboard.press('Escape');
    await shot(page, '03-menu-cards', false);

    console.log('\nBasket and checkout');
    await page.evaluate(() => localStorage.removeItem('hb-cart-v1'));
    await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle0', timeout: 90000 });
    const addButtons = await page.$$('button[aria-label="Add Mogodu & Samp to cart"]');
    check('each dish has an Add to cart button', addButtons.length === 1);
    await addButtons[0].click();
    await new Promise((r) => setTimeout(r, 400));
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('hb-cart-v1') || '[]'));
    check('Add to cart stores the dish in the basket', stored.length === 1 && stored[0].key === 'item:mogodu-samp');
    const orderButton = await page.$('button[aria-label="Order Fried Chips now"]');
    await page.evaluate(() => document.getElementById('item-fried-chips')?.scrollIntoView({ block: 'center' }));
    await orderButton?.click();
    await waitForPath(page, '/checkout');
    check('Order sends the shopper straight to checkout', page.url().endsWith('/checkout'));
    const summary = await page.$eval('aside[aria-labelledby="summary-title"]', (el) => el.textContent);
    check('checkout summary lists both dishes', summary.includes('Mogodu') && summary.includes('Fried Chips'));
    await shot(page, '04-checkout-desktop', true);

    // Field alignment on checkout: text inputs share left edges and heights.
    const fieldMetrics = await page.$$eval('#checkout-form input.field, #checkout-form select.field', (els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: Math.round(r.left), height: Math.round(r.height), width: Math.round(r.width) };
      }),
    );
    const heights = new Set(fieldMetrics.map((f) => f.height));
    check('all checkout inputs share one height', heights.size === 1, JSON.stringify([...heights]));
    const leftEdges = new Set(fieldMetrics.map((f) => f.left));
    check('checkout inputs align to two clean columns', leftEdges.size <= 2, JSON.stringify([...leftEdges]));

    await page.type('input[autocomplete="name"]', 'Thandi Browser');
    await page.type('input[autocomplete="tel"]', '082 123 4567');
    const pickupValue = await page.$eval('select.field', (s) => s.options[0]?.value ?? '');
    check('a pickup time is preselected', pickupValue !== '');
    const submit = await page.$('aside button[type="submit"]');
    check('Place order is enabled with a basket and pickup time', submit && !(await (await submit.getProperty('disabled')).jsonValue()));
    await submit.click();
    await waitForPath(page, '/order/', 60000);
    await page.waitForSelector('h1');
    const orderHeading = await page.$eval('h1', (h) => h.textContent);
    check('card payment lands on the order tracker', orderHeading.startsWith('HB-'), orderHeading);
    const cartAfter = await page.evaluate(() => localStorage.getItem('hb-cart-v1'));
    check('basket is emptied after a paid order', cartAfter === '[]' || cartAfter === null);
    await shot(page, '05-order-tracker', true);

    console.log('\nYoco and WhatsApp');
    await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle0', timeout: 90000 });
    await (await page.$('button[aria-label="Add Samp & Beans to cart"]'))?.click();
    await new Promise((r) => setTimeout(r, 300));
    await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.type('input[autocomplete="name"]', 'Yoco Shopper');
    await page.type('input[autocomplete="tel"]', '0821234567');
    const radios = await page.$$('[role="radiogroup"][aria-label="Payment method"] [role="radio"]');
    await radios[1].click();
    await (await page.$('aside button[type="submit"]'))?.click();
    await waitForPath(page, '/pay/yoco/', 60000);
    check('Yoco option opens the simulated checkout page', page.url().includes('/pay/yoco/yco_'));
    await shot(page, '06-yoco-simulated', false);
    const payButton = await page.$('button.btn-ochre');
    await payButton?.click();
    await waitForPath(page, '/order/', 60000);
    check('approving the Yoco payment shows the order', (await page.$eval('h1', (h) => h.textContent)).startsWith('HB-'));

    await page.goto(`${BASE}/menu`, { waitUntil: 'networkidle0', timeout: 90000 });
    await (await page.$('button[aria-label="Add Chakalaka to cart"]'))?.click();
    await new Promise((r) => setTimeout(r, 300));
    await page.goto(`${BASE}/checkout?channel=whatsapp`, { waitUntil: 'networkidle0', timeout: 90000 });
    await page.type('input[autocomplete="name"]', 'WhatsApp Shopper');
    await page.type('input[autocomplete="tel"]', '0821234567');
    await (await page.$('aside button[type="submit"]'))?.click();
    await page.waitForFunction(() => document.body.innerText.includes('Open WhatsApp'), { timeout: 60000 });
    const waHref = await page.$eval('a[href^="https://wa.me/"][href*="text="]', (a) => a.getAttribute('href'));
    check('WhatsApp checkout offers a wa.me link with the order', String(waHref).includes('wa.me/27670137587') && String(waHref).includes('text='));

    console.log('\nContact form');
    await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle0', timeout: 90000 });
    const contactFields = await page.$$eval('[role="tabpanel"] input.field, [role="tabpanel"] select.field', (els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: Math.round(r.left), height: Math.round(r.height) };
      }),
    );
    check('contact form has aligned fields', contactFields.length >= 4, JSON.stringify(contactFields));
    check('contact inputs share one height', new Set(contactFields.map((f) => f.height)).size === 1, JSON.stringify([...new Set(contactFields.map((f) => f.height))]));
    check('contact inputs align to two clean columns', new Set(contactFields.map((f) => f.left)).size <= 2, JSON.stringify([...new Set(contactFields.map((f) => f.left))]));
    await shot(page, '10-contact', true);

    console.log('\nResponsive layout');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle0', timeout: 90000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check('no horizontal scrolling on a phone', overflow <= 1, `overflow ${overflow}px`);
    await shot(page, '07-home-mobile', false);
    const menuBox = await page.$eval('button[aria-controls="mobile-menu"]', (b) => {
      const r = b.getBoundingClientRect();
      return { left: r.left, right: r.right, width: window.innerWidth };
    });
    check('phone header keeps the menu button on screen', menuBox.right <= menuBox.width && menuBox.left >= 0, JSON.stringify(menuBox));
    await page.click('button[aria-controls="mobile-menu"]');
    await new Promise((r) => setTimeout(r, 300));
    await shot(page, '08-mobile-menu', false);
    await page.setViewport({ width: 1440, height: 900 });

    console.log('\nStaff console');
    await page.goto(`${BASE}/staff`, { waitUntil: 'networkidle0', timeout: 90000 });
    check('staff area asks for the PIN first', page.url().includes('/staff/login'));
    await page.type('input[autocomplete="one-time-code"]', PIN);
    await page.click('button[type="submit"]');
    await waitForPath(page, '/staff', 30000);
    await page.waitForSelector('#board-heading', { timeout: 30000 });
    check('staff board opens after sign-in', (await page.$eval('#board-heading', (h) => h.textContent)).includes('Kitchen'));
    const columns = await page.$$eval('h2', (hs) => hs.map((h) => h.textContent).filter((t) => ['New', 'Preparing', 'Ready for collection', 'Awaiting payment'].includes(t)));
    check('board has kitchen columns', columns.length >= 3, JSON.stringify(columns));
    await shot(page, '09-staff-board', false);

    console.log('\nPage errors');
    check('no uncaught JavaScript errors on the way', pageErrors.length === 0, pageErrors.slice(0, 5).join(' | '));
  } finally {
    await browser.close();
  }
  const total = passes + failures;
  console.log(`\n${passes}/${total} browser checks passed${failures ? `, ${failures} failed` : ''}. Screenshots: ${OUT}`);
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error('Browser run crashed:', error);
  process.exit(1);
});
