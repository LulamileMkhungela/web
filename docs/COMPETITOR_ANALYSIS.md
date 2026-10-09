# Competitor analysis: Heritage Bites (as of 9 October 2026)

This note records what we could see on each competitor during the rebuild. Every claim below comes from pages we fetched, or from search results, on the date above. Where something could not be checked, we say so.

## How we looked

- **Pages read:** the public text of each site (navigation, headings, prices and hours where printed, link targets, and any visible error messages), fetched through the web page tool.
- **Not possible with these tools:** reading CSS, judging visual design, timing performance, and running accessibility scores on competitor sites.
- **Not found or not accessible:** Uber Eats and Mr D store pages for Heritage Bites (no public listing appeared in search). The Figma link provided as a reference (`Habesha-Restaurant--Community`) resolved to Figma's marketing homepage rather than the design file, so it was not analysed.
- **Sample size:** the five sites you listed, plus two corporate chains (Nando's South Africa and Steers South Africa). That is a small corporate sample; more chains could be added later.

## 1. Heritage Bites today (heritagebites.co.za)

**What it does well**
- A clear brand: deep navy `#001938`, ochre `#B77E23` and cream `#F8F4EC`, set in Playfair Display, Allura and Poppins. The rebuild keeps this palette and type system.
- A real food gallery (16 photos in the media library, including mogodu, tshotlo, kota, magwinya and chicken).
- Delivery is named (Mr D and Uber Eats), along with phone, WhatsApp and a contact form.
- Dine-in, takeaway and delivery are all mentioned in the hero copy.

**Gaps we could see**
- No prices and no opening hours on the page.
- No Vision or Mission section.
- The Mr D and Uber Eats buttons linked to `#` placeholders, not to store pages.
- No basket, checkout or order status. An order is a phone call or a WhatsApp message.
- The contact form is WPForms with reCAPTCHA. It is a generic enquiry form, with no types for events, bookings or office lunches.

## 2. The five sites you listed

| Site | What it does well | Gaps we observed |
|---|---|---|
| **Wandies Place** (`wandies.vercel.app`, Dube, Soweto, buffet) | A strong sense of place. The homepage tells the story of a long-running restaurant ("30+ years of stories", "100k+ notes and signatures", "6 continents represented"). It offers "Explore the Menu", "Plan Your Visit" and "Reserve table" actions, and links straight to its Uber Eats and Mr D store pages. | No basket or checkout on the site: delivery goes only through the two apps. The homepage dish cards show no prices. The visitor quotes on the page are not verifiable, so we did not copy that device. |
| **Mkhaya** (`mkhaya.co.za/heritage-day-catering/`) | Has a dedicated catering page, which is the right idea. | At check time the page showed a WordPress "critical error" ("Your Composer dependencies require a PHP version >= 8.3.0"). The catering page was effectively down, so a customer could not use it. Our lesson: monitor the site and give it a health check (`/api/health` exists in this build). |
| **Foodie Zone** (`loux91.github.io/foodiezone`, Pimville) | Prices appear in a scrolling ticker on the homepage (for example "Cheesey Smash Burger R95"). Categories show item counts. The calls to action are clear. | The "Order now" links and the item "Order" links both go to `/menu`, not to a basket. Their rating (4.8 stars) and delivery time (25 min) are not verifiable from the page, so we do not copy them. |
| **Africa Cuisine & Restaurant** (`africa-cuisine-pro.vercel.app`, Braamfontein) | A time-limited daily special ("Breakfast R34.99: 2 × egg mayo sandwich + coffee or tea, served 08:30 to 12:00"). Bestsellers are priced. Full opening hours are printed. | Its "Add to Order" buttons link to the menu page rather than adding anything to a basket. Its "Maps" link has the target `about:invalid`, so it is broken. No payment methods are stated. |
| **Habesha Restaurant** (Figma reference) | Not analysed. | The link resolved to Figma's marketing page, so the design file could not be read. |

## 3. Corporate chains (sample of two)

**Nando's South Africa** (`nandos.co.za/eat/order`)
- Good: each product page shows its price ("Chicken Caesar Salad @105") with an "Order Now" button.
- Gaps: before the menu loads, a modal asks "Enable Location Services?". A log-in prompt ("Log in to make your order experience smoother") appears alongside. Cookie consent and reCAPTCHA sit on the same page. Browsing is gated on permissions and sign-in.

**Steers South Africa** (`steers.co.za`)
- Good: a strong promotional homepage with clear "View menu" and "View promo" actions.
- Gaps: the page says the best takeaway specials are "on the Steers app", and the main delivery action goes to `app.steers.co.za`. Web visitors are pushed toward the app for deals. The page has little about where food comes from or who makes it.

**Pattern across the two:** app-first deals, permission and sign-in gates before the menu, and promotion-heavy homepages with little local storytelling. This is our reading of two sites, not a survey of the sector.

## 4. Delivery-app context (for the owner's decisions, not facts about this business)

- The Mr D Play Store listing says: "Menu pricing on the platform is set at the discretion of each restaurant and may differ from the in-store menu pricing or prices on other platforms." That supports keeping one published price list in the restaurant's own system.
- A 2024 Reddit thread contains a user's claim that Mr D takes "27% or 28%" of the food value. It is one user's account, not verified, but it is worth checking against the owner's own Mr D agreement before setting delivery prices.

## 5. Gaps this build addresses

Each row says what we saw on competitors (or "not seen on the pages reviewed") and what the rebuild does instead.

| Gap | Where we saw it | What this build does |
|---|---|---|
| Buttons that do not add to a basket | Africa Cuisine, Foodie Zone | A real basket with "Add to cart" and "Order" on every dish. Checkout re-prices everything on the server. |
| Deals locked in an app | Steers | A weekly planner and time-window specials on the website. Specials go into the basket at the special price. |
| Broken map and catering pages | Africa Cuisine (`about:invalid`), Mkhaya (PHP error) | A working map and directions link on the contact page. A health endpoint. A link checker runs as part of the test suite. The site offers no events, office lunches or table bookings, so there are no forms for them. |
| No order tracking | Not seen on the pages reviewed | A tracking page with a status timeline, auto-refresh, a printable receipt and "Order again". |
| No pickup scheduling | Not seen on the pages reviewed | Pickup slots inside opening hours, with a kitchen wait estimate based on the orders already in progress. |
| Sold-out dishes not reflected online | Not seen on the pages reviewed | A staff toggle hides a dish on the site and in search straight away, and blocks it at checkout. |
| Storytelling about the place rather than the food | Wandies (story is about the building and its walls) | Dish stories, a heritage glossary explaining every Setswana, Sotho and Soweto term, and Mogodu Monday. |
| Dietary and heat information | Not seen on the pages reviewed | Vegetarian filter and spice markers on every dish. |
| Permission and sign-in gates | Nando's | No location prompt, no account needed. Guest checkout. |
| Staff tools | Not visible on any public site | A staff console: live board, status buttons, sound alerts, printable kitchen tickets, manual and app-order entry, menu and price control, specials and an enquiries inbox. |
| Search that understands how people speak | Not seen on the pages reviewed | Search that matches dish names, ingredients and terms such as "fat cakes", "tripe" and "porridge". |
| Structured data for search engines | Not checked on competitor sites | Restaurant schema (address, phone, hours, cuisine), a sitemap and robots rules. |

## 6. What we deliberately did not copy

- Star ratings, delivery-time promises, guest quotes and visitor counts that could not be verified.
- Any competitor's copy, photos or layout. The design is new and uses only the Heritage Bites palette and type.
- Permission gates or app-only offers.
