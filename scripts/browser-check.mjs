// Headless-browser checks for the Heritage Bites site: grouped navigation (top and bottom),
// product carousels (every photo), menu categories and filters, add to cart and order now,
// single-page checkout (card, Yoco, WhatsApp, counter), the contact form, back to top,
// responsive layout, field alignment, the staff board, the home ticker and today's specials,
// the grouped footer, menu tabs, and the solid cart button.
// Usage: BASE_URL=http://127.0.0.1:3100 STAFF_PIN=1234 SHOT_DIR=/tmp/shots node scripts/browser-check.mjs
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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pageErrors = [];

async function shot(page, name, fullPage = false) {
  // Start from the top so the sticky header is captured where it belongs.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await sleep(150);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage });
}

async function go(page, route) {
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle0', timeout: 90000 });
}

async function waitForPath(page, prefix, timeout = 45000) {
  await page.waitForFunction((p) => window.location.pathname.startsWith(p), { timeout }, prefix);
}

/** Clicks the first button or link whose visible text is exactly `text` inside `scope`. */
async function clickIn(page, scope, text) {
  const clicked = await page.evaluate(
    (scopeSel, label) => {
      const root = document.querySelector(scopeSel);
      if (!root) return false;
      const el = Array.from(root.querySelectorAll('button, a')).find((b) => b.textContent.trim() === label);
      if (!el) return false;
      el.scrollIntoView({ block: 'center' });
      el.click();
      return true;
    },
    scope,
    text,
  );
  if (!clicked) throw new Error(`Could not click "${text}" inside ${scope}`);
  await sleep(250);
}

async function linkTexts(page, selector) {
  // Decorative chevrons (›) are aria-hidden, so they are removed before comparing labels.
  return page.$$eval(selector, (els) => els.map((el) => el.textContent.replace(/›/g, '').trim()));
}

async function fieldHeights(page, selector) {
  return page.$$eval(selector, (els) => els.map((el) => Math.round(el.getBoundingClientRect().height)));
}

async function carouselSnapshot(page, cardSelector) {
  return page.evaluate((scope) => {
    const root = document.querySelector(`${scope} [role="region"][aria-roledescription="carousel"]`);
    if (!root) return null;
    const img = root.querySelector('img');
    const dots = Array.from(root.querySelectorAll('.carousel-dots button'));
    const current = dots.findIndex((d) => d.getAttribute('aria-current') === 'true');
    return {
      src: img?.getAttribute('src') ?? '',
      alt: img?.getAttribute('alt') ?? '',
      counter: root.querySelector('.carousel-count')?.textContent?.trim() ?? '',
      dots: dots.length,
      current,
      loaded: Boolean(img && img.complete && img.naturalWidth > 0),
      arrows: root.querySelectorAll('button[aria-label="Next photo"]').length,
    };
  }, cardSelector);
}

async function clickDot(page, cardSelector, index) {
  // Lazy-loaded photos only load once their card is on screen, so bring the card into view first.
  await page.evaluate(
    (scope, i) => {
      document.querySelector(scope)?.scrollIntoView({ block: 'center' });
      document.querySelectorAll(`${scope} .carousel-dots button`)[i]?.click();
    },
    cardSelector,
    index,
  );
  await sleep(120);
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
      if (msg.type() === 'error' && !/favicon|status of 404|status of 422|status of 409/.test(msg.text())) {
        pageErrors.push(`console: ${msg.text()}`);
      }
    });

    console.log('Home (desktop)');
    await go(page, '/');
    check('home headline is the traditional-food message', (await page.$eval('h1', (h) => h.textContent)).includes('Traditional African food'));
    const topNav = await linkTexts(page, 'nav[aria-label="Main"] > a, nav[aria-label="Main"] > div > button, nav[aria-label="Main"] > button');
    check('top navigation groups: Home, About, Menu, Contact', JSON.stringify(topNav) === JSON.stringify(['Home', 'About', 'Menu', 'Contact']), JSON.stringify(topNav));

    await clickIn(page, 'nav[aria-label="Main"]', 'About');
    const aboutLinks = await linkTexts(page, '#about-menu a');
    check(
      'About group lists About us, Vision, Mission, How we started',
      JSON.stringify(aboutLinks) === JSON.stringify(['About us', 'Vision', 'Mission', 'How we started']),
      JSON.stringify(aboutLinks),
    );
    await page.keyboard.press('Escape');
    await sleep(150);

    await clickIn(page, 'nav[aria-label="Main"]', 'Menu');
    const menuLinks = await linkTexts(page, '#menu-menu a');
    check(
      'Menu group lists Offering / Meals, all six categories and Specials',
      menuLinks.length === 8 && menuLinks[0] === 'Offering / Meals' && menuLinks[7] === 'Specials',
      JSON.stringify(menuLinks),
    );
    await page.keyboard.press('Escape');
    await sleep(150);

    const homeCategories = await page.$$eval('main a[href^="/menu#category-"]', (els) => [...new Set(els.map((e) => e.getAttribute('href')))]);
    check('home shows all six menu categories', homeCategories.length === 6, JSON.stringify(homeCategories));
    const homeLinks = await page.$$eval('main a', (els) => els.map((e) => e.getAttribute('href') ?? ''));
    check('how-to-order has menu, WhatsApp, Uber Eats and Mr D', homeLinks.includes('/menu') && homeLinks.some((h) => h.startsWith('https://wa.me/27670137587')) && homeLinks.some((h) => h.includes('ubereats.com')) && homeLinks.some((h) => h.includes('mrd.com')));
    const externalTargets = await page.$$eval('main a[href*="ubereats.com"], main a[href*="mrd.com"]', (els) => els.map((e) => `${e.getAttribute('target')}|${e.getAttribute('rel')}`));
    check('Uber Eats and Mr D open in a new tab safely', externalTargets.length >= 2 && externalTargets.every((t) => t.startsWith('_blank|') && t.includes('noopener')), JSON.stringify(externalTargets));

    check('back to top is hidden at the top of the page', !(await page.$('button[aria-label="Back to top"]')));
    await page.evaluate(() => window.scrollTo({ top: 1600, behavior: 'instant' }));
    await sleep(400);
    const backToTop = await page.$('button[aria-label="Back to top"]');
    check('back to top appears after scrolling down', Boolean(backToTop));
    await backToTop?.click();
    await sleep(1000);
    const scrolledY = await page.evaluate(() => window.scrollY);
    check('back to top returns to the top', scrolledY < 40, `scrollY ${scrolledY}`);
    const homeText = await page.$eval('main', (m) => m.innerText);
    check('home has no events, office lunch or table booking offer', !/Beyond the counter|plan something together|Book a table|Visit us|office lunch/i.test(homeText));
    check('home has no map block (the map lives on the contact page)', !(await page.$('iframe[title^="Map showing"]')));
    check('home has no topic links into the contact form', !homeLinks.some((h) => h.includes('/contact?topic')));
    await shot(page, '01-home-desktop');

    console.log('\nSpin the pot');
    const hubSpin = await page.$('button[aria-label="Spin the pot"]');
    check('the spin button is inside the wheel', Boolean(hubSpin));
    await hubSpin.click();
    await page.waitForFunction(() => document.body.textContent.includes('The pot says'), { timeout: 20000 });
    check('clicking the centre of the wheel spins it to a dish', true);
    await page.evaluate(() => document.querySelector('[aria-label="Spin the pot"]')?.closest('div.relative')?.scrollIntoView({ block: 'center' }));
    await sleep(300);
    const disc = await page.$('div[aria-hidden="true"].cursor-pointer');
    const box = await disc.boundingBox();
    await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.2);
    await page.waitForFunction(() => document.body.textContent.includes('The pot says'), { timeout: 20000 });
    check('clicking the wheel itself also spins it', true);
    await shot(page, '02-home-full', true);

    console.log('\nHome: ticker, today\'s specials, footer');
    const tickerRegion = '[role="region"][aria-label="Featured dishes and prices"]';
    check('price ticker has no pause button', (await page.$$(`${tickerRegion} button`)).length === 0);
    const tickerLinks = await page.$$eval(`${tickerRegion} a:not([aria-hidden])`, (els) => els.map((e) => e.getAttribute('href') ?? ''));
    check('every ticker dish links to its menu card', tickerLinks.length >= 4 && tickerLinks.every((h) => /^\/menu#item-/.test(h)), JSON.stringify(tickerLinks));
    await page.hover(tickerRegion);
    await sleep(150);
    const pausedOnHover = await page.$eval('.ticker-track', (el) => getComputedStyle(el).animationPlayState);
    check('ticker pauses while the pointer is over it', pausedOnHover === 'paused', pausedOnHover);
    await page.mouse.move(4, 4);
    await sleep(150);
    const runningAgain = await page.$eval('.ticker-track', (el) => getComputedStyle(el).animationPlayState);
    check('ticker moves again when the pointer leaves', runningAgain === 'running', runningAgain);
    const tickerTarget = tickerLinks[0] ?? '/menu#';
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 90000 }),
      page.evaluate((sel) => document.querySelector(`${sel} a:not([aria-hidden])`)?.click(), tickerRegion),
    ]);
    check('ticker dish opens the menu page', page.url().includes('/menu#item-'), page.url());
    try {
      await page.waitForFunction(() => (document.querySelector(':target')?.id ?? '').startsWith('item-'), { timeout: 8000 });
    } catch {
      // Reported by the checks below.
    }
    const openedId = await page.evaluate(() => document.querySelector(':target')?.id ?? '');
    const ringColour = openedId ? await page.$eval(`#${openedId}`, (el) => getComputedStyle(el).boxShadow) : '';
    check('clicking a ticker dish opens that dish on the menu', openedId === tickerTarget.split('#')[1], `${openedId} vs ${tickerTarget}`);
    check('the dish that was opened has a gold ring', ringColour.includes('226, 174, 91'), ringColour);

    await go(page, '/');
    const todayFrames = await page.$$eval('section[aria-labelledby="today-heading"] article > div:first-child', (els) => els.map((e) => Math.round(e.getBoundingClientRect().height)));
    check("today's specials show three cards", todayFrames.length === 3, `${todayFrames.length} cards`);
    check('every special photo frame has the same height', todayFrames.length > 0 && new Set(todayFrames).size === 1, JSON.stringify(todayFrames));
    const todayButtons = await page.$$eval('section[aria-labelledby="today-heading"] article button', (els) => els.map((b) => `${b.textContent.trim()}|${b.disabled}`));
    check(
      'special buttons are Add to cart, or disabled with the day they are on',
      todayButtons.length === 3 &&
        todayButtons.every((s) => /^(Add to cart|In cart|\d+ in cart)\|false$/.test(s) || /^(Only on [A-Za-z]+s|Not available right now)\|true$/.test(s)),
      JSON.stringify(todayButtons),
    );

    const footerGroups = await page.$$eval('footer h2', (els) => els.map((e) => e.textContent.trim()));
    check('footer groups are Menu, About and Visit & contact', JSON.stringify(footerGroups) === JSON.stringify(['Menu', 'About', 'Visit & contact']), JSON.stringify(footerGroups));
    const footerLinkCount = await page.$$eval('footer nav a', (els) => els.length);
    check('footer links are grouped and reduced to 11', footerLinkCount === 11, `${footerLinkCount} links`);
    const footerIconCount = await page.$$eval('footer nav li svg', (els) => els.length);
    check('footer visit and contact lines carry icons', footerIconCount === 4, `${footerIconCount} icons`);
    check('footer edge is the beaded band', Boolean(await page.$('footer .band-beads')));
    check('no social icons until a Facebook, Instagram or TikTok link is saved', (await page.$$('footer a[href*="facebook.com"], footer a[href*="instagram.com"], footer a[href*="tiktok.com"]')).length === 0);

    console.log('\nMenu and product photos');
    await go(page, '/menu');
    const kasiStrips = await page.$$eval('.kasi-strip', (els) => els.length);
    check('menu carries the heritage strip on every card and category header', kasiStrips >= 26, `${kasiStrips} strips`);
    check('menu header carries the kasi artwork', Boolean(await page.$('.kasi-panel')));
    const cardIds = await page.$$eval('article[id^="item-"]', (els) => els.map((e) => e.id));
    check('menu lists all 20 dishes', cardIds.length === 20, `${cardIds.length}`);
    const sectionIds = await page.$$eval('section[id^="category-"]', (els) => els.map((e) => e.id));
    check('menu has a section for each of the six categories', sectionIds.length === 6, JSON.stringify(sectionIds));
    const chipTexts = await linkTexts(page, '.chip-row a');
    check('category bar offers All dishes plus six categories', chipTexts.length === 7, JSON.stringify(chipTexts));

    let photos = 0;
    const photoProblems = [];
    for (const id of cardIds) {
      const scope = `#${id}`;
      await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), scope);
      await sleep(150);
      const snap = await carouselSnapshot(page, scope);
      if (!snap) {
        photoProblems.push(`${id}: no carousel`);
        continue;
      }
      if (snap.dots === 0) {
        if (!snap.loaded) photoProblems.push(`${id}: single photo did not load`);
        photos += 1;
        continue;
      }
      if (snap.arrows !== 1) photoProblems.push(`${id}: next arrow missing`);
      for (let i = 0; i < snap.dots; i += 1) {
        await clickDot(page, scope, i);
        try {
          await page.waitForFunction(
            (s, idx) => {
              const img = document.querySelector(`${s} [role="region"] img`);
              const dots = document.querySelectorAll(`${s} .carousel-dots button`);
              return img && img.complete && img.naturalWidth > 0 && dots[idx]?.getAttribute('aria-current') === 'true';
            },
            { timeout: 5000 },
            scope,
            i,
          );
        } catch {
          photoProblems.push(`${id}: dot ${i + 1} did not show a loaded photo`);
          continue;
        }
        const state = await carouselSnapshot(page, scope);
        if (state.counter !== `${i + 1} / ${snap.dots}`) photoProblems.push(`${id}: counter ${state.counter} at dot ${i + 1}`);
        photos += 1;
      }
      await clickDot(page, scope, 0);
    }
    check(`every dot on every dish shows its own photo (${photos} photos)`, photoProblems.length === 0, photoProblems.slice(0, 6).join(' | '));

    // Arrows: on a two-photo dish, next then previous returns to the first photo.
    const mogodu = '#item-mogodu-samp';
    await clickDot(page, mogodu, 0);
    await page.evaluate((s) => document.querySelector(`${s} button[aria-label="Next photo"]`)?.click(), mogodu);
    await sleep(200);
    const afterNext = await carouselSnapshot(page, mogodu);
    check('next arrow moves to the second Mogodu photo', afterNext.current === 1 && afterNext.src.includes('mogodu-3'), JSON.stringify(afterNext));
    await page.evaluate((s) => document.querySelector(`${s} button[aria-label="Previous photo"]`)?.click(), mogodu);
    await sleep(200);
    check('previous arrow returns to the first photo', (await carouselSnapshot(page, mogodu)).current === 0);
    await shot(page, '03-menu-cards');

    await clickIn(page, 'nav[aria-label="Menu categories"]', 'Breakfast');
    await sleep(1400);
    const tabAfterClick = await page.$$eval('nav[aria-label="Menu categories"] a[aria-current="true"]', (els) => els.map((e) => e.textContent.trim()));
    check('the clicked menu tab is the one shown as current', JSON.stringify(tabAfterClick) === JSON.stringify(['Breakfast']), JSON.stringify(tabAfterClick));
    await page.evaluate(() => {
      const section = document.getElementById('category-popular');
      window.scrollTo({ top: section.getBoundingClientRect().top + window.scrollY - 160, behavior: 'instant' });
    });
    await sleep(400);
    const tabAfterScroll = await page.$$eval('nav[aria-label="Menu categories"] a[aria-current="true"]', (els) => els.map((e) => e.textContent.trim()));
    check('scrolling moves the current tab to the section in view', JSON.stringify(tabAfterScroll) === JSON.stringify(['Popular Favourites']), JSON.stringify(tabAfterScroll));

    await clickIn(page, 'body', 'Vegetarian only');
    const vegCount = (await page.$$('article[id^="item-"]')).length;
    check('vegetarian filter narrows the menu', vegCount > 0 && vegCount < 20, `${vegCount}`);
    await clickIn(page, 'body', 'Vegetarian only');
    check('turning the vegetarian filter off restores all dishes', (await page.$$('article[id^="item-"]')).length === 20);

    await page.type('#menu-search', 'kota');
    await sleep(200);
    const searchNames = await page.$$eval('article[id^="item-"] h3', (els) => els.map((e) => e.textContent.trim()));
    check('menu search finds Sphatlo Kota', searchNames.length >= 1 && searchNames.includes('Sphatlo Kota'), JSON.stringify(searchNames));
    await page.focus('#menu-search');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.waitForFunction(() => document.querySelectorAll('article[id^="item-"]').length === 20, { timeout: 8000 });

    const pillState = () =>
      page.$eval('button.cart-pill', (b) => ({
        count: Number(b.querySelector('.cart-count')?.textContent ?? 0),
        filled: b.dataset.filled === 'true',
        bg: getComputedStyle(b).backgroundColor,
      }));
    await page.evaluate(() => localStorage.removeItem('hb-cart-v1'));
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('button.cart-pill');
    const pillEmpty = await pillState();
    check('empty cart button is outlined, not filled', pillEmpty.count === 0 && !pillEmpty.filled && pillEmpty.bg === 'rgba(0, 0, 0, 0)', JSON.stringify(pillEmpty));
    await clickIn(page, '#item-mogodu-samp', 'Add to cart');
    await page.waitForFunction(() => document.querySelector('button.cart-pill')?.dataset.filled === 'true', { timeout: 8000 });
    const pillFull = await pillState();
    check('cart button fills navy once a dish is added', pillFull.count === 1 && pillFull.filled && pillFull.bg === 'rgb(0, 25, 56)', JSON.stringify(pillFull));
    const storedAfterAdd = await page.evaluate(() => JSON.parse(localStorage.getItem('hb-cart-v1') || '[]'));
    check('Add to cart stores Mogodu & Samp', storedAfterAdd.some((l) => l.key === 'item:mogodu-samp'));
    const solidAfterAdd = await page.$$eval('#item-mogodu-samp button', (buttons) =>
      buttons.filter((b) => b.textContent.includes('In cart')).map((b) => b.getAttribute('data-in-cart')),
    );
    check('after adding, the button turns solid and says In cart', solidAfterAdd.length === 1 && solidAfterAdd[0] === 'true', JSON.stringify(solidAfterAdd));
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('#item-mogodu-samp button')).some((b) => b.textContent.includes('In cart')),
      { timeout: 8000 },
    );
    const solidAfterReload = await page.$$eval('#item-mogodu-samp button', (buttons) =>
      buttons.filter((b) => b.textContent.includes('In cart')).map((b) => b.getAttribute('data-in-cart')),
    );
    check('the solid button is still there after a reload', solidAfterReload.length === 1 && solidAfterReload[0] === 'true', JSON.stringify(solidAfterReload));
    const solidHeight = await page.$$eval('#item-mogodu-samp button', (buttons) =>
      buttons.filter((b) => b.dataset.inCart === 'true').map((b) => Math.round(b.getBoundingClientRect().height)),
    );
    check('the solid cart button stays on one line beside Order now', solidHeight.length === 1 && solidHeight[0] <= 60, JSON.stringify(solidHeight));
    await clickIn(page, '#item-fried-chips', 'Order now');
    await waitForPath(page, '/checkout');
    check('Order now goes straight to checkout', page.url().endsWith('/checkout'));

    console.log('\nCheckout (single page)');
    await page.waitForSelector('form select');
    const summary = await page.$eval('aside', (a) => a.textContent);
    check('checkout summary lists both dishes', summary.includes('Mogodu & Samp') && summary.includes('Fried Chips'));
    const heights = await fieldHeights(page, 'form input.field, form select.field');
    check('every checkout input and select has the same height', new Set(heights).size === 1, JSON.stringify([...new Set(heights)]));
    const payments = await page.$$eval('input[name="payment"]', (els) => els.map((e) => e.value));
    check('payment options: card, Yoco, counter, WhatsApp', JSON.stringify(payments) === JSON.stringify(['card', 'yoco', 'counter', 'whatsapp']), JSON.stringify(payments));
    check('card details are shown for the debit card option', (await page.$$('input[autocomplete="cc-number"]')).length === 1);
    await shot(page, '04-checkout-desktop', true);

    await page.type('input[autocomplete="name"]', 'Thandi Browser');
    await page.type('input[autocomplete="tel"]', '082 123 4567');
    await page.click('form button[type="submit"]');
    await waitForPath(page, '/order/', 60000);
    await page.waitForSelector('h1');
    const orderHeading = await page.$eval('h1', (h) => h.textContent.trim());
    check('card payment places the order and shows its number', /^HB-\d+/.test(orderHeading), orderHeading);
    const cartAfterCard = await page.evaluate(() => localStorage.getItem('hb-cart-v1'));
    check('cart is emptied after placing the order', cartAfterCard === '[]' || cartAfterCard === null);
    await shot(page, '05-order-tracker', true);

    console.log('\nYoco and WhatsApp and counter');
    await go(page, '/menu');
    await clickIn(page, '#item-samp-beans', 'Add to cart');
    await go(page, '/checkout');
    await page.type('input[autocomplete="name"]', 'Yoco Shopper');
    await page.type('input[autocomplete="tel"]', '0821234567');
    await page.click('input[name="payment"][value="yoco"]');
    check('Yoco shows the card fields inside a Yoco panel', (await page.$$('.yoco-panel input[autocomplete="cc-number"]')).length === 1 && (await page.$$('.yoco-panel input')).length === 4);
    check('Yoco button says Pay with Yoco', (await page.$eval('form button[type="submit"]', (b) => b.textContent)).includes('Pay with Yoco'));
    await page.type('.yoco-panel input[autocomplete="cc-number"]', '4111 1111 1111 1111');
    await page.click('form button[type="submit"]');
    await waitForPath(page, '/order/', 60000);
    check('Yoco payment places the order straight away', /^HB-/.test(await page.$eval('h1', (h) => h.textContent.trim())));
    await shot(page, '06-yoco-payment', true);

    await go(page, '/menu');
    await clickIn(page, '#item-chakalaka', 'Add to cart');
    await go(page, '/checkout?channel=whatsapp');
    await page.type('input[autocomplete="name"]', 'WhatsApp Shopper');
    await page.type('input[autocomplete="tel"]', '0821234567');
    await page.click('form button[type="submit"]');
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll('a')).some((a) => a.textContent.includes('Send on WhatsApp')),
      { timeout: 60000 },
    );
    const waHref = await page.$eval('a[href^="https://wa.me/"]', (a) => a.getAttribute('href'));
    check('WhatsApp order gives a wa.me link carrying the order', waHref.includes('wa.me/27670137587') && waHref.includes('text='), waHref);

    await go(page, '/menu');
    await clickIn(page, '#item-atchaar', 'Add to cart');
    await go(page, '/checkout');
    await page.type('input[autocomplete="name"]', 'Counter Shopper');
    await page.type('input[autocomplete="tel"]', '0821234567');
    await page.click('input[name="payment"][value="counter"]');
    await page.click('form button[type="submit"]');
    await waitForPath(page, '/order/', 60000);
    check('pay at the counter places the order', /^HB-/.test(await page.$eval('h1', (h) => h.textContent.trim())));

    console.log('\nContact');
    await go(page, '/contact');
    const asideIcons = await page.$$eval('aside svg', (els) => els.length);
    check('contact visit panel has icons on its address, buttons and opening hours', asideIcons >= 6, `${asideIcons} icons`);
    const form = 'form[aria-labelledby="contact-form-heading"]';
    const contactHeights = await fieldHeights(page, `${form} input.field, ${form} select.field`);
    check('contact form fields share one height', new Set(contactHeights).size === 1, JSON.stringify([...new Set(contactHeights)]));
    check('contact form has no topic picker, event or booking fields', (await page.$$(`${form} select`)).length === 0 && (await page.$$(`${form} input[type="date"], ${form} input[type="time"]`)).length === 0);
    check('contact page has the map with directions', Boolean(await page.$('iframe[title^="Map showing Heritage Bites"]')) && (await page.$$('a[href*="google.com/maps"]')).length >= 2);
    check('contact page shows the opening hours', (await page.$$('aside table tr')).length === 7);
    await page.type(`${form} input[autocomplete="name"]`, 'Test Person');
    await page.type(`${form} input[autocomplete="email"]`, 'test@example.com');
    await page.type(`${form} textarea`, 'Browser check: please confirm the Sunday opening hours.');
    await page.click(`${form} button[type="submit"]`);
    await page.waitForFunction(() => document.body.innerText.includes('Your reference is'), { timeout: 30000 });
    check('contact form sends the message and shows a reference', true);
    check('FAQ has six questions', (await page.$$('#faq details')).length === 6);

    console.log('\nSpecials and search');
    await go(page, '/specials');
    // The weekly planner (seven days) plus the daily special each carry one add-to-cart button.
    const specialButtons = await page.$$eval('main button', (buttons) =>
      buttons.filter((button) => /Add to cart|In cart|\d+ in cart|Not available|Only on/.test(button.textContent || '')).length,
    );
    check('specials page lists eight specials', specialButtons === 8, `${specialButtons} add buttons`);
    await go(page, '/');
    await page.click('button[aria-controls="site-search"]');
    await page.type('#site-search input[type="search"]', 'mog');
    await page.waitForSelector('#site-search a[href^="/menu#item-"]', { timeout: 15000 });
    check('header search suggests dishes as you type', true);
    await page.keyboard.press('Escape');

    console.log('\nResponsive: phone (390px)');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    for (const route of ['/', '/menu', '/specials', '/about', '/contact', '/checkout', '/search?q=kota']) {
      await go(page, route);
      // With mobile emulation a page that overflows widens the layout viewport, so compare with the device width.
      const sideways = await page.evaluate(() => ({ inner: window.innerWidth, scroll: document.documentElement.scrollWidth }));
      check(`no sideways scrolling on ${route}`, sideways.inner <= 390 && sideways.scroll <= sideways.inner + 1, JSON.stringify(sideways));
    }
    await go(page, '/');
    const navBox = await page.$eval('nav[aria-label="Quick navigation"]', (n) => {
      const r = n.getBoundingClientRect();
      return { bottom: Math.round(r.bottom), vh: window.innerHeight };
    });
    check('bottom navigation is pinned to the bottom of the screen', Math.abs(navBox.bottom - navBox.vh) <= 2, JSON.stringify(navBox));
    await shot(page, '07-home-mobile');

    await page.click('nav[aria-label="Quick navigation"] button[aria-expanded]');
    await sleep(300);
    const aboutSheet = await linkTexts(page, '[role="dialog"] a');
    check('bottom About opens the About group', JSON.stringify(aboutSheet) === JSON.stringify(['About us', 'Vision', 'Mission', 'How we started']), JSON.stringify(aboutSheet));
    await shot(page, '08-mobile-about-sheet');
    await page.keyboard.press('Escape');
    await sleep(200);

    await page.evaluate(() => document.querySelectorAll('nav[aria-label="Quick navigation"] button[aria-expanded]')[1]?.click());
    await sleep(300);
    const menuSheet = await linkTexts(page, '[role="dialog"] a');
    check('bottom Menu opens the same Menu group', menuSheet.length === 8 && menuSheet[0] === 'Offering / Meals' && menuSheet[7] === 'Specials', JSON.stringify(menuSheet));
    await shot(page, '09-mobile-menu-sheet');
    await page.keyboard.press('Escape');
    await sleep(200);

    await page.evaluate(() => document.querySelector('nav[aria-label="Quick navigation"] li:last-child button')?.click());
    await sleep(300);
    check('bottom Cart opens the cart drawer', (await page.$eval('[role="dialog"]', (d) => d.textContent)).includes('cart'));
    await page.keyboard.press('Escape');
    await sleep(200);

    await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
    await sleep(400);
    const phoneTop = await page.$('button[aria-label="Back to top"]');
    check('back to top appears on the phone', Boolean(phoneTop));
    const aboveBar = await page.evaluate(() => {
      const b = document.querySelector('button[aria-label="Back to top"]');
      const n = document.querySelector('nav[aria-label="Quick navigation"]');
      return b && n ? b.getBoundingClientRect().bottom <= n.getBoundingClientRect().top : false;
    });
    check('back to top sits above the bottom bar on the phone', aboveBar);
    await shot(page, '10-mobile-back-to-top');

    await go(page, '/menu');
    await clickIn(page, '#item-chicken-wings', 'Add to cart');
    const bagSolid = await page.$eval('nav[aria-label="Quick navigation"] li:last-child svg', (svg) => svg.getAttribute('fill') === 'currentColor');
    check('bottom cart icon is solid when the cart has items', bagSolid);
    await go(page, '/checkout');
    await page.waitForSelector('form select');
    const phoneFields = await fieldHeights(page, 'form input.field, form select.field');
    check('phone checkout fields share one height', new Set(phoneFields).size === 1, JSON.stringify([...new Set(phoneFields)]));
    await shot(page, '11-checkout-mobile', true);

    console.log('\nResponsive: tablet (768px)');
    await page.setViewport({ width: 768, height: 1024, isMobile: false, hasTouch: false, deviceScaleFactor: 1 });
    for (const route of ['/', '/menu', '/checkout', '/contact']) {
      await go(page, route);
      const sideways = await page.evaluate(() => ({ inner: window.innerWidth, scroll: document.documentElement.scrollWidth }));
      check(`no sideways scrolling on ${route} (768px)`, sideways.inner <= 768 && sideways.scroll <= sideways.inner + 1, JSON.stringify(sideways));
    }
    await go(page, '/');
    await shot(page, '12-home-tablet');

    console.log('\nStaff console');
    await page.setViewport({ width: 1440, height: 900 });
    await go(page, '/staff');
    check('staff area asks for the PIN first', page.url().includes('/staff/login'));
    await page.type('input[autocomplete="one-time-code"]', PIN);
    await page.click('button[type="submit"]');
    await waitForPath(page, '/staff', 30000);
    await page.waitForSelector('#board-heading', { timeout: 30000 });
    check('staff board opens after sign-in', (await page.$eval('#board-heading', (h) => h.textContent)).includes('Kitchen'));
    await shot(page, '13-staff-board');
    await page.evaluate(() => Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Settings & checklist'))?.click());
    await page.waitForSelector('input[id$="-facebook"]', { timeout: 15000 });
    check('staff Settings has Facebook, Instagram and TikTok link fields', (await page.$$('input[id$="-facebook"], input[id$="-instagram"], input[id$="-tiktok"]')).length === 3);

    console.log('\nPage errors');
    check('no uncaught JavaScript errors while browsing', pageErrors.length === 0, pageErrors.slice(0, 5).join(' | '));
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
