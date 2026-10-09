// End-to-end API checks against a running server (default http://localhost:3000).
// Usage: BASE_URL=http://localhost:3000 STAFF_PIN=1234 node scripts/e2e.mjs
const BASE = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const PIN = process.env.STAFF_PIN || '1234';

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

async function call(path, { method = 'GET', body, cookie } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (cookie) headers.cookie = cookie;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, data, setCookie: res.headers.get('set-cookie') };
}

/** A pickup time 24 hours from now at 10:00 South African time (inside opening hours). */
function pickupLater(hour = 10) {
  const day = new Date(Date.now() + 24 * 3600 * 1000).toLocaleDateString('en-CA', { timeZone: 'Africa/Johannesburg' });
  return new Date(`${day}T${String(hour).padStart(2, '0')}:00:00+02:00`).toISOString();
}

const customer = { name: 'Thandi Test', phone: '082 123 4567', email: 'thandi.test@example.com' };

async function main() {
  console.log(`Heritage Bites API checks against ${BASE}\n`);

  console.log('Public catalogue');
  const health = await call('/api/health');
  check('health endpoint responds', health.status === 200 && health.data?.ok === true);

  const menu = await call('/api/menu');
  const categories = menu.data?.categories ?? [];
  const items = categories.flatMap((c) => c.items);
  check('menu has 6 categories', categories.length === 6, `got ${categories.length}`);
  check('menu has 20 dishes', items.length === 20, `got ${items.length}`);
  check('every dish has a photo and a price', items.every((i) => i.images.length > 0 && i.priceCents > 0));
  check('menu reports kitchen status', typeof menu.data?.status?.isOpen === 'boolean');
  const isOpenNow = Boolean(menu.data?.status?.isOpen);

  const searchFor = async (q) => (await call(`/api/search?q=${encodeURIComponent(q)}`)).data?.items ?? [];
  check('search "fat cakes" finds magwinya', (await searchFor('fat cakes'))[0]?.id === 'magwinya');
  check('search "porridge" finds motogo', (await searchFor('porridge'))[0]?.id === 'motogo-mabele');
  check('search "tripe" finds mogodu', (await searchFor('tripe'))[0]?.id === 'mogodu-samp');
  check('search "chips" includes fried chips', (await searchFor('chips')).some((i) => i.id === 'fried-chips'));
  check('search for nonsense returns nothing', (await searchFor('zzqxv')).length === 0);

  console.log('\nOrder validation');
  const bad1 = await call('/api/orders', {
    method: 'POST',
    body: { channel: 'website', fulfilment: 'collection', pickup: pickupLater(), customer: { name: 'A', phone: '082 123 4567' }, lines: [{ key: 'item:pap', qty: 1 }], payment: { method: 'counter' } },
  });
  check('rejects a one-letter name', bad1.status === 422, `status ${bad1.status}`);
  const bad2 = await call('/api/orders', {
    method: 'POST',
    body: { channel: 'website', fulfilment: 'collection', pickup: pickupLater(), customer: { name: 'Thandi', phone: '123' }, lines: [{ key: 'item:pap', qty: 1 }], payment: { method: 'counter' } },
  });
  check('rejects an invalid mobile number', bad2.status === 422, `status ${bad2.status}`);
  const bad3 = await call('/api/orders', {
    method: 'POST',
    body: { channel: 'website', fulfilment: 'collection', pickup: pickupLater(), customer, lines: [], payment: { method: 'counter' } },
  });
  check('rejects an empty basket', bad3.status === 422, `status ${bad3.status}`);
  const badToken = await call('/api/orders/not-a-real-token-!!');
  check('unknown order token returns 404', badToken.status === 404, `status ${badToken.status}`);

  console.log('\nCard checkout (demo) with server-side pricing');
  const cardBody = {
    channel: 'website',
    fulfilment: 'collection',
    pickup: pickupLater(10),
    customer,
    notes: 'Less chilli please',
    lines: [
      { key: 'item:mogodu-samp', qty: 2 },
      { key: 'item:magwinya', qty: 1 },
    ],
    expectedTotalCents: 20000,
    payment: { method: 'card', card: { number: '4242 4242 4242 4242', name: 'Demo', expiry: '12/30', cvc: '123' } },
  };
  const mismatch = await call('/api/orders', { method: 'POST', body: { ...cardBody, expectedTotalCents: 19999 } });
  check('stale prices are rejected with 409', mismatch.status === 409 && mismatch.data?.totalCents === 20000, `status ${mismatch.status}`);
  const card = await call('/api/orders', { method: 'POST', body: cardBody });
  check('card order is created (201)', card.status === 201, JSON.stringify(card.data));
  check('card order redirects to tracking page', String(card.data?.redirectUrl).startsWith('/order/'));
  check('server totals are correct (R200.00 incl. VAT)', card.data?.totalCents === 20000);
  const cardOrder = (await call(`/api/orders/${card.data?.token}`)).data?.order;
  check('tracking view shows paid by card', cardOrder?.paymentStatus === 'paid' && cardOrder?.paymentMethod === 'card');
  check('VAT is the 15/115 share of the total', cardOrder?.vatCents === 2609 && cardOrder?.subtotalCents === 17391, JSON.stringify({ v: cardOrder?.vatCents, s: cardOrder?.subtotalCents }));
  check('only last four card digits are kept', cardOrder?.cardLast4 === '4242' && cardOrder?.cardBrand === 'Visa');
  check('full card number is never returned', !JSON.stringify(cardOrder).includes('4242424242424242') && !JSON.stringify(cardOrder).includes('4242 4242 4242 4242'));
  check('public tracking hides phone and email', cardOrder?.customerPhone === '' && cardOrder?.customerEmail === '');
  check('order lines are stored', cardOrder?.lines?.length === 2);

  console.log('\nYoco takes the same card fields and is approved at once');
  const yocoBody = {
    channel: 'website',
    fulfilment: 'collection',
    pickup: pickupLater(11),
    customer,
    lines: [{ key: 'item:samp-beans', qty: 1 }],
    payment: { method: 'yoco', card: { number: '5555 5555 5555 4444', name: 'Yoco Demo', expiry: '12/30', cvc: '123' } },
  };
  const yocoOrder = await call('/api/orders', { method: 'POST', body: yocoBody });
  check('yoco order is created (201)', yocoOrder.status === 201, JSON.stringify(yocoOrder.data));
  check('yoco order goes straight to its tracking page', yocoOrder.data?.redirectUrl === `/order/${yocoOrder.data?.token}`, String(yocoOrder.data?.redirectUrl));
  const yocoView = (await call(`/api/orders/${yocoOrder.data?.token}`)).data?.order;
  check(
    'yoco order is paid and sent to the kitchen',
    yocoView?.paymentStatus === 'paid' && yocoView?.status === 'new' && yocoView?.paymentMethod === 'yoco',
    JSON.stringify({ s: yocoView?.status, p: yocoView?.paymentStatus, m: yocoView?.paymentMethod }),
  );
  check('yoco order keeps only the brand and last four digits', yocoView?.cardLast4 === '4444' && yocoView?.cardBrand === 'Mastercard');
  check('yoco order has its own payment reference', String(yocoView?.paymentRef).startsWith('YOCO-'));
  check('yoco order records the approval', (yocoView?.events ?? []).some((e) => e.note === 'Yoco payment approved (demo)'));
  const yocoHosted = await call('/api/payments/yoco/yco_missing');
  check('the old hosted Yoco page endpoint is gone', yocoHosted.status === 404, `status ${yocoHosted.status}`);

  console.log('\nPay at counter, WhatsApp and dine-in');
  const counter = await call('/api/orders', {
    method: 'POST',
    body: { channel: 'website', fulfilment: 'dine_in', pickup: pickupLater(13), customer, lines: [{ key: 'item:pap', qty: 1 }], payment: { method: 'counter' } },
  });
  check('counter order is created for dine-in', counter.status === 201);
  const counterOrder = (await call(`/api/orders/${counter.data?.token}`)).data?.order;
  check('counter order pays on collection', counterOrder?.paymentStatus === 'pay_on_collection' && counterOrder?.paymentMethod === 'counter');

  const wa = await call('/api/orders', {
    method: 'POST',
    body: { channel: 'whatsapp', fulfilment: 'collection', pickup: pickupLater(14), customer, lines: [{ key: 'item:sphatlo-kota', qty: 2 }], payment: { method: 'counter' } },
  });
  check('whatsapp order returns a wa.me link', String(wa.data?.whatsappUrl).startsWith('https://wa.me/27670137587?text='));
  check('whatsapp message names the order', decodeURIComponent(String(wa.data?.whatsappUrl)).includes(wa.data?.displayNumber ?? '##'));

  console.log('\nKitchen timing');
  const asap = await call('/api/orders', {
    method: 'POST',
    body: { channel: 'website', fulfilment: 'collection', pickup: 'asap', customer, lines: [{ key: 'item:pap', qty: 1 }], payment: { method: 'counter' } },
  });
  if (isOpenNow) {
    check('asap order works while open', asap.status === 201, JSON.stringify(asap.data));
  } else {
    check('asap order is refused while closed', asap.status === 400 && /closed/i.test(asap.data?.error ?? ''), JSON.stringify(asap.data));
  }

  console.log('\nStaff console');
  const noAuth = await call('/api/staff/orders');
  check('staff list needs a session (401)', noAuth.status === 401);
  const wrongPin = await call('/api/staff/login', { method: 'POST', body: { pin: '0000' } });
  check('wrong PIN is refused', wrongPin.status === 401);
  const login = await call('/api/staff/login', { method: 'POST', body: { pin: PIN } });
  const cookie = (login.setCookie ?? '').split(';')[0];
  check('correct PIN sets a session cookie', login.status === 200 && cookie.startsWith('hb_staff='));
  check('session cookie is HttpOnly', /httponly/i.test(login.setCookie ?? ''));

  const list = await call('/api/staff/orders', { cookie });
  check('staff can list orders', list.status === 200);
  const seen = list.data?.orders ?? [];
  check('staff list includes the card order with phone', seen.some((o) => o.id === card.data?.id && o.customerPhone.length > 0));

  const id = card.data?.id;
  const step = async (status) => call(`/api/staff/orders/${id}`, { method: 'PATCH', body: { status }, cookie });
  check('new → preparing', (await step('preparing')).status === 200);
  check('preparing → ready', (await step('ready')).status === 200);
  check('ready → collected', (await step('collected')).status === 200);
  check('collected cannot go back to preparing', (await step('preparing')).status === 409);

  const yocoPaid = seen.find((o) => o.id === yocoView?.id);
  const refund = await call(`/api/staff/orders/${yocoView?.id}`, { method: 'PATCH', body: { status: 'cancelled', note: 'Customer changed mind' }, cookie });
  check('cancelling a paid order marks a refund due', refund.status === 200 && refund.data?.order?.paymentStatus === 'refund_due', JSON.stringify(refund.data));
  check('yoco order was visible to staff', Boolean(yocoPaid));

  const manual = await call('/api/staff/orders', {
    method: 'POST',
    cookie,
    body: { channel: 'uber_eats', customerName: 'Uber Customer', customerPhone: '', externalRef: 'UE-TEST-1', lines: [{ key: 'item:fried-chips', qty: 2 }], notes: '' },
  });
  check('staff can log an Uber Eats order', manual.status === 201);
  const manualOrder = (await call(`/api/orders/${manual.data?.token}`)).data?.order;
  check('logged app order is marked external', manualOrder?.paymentMethod === 'external' && manualOrder?.paymentStatus === 'external');

  const soldOut = await call('/api/staff/items/pap', { method: 'PATCH', body: { available: false }, cookie });
  check('staff can mark a dish sold out', soldOut.status === 200 && soldOut.data?.item?.available === false);
  const blocked = await call('/api/orders', {
    method: 'POST',
    body: { channel: 'website', fulfilment: 'collection', pickup: pickupLater(15), customer, lines: [{ key: 'item:pap', qty: 1 }], payment: { method: 'counter' } },
  });
  check('sold-out dishes cannot be ordered (409)', blocked.status === 409 && /sold out/i.test(blocked.data?.error ?? ''), JSON.stringify(blocked.data));
  const menuAfter = await call('/api/menu');
  check('sold-out state shows on the menu', menuAfter.data?.categories.flatMap((c) => c.items).find((i) => i.id === 'pap')?.available === false);
  await call('/api/staff/items/pap', { method: 'PATCH', body: { available: true }, cookie });

  const priced = await call('/api/staff/items/pap', { method: 'PATCH', body: { priceCents: 1600 }, cookie });
  check('staff can change a price', priced.status === 200 && priced.data?.item?.priceCents === 1600);
  await call('/api/staff/items/pap', { method: 'PATCH', body: { priceCents: 1500 }, cookie });

  const newSpecial = await call('/api/staff/specials', {
    method: 'POST',
    cookie,
    body: { title: 'Test Special', description: 'Automated test', itemId: 'pap', priceCents: 1200, weekday: null, windowStart: null, windowEnd: null, active: true, sort: 99 },
  });
  check('staff can add a special', newSpecial.status === 201 && Boolean(newSpecial.data?.id));
  const sid = newSpecial.data?.id;
  const offSpecial = await call(`/api/staff/specials/${sid}`, { method: 'PATCH', body: { active: false }, cookie });
  check('staff can switch a special off', offSpecial.status === 200 && offSpecial.data?.special?.active === false);
  check('staff can delete a special', (await call(`/api/staff/specials/${sid}`, { method: 'DELETE', cookie })).status === 200);

  const settings = await call('/api/staff/settings', { cookie });
  check('settings expose 7 opening days', settings.data?.settings?.hours?.length === 7);
  const originalLinks = settings.data?.settings?.storeLinks;
  const saved = await call('/api/staff/settings', { method: 'PUT', cookie, body: { storeLinks: { ubereats: 'https://www.ubereats.com/za/store/heritage-bites-test', mrd: originalLinks.mrd } } });
  check('settings can be saved', saved.status === 200 && saved.data?.settings?.storeLinks?.ubereats.includes('heritage-bites-test'));
  await call('/api/staff/settings', { method: 'PUT', cookie, body: { storeLinks: originalLinks } });

  console.log('\nSocial media links');
  check('social links start blank', JSON.stringify(settings.data?.settings?.social) === JSON.stringify({ facebook: '', instagram: '', tiktok: '' }), JSON.stringify(settings.data?.settings?.social));
  const badSocial = await call('/api/staff/settings', { method: 'PUT', cookie, body: { social: { facebook: 'facebook.com/heritagebites', instagram: '', tiktok: '' } } });
  check('a social link without https:// is refused', badSocial.status === 422, `status ${badSocial.status}`);
  const wrongSite = await call('/api/staff/settings', { method: 'PUT', cookie, body: { social: { facebook: 'https://www.instagram.com/heritagebites-test', instagram: '', tiktok: '' } } });
  check('a Facebook field cannot hold a link to another site', wrongSite.status === 422, `status ${wrongSite.status}`);
  const goodSocial = await call('/api/staff/settings', {
    method: 'PUT',
    cookie,
    body: { social: { facebook: 'https://www.facebook.com/heritagebites-test', instagram: 'https://www.instagram.com/heritagebites-test', tiktok: '' } },
  });
  check('a full social link is saved', goodSocial.status === 200 && goodSocial.data?.settings?.social?.facebook.includes('heritagebites-test'));
  const homeWithSocial = await fetch(`${BASE}/`).then((r) => r.text());
  check('footer shows the Facebook and Instagram icons once their links are saved', homeWithSocial.includes('href="https://www.facebook.com/heritagebites-test"') && homeWithSocial.includes('href="https://www.instagram.com/heritagebites-test"'));
  check('the TikTok icon opens a TikTok search while its link is blank', homeWithSocial.includes('href="https://www.tiktok.com/search?q=Heritage%20Bites%20Pretoria"'));
  await call('/api/staff/settings', { method: 'PUT', cookie, body: { social: { facebook: '', instagram: '', tiktok: '' } } });
  const homeWithout = await fetch(`${BASE}/`).then((r) => r.text());
  check('icons go back to the searches once the links are cleared', !homeWithout.includes('heritagebites-test') && homeWithout.includes('href="https://www.facebook.com/search/top/?q=Heritage%20Bites%20Pretoria"'));

  console.log('\nEnquiries');
  const contact = await call('/api/messages', { method: 'POST', body: { type: 'contact', name: 'Test Visitor', phone: '0821234567', message: 'Do you have chakalaka today?' } });
  check('general enquiry is accepted', contact.status === 201 && contact.data?.reference?.length === 8);
  check('short enquiry is refused', (await call('/api/messages', { method: 'POST', body: { type: 'contact', name: 'Test', phone: '0821234567', message: 'Hi' } })).status === 422);
  const catering = await call('/api/messages', { method: 'POST', body: { type: 'catering', name: 'Event Host', phone: '0821234567', details: { eventDate: '2026-12-12', guests: '30', eventType: 'Birthday' } } });
  check('event enquiry is accepted', catering.status === 201);
  const table = await call('/api/messages', { method: 'POST', body: { type: 'table', name: 'Diner', phone: '0821234567', details: { date: '2026-10-20', time: '18:00', guests: '2' } } });
  check('table booking is accepted', table.status === 201);
  const lunch = await call('/api/messages', { method: 'POST', body: { type: 'lunch', name: 'Office Manager', email: 'office@example.co.za', details: { company: 'Test Co', people: '12' } } });
  check('office lunch enquiry is accepted', lunch.status === 201);
  check('specials sign-up needs consent', (await call('/api/messages', { method: 'POST', body: { type: 'subscribe', email: 'fan@example.com', consent: false } })).status === 422);
  check('specials sign-up with consent is accepted', (await call('/api/messages', { method: 'POST', body: { type: 'subscribe', email: 'fan@example.com', consent: true } })).status === 201);
  const inbox = await call('/api/staff/messages', { cookie });
  check('enquiries reach the staff inbox', (inbox.data?.messages ?? []).some((m) => m.type === 'contact' && m.body.includes('chakalaka')));
  const ourMessage = (inbox.data?.messages ?? []).find((m) => m.type === 'contact' && m.body.includes('chakalaka'));
  const handled = await call(`/api/staff/messages/${ourMessage?.id ?? 'missing'}`, { method: 'PATCH', body: { status: 'handled' }, cookie });
  check('enquiry can be marked handled', handled.status === 200 && handled.data?.status === 'handled');

  console.log('\nSession');
  const logout = await call('/api/staff/logout', { method: 'POST', cookie });
  check('logout clears the cookie', logout.status === 200 && /hb_staff=;|Max-Age=0/i.test(logout.setCookie ?? ''));
  const replay = await call('/api/staff/orders', { cookie });
  check('an ended session cannot be reused on the server', replay.status === 401, `status ${replay.status}`);

  const total = passes + failures;
  console.log(`\n${passes}/${total} checks passed${failures ? `, ${failures} failed` : ''}.`);
  process.exit(failures ? 1 : 0);
}

main().catch((error) => {
  console.error('Test run crashed:', error);
  process.exit(1);
});
