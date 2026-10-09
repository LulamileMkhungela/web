// Editable site copy. Facts come from heritagebites.co.za. The Vision, Mission and glossary
// wording is a draft for the owner to approve (see the staff launch checklist).

export const STORY_INTRO = [
  'Heritage Bites is a culturally inspired African restaurant and takeaway in Pretoria Central, serving authentic South African traditional meals in a clean, modern and welcoming environment.',
  'Our food celebrates rich flavours, familiar recipes and wholesome ingredients: from mogodu, tshotlo and samp to favourite takeaways and a warm breakfast porridge.',
] as const;

export const PROMISE_TEXT =
  'We bridge the gap between informal traditional food and formal restaurant dining by offering consistent quality, generous flavour and a proudly South African food experience. Whether you visit us for dine-in, collect a takeaway, or order through Mr D and Uber Eats, Heritage Bites makes traditional African food more convenient and accessible.';

/** Homepage photo carousel. Each photo is a real dish from the menu and links to its card. */
export const HERO_SLIDES = [
  {
    itemId: 'mogodu-samp',
    src: '/images/menu/mogodu-1.webp',
    alt: 'Mogodu, beef tripe, served in a bowl with pap',
  },
  {
    itemId: 'sphatlo-kota',
    src: '/images/menu/kota-2.webp',
    alt: 'A vendor building a loaded kota at a street stall',
  },
  {
    itemId: 'magwinya',
    src: '/images/menu/magwinya-2.webp',
    alt: 'Magwinya fat cakes dusted with sugar, beside a dish of syrup',
  },
  {
    itemId: 'tshotlo-pap',
    src: '/images/menu/tshotlo-1.webp',
    alt: 'Shredded beef tshotlo served with pap and relish',
  },
] as const;

export const VISION = {
  text: 'To make traditional African food a proud, everyday part of life in Pretoria: honest flavour, warm hospitality and a table that welcomes everyone.',
};

export const MISSION = {
  text: 'We serve authentic South African traditional meals with rich flavour, wholesome ingredients and true heritage, at consistent, fair value for everyday customers.',
  pillars: [
    {
      title: 'Authentic recipes',
      body: 'We cook South African traditional meals the way they are meant to be cooked: slowly, and with respect for the ingredients.',
    },
    {
      title: 'Wholesome ingredients',
      body: 'Rich flavour starts with good ingredients, served in generous portions on every plate.',
    },
    {
      title: 'Fair, consistent value',
      body: 'Comfort food should be good value every visit, whether you dine in, collect or order ahead.',
    },
    {
      title: 'Heritage in every bite',
      body: 'Every dish carries a story from a family kitchen. We share those stories with the people who eat with us.',
    },
  ],
};

/** The About page's "How we started" timeline. */
export const STORY_TIMELINE = [
  {
    label: 'Family kitchens',
    title: 'Recipes from family kitchens',
    body: 'Our journey began years earlier in family kitchens, where tradition, hospitality and great food brought people together.',
  },
  {
    label: '2025',
    title: 'Officially established',
    body: 'Heritage Bites was officially established in 2025, bringing traditional African food into a clean, modern and welcoming space.',
  },
  {
    label: 'Pretoria Central',
    title: 'Find us at 323 Sisulu Street',
    body: 'Our restaurant and takeaway in Pretoria Central welcomes dine-in guests and collection customers, with delivery through Mr D and Uber Eats.',
  },
  {
    label: 'Today',
    title: 'Order your way',
    body: 'Order from this website and pay by card, Yoco or at the counter. Prefer WhatsApp, Uber Eats or Mr D? Those are open to you too, and you can follow your order from kitchen to collection.',
  },
] as const;

/** Plain-language meanings of the menu's South African words. Draft for the owner to check. */
export const GLOSSARY = [
  { term: 'Mogodu', meaning: 'Beef tripe (stomach lining), slow-cooked until tender.' },
  { term: 'Tshotlo', meaning: 'Pounded beef, a traditional Setswana meal.' },
  { term: 'Tlhakwana', meaning: 'Beef trotters, simmered low and slow until tender.' },
  { term: 'Mabele', meaning: 'Sorghum, the grain behind our Motogo wa Mabele porridge.' },
  { term: 'Motogo wa Mabele', meaning: 'Warm sorghum porridge, a traditional way to start the day.' },
  { term: 'Samp', meaning: 'Dried maize kernels cooked soft, often with sugar beans.' },
  { term: 'Pap', meaning: 'Maize porridge, the staple that sits beside many traditional plates.' },
  { term: 'Magwinya', meaning: 'Fat cakes: golden fried dough, a street-food favourite.' },
  { term: 'Kota', meaning: 'A quarter loaf of bread, hollowed out and filled. It is a Soweto street-food classic.' },
  { term: 'Atchaar', meaning: 'Tangy, spiced pickled vegetables with Indian South African roots.' },
  { term: 'Chakalaka', meaning: 'A spicy tomato, bean and vegetable relish, a Soweto staple.' },
] as const;

export const FAQ = [
  {
    q: 'Where are you?',
    a: '323 Sisulu Street, Pretoria Central, Pretoria, 0002. Directions are on this page under “Visit or call”.',
  },
  {
    q: 'How can I order?',
    a: 'Order on this website for collection, send your order on WhatsApp, or order for delivery through Uber Eats or Mr D.',
  },
  {
    q: 'How do I pay?',
    a: 'Pay by debit card or Yoco at checkout, or pay at the counter when you collect your order.',
  },
  {
    q: 'Do you deliver?',
    a: 'Delivery is available through Mr D and Uber Eats. Dine-in and takeaway are available at our Pretoria Central restaurant.',
  },
  {
    q: 'Can I order ahead?',
    a: 'Yes. Choose a collection time at checkout. Times stay within our opening hours.',
  },
  {
    q: 'Are prices VAT-inclusive?',
    a: 'Yes. Every price includes VAT at 15%, and the VAT amount is shown on your order.',
  },
  {
    q: 'Can you cater an event or office lunch?',
    a: 'Send an enquiry on this page with the date and number of guests, and we will confirm what we can offer.',
  },
] as const;

export const SEARCH_SUGGESTIONS = ['Mogodu', 'Kota', 'Magwinya', 'Samp', 'Motogo', 'Chicken', 'Pap', 'Chakalaka'];
