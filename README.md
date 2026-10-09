# Heritage Bites website

Online ordering and information site for Heritage Bites, a traditional African restaurant and takeaway at 323 Sisulu Street, Pretoria Central. Built with Next.js 16, React, Tailwind CSS 4 and SQLite (Node's built-in `node:sqlite`).

**Status:** ready for the owner's review. Payments are simulated. Prices, opening hours, photos and the logo are placeholders until the owner confirms them (see "Before launch").

## Run it

```bash
npm ci
npm run build
npm run start        # http://localhost:3000, listening on all interfaces
npm run dev          # development server with hot reload
```

Copy `.env.example` to `.env` and set the values:

| Variable | Purpose |
|---|---|
| `SITE_URL` | Public address used in the sitemap, WhatsApp order texts and tracking links. Rebuild after changing it. |
| `DATABASE_PATH` | SQLite file. Default `data/heritage-bites.db`. |
| `STAFF_PIN` | PIN for the staff console at `/staff`. Change it before launch. |
| `STAFF_SESSION_SECRET` | Signs staff session cookies. Change it before launch. |
| `COOKIE_SECURE` | Set to `true` when the site is served over HTTPS. |

## Logo

The header and footer use the owner's logo when it is present. Download the two files from the heritagebites.co.za media library (`Heritage-Bites-Logo.png` and `Heritage-Bites-Logo-white.png`), rename them as below, put them in `public/brand/`, then rebuild:

- `public/brand/heritage-bites-logo.png` (dark text, for the cream header)
- `public/brand/heritage-bites-logo-white.png` (light text, for the navy footer)

Until these files exist, the site shows a built-in placeholder mark. The build environment could not download the logo.

## Navigation

`lib/nav.ts` is the single source for the grouped navigation. The top bar (desktop), the bottom bar (phone) and the footer all use the same groups:

- **About:** About us, Vision, Mission, How we started.
- **Menu:** Offering / Meals, each of the six categories, Specials.
- **Home** and **Contact** sit beside the two groups.

On phones, the bottom bar has Home, About, Menu, Contact and Cart. About and Menu open the same lists as sheets. A back-to-top button appears after scrolling.

## Home page

From top to bottom: the hero (headline, search, a photo carousel of four dishes with a "kitchen right now" note, and how to pay), a price ticker of featured dishes that can be paused, today's specials, the four ways to order, the six menu categories, a "spin the pot" wheel that picks a random dish, the story, three enquiry routes (events, office lunches and table bookings), and the visit block with hours and a map. The three enquiry routes open the one contact form with the right topic already chosen.

## Menu, photos and carousels

- Categories and dishes are in `lib/seed-data.ts`: six categories (as on heritagebites.co.za) and 20 dishes. Each dish has one to four photos.
- Every product card has a photo carousel with arrows, dots, a counter, swipe and arrow keys. Each dot shows its own photo.
- The photos are web photos and must be replaced before launch. See `docs/IMAGE_CREDITS.md`.

## Ordering and payments

- The cart is kept in the browser. Checkout is one page: details, collection time and payment.
- **Debit card and Yoco are test payments.** Any card details are accepted, nothing is charged, and only the card brand and last four digits are kept.
- **Pay at the counter** and **WhatsApp** are also offered. WhatsApp creates a tracked order and opens a `wa.me` message with the order.
- **Uber Eats and Mr D** open the store links from staff Settings. The defaults in `lib/config.ts` are the Pretoria listing pages for each app. No Heritage Bites store page was found, so paste the real store links in Settings when they exist.

## Staff console

`/staff`, with the staff PIN. It has the kitchen board (new, preparing, ready, collected, with refund flags), the menu (availability, prices and descriptions), specials, enquiries and settings (hours, store links, contact details, prep times and the launch checklist).

## Scripts

```bash
npm run typecheck      # TypeScript check
npm run test:api       # API checks (needs a running server)
npm run test:browser   # headless-browser checks (needs Chromium; see below)
npm run test:links     # crawls internal links and images
node scripts/capture-screens.mjs   # refreshes docs/screenshots
```

Run the tests against a separate server and a scratch database, so test orders do not reach the live data:

```bash
DATABASE_PATH=/tmp/hb-test.db npx next start -H 127.0.0.1 -p 3100 &
BASE_URL=http://127.0.0.1:3100 npm run test:api
BASE_URL=http://127.0.0.1:3100 npm run test:browser
BASE_URL=http://127.0.0.1:3100 npm run test:links
```

`test:browser` uses `@sparticuz/chromium`. In some sandboxes, its shared libraries must be unpacked and added to `LD_LIBRARY_PATH` first.

## Project layout

- `app/(site)/`: public pages (home, menu, specials, about, contact, checkout, search, order tracking).
- `app/(pay)/pay/yoco/[id]`: the simulated Yoco checkout page.
- `app/staff/`: staff console and sign-in.
- `app/api/`: JSON routes for menu, search, orders, enquiries, payments and staff.
- `components/`: user interface, grouped by area (`site`, `menu`, `cart`, `checkout`, `home`, `contact`, `media`, `search`, `staff`, `ui`).
- `lib/`: data, pricing, order logic, payments, opening-hours logic, navigation and site copy.
- `docs/`: competitor analysis, image credits and review screenshots.

## Before launch (owner)

1. Confirm the prices and special prices (staff Settings and `lib/seed-data.ts`).
2. Confirm the opening hours (staff Settings).
3. Paste the Heritage Bites Uber Eats and Mr D store links (staff Settings).
4. Replace the web photos listed in `docs/IMAGE_CREDITS.md` with the owner's own photos.
5. Add the logo files to `public/brand/` (see "Logo").
6. Approve the Vision and Mission wording, which is currently a draft (`lib/content.ts`).
7. Have the privacy notice and terms reviewed for POPIA compliance.
8. Connect real Yoco and card-gateway keys. None are connected yet.
9. Change `STAFF_PIN` and `STAFF_SESSION_SECRET`, serve the site over HTTPS and set `COOKIE_SECURE=true`.

## Known limitations

- Payments are simulated. No real card or Yoco charge is made.
- No SMS or email notifications are sent.
- SQLite on a single server process, with no rate limiting.
- No admin screens yet for adding dishes or categories. Dishes live in `lib/seed-data.ts`.
- The map needs an internet connection. Google may set cookies on its map embed.
