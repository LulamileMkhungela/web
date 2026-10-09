// Editable site copy. Facts are taken from heritagebites.co.za; anything marked
// "draft" must be confirmed by the owner (see the staff launch checklist).

export const HERO_SLIDES = [
  {
    src: '/images/menu/mogodu-1.webp',
    alt: 'A bowl of slow-cooked mogodu (beef tripe) beside a serving of pap',
    caption: 'Mogodu & Samp',
    itemId: 'mogodu-samp',
  },
  {
    src: '/images/menu/kota-2.webp',
    alt: 'A street vendor building a loaded kota sandwich',
    caption: 'Sphatlo Kota',
    itemId: 'sphatlo-kota',
  },
  {
    src: '/images/menu/motogo-2.webp',
    alt: 'Warm sorghum porridge topped with blueberries in a bowl',
    caption: 'Motogo wa Mabele',
    itemId: 'motogo-mabele',
  },
  {
    src: '/images/menu/magwinya-3.webp',
    alt: 'Golden magwinya fat cakes dusted with sugar on a plate',
    caption: 'Magwinya',
    itemId: 'magwinya',
  },
] as const;

export const CATEGORY_TILES = [
  { id: 'traditional', image: '/images/menu/tshotlo-1.webp', alt: 'Shredded beef tshotlo served with pap' },
  { id: 'hearty', image: '/images/menu/braai-ribs-1.webp', alt: 'Beef ribs and boerewors on a braai grill' },
  { id: 'popular', image: '/images/menu/braai-wings-1.webp', alt: 'Seasoned chicken pieces cooking over coals' },
  { id: 'fastfood', image: '/images/menu/chips-2.webp', alt: 'Slap chips wrapped in newspaper with tomato sauce' },
  { id: 'breakfast', image: '/images/menu/motogo-1.webp', alt: 'Sorghum porridge with fresh figs' },
  { id: 'sides', image: '/images/menu/chakalaka-1.webp', alt: 'A bowl of chakalaka relish' },
] as const;

export const VISION = {
  text:
    'To make traditional African food a proud, everyday part of life in Pretoria: honest flavour, warm hospitality and a table that welcomes everyone.',
  status: 'draft',
};

export const MISSION = {
  text:
    'We serve authentic South African traditional meals with rich flavour, wholesome ingredients and true heritage, at consistent, fair value for everyday customers.',
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
  status: 'draft',
};

export const STORY_TIMELINE = [
  {
    label: 'Family kitchens',
    title: 'Recipes cooked at home',
    body: 'Heritage Bites has its roots in family kitchens, where dishes like mogodu, tshotlo and samp were cooked slowly and shared at the table.',
  },
  {
    label: '2025',
    title: 'Officially established',
    body: 'Heritage Bites was officially established in 2025, bringing traditional African food into a clean, modern and welcoming space.',
  },
  {
    label: 'Pretoria Central',
    title: 'Opening our doors at 323 Sisulu Street',
    body: 'Our restaurant and takeaway in Pretoria Central welcomes dine-in guests and collection customers, with delivery through Mr D and Uber Eats.',
  },
  {
    label: 'Today',
    title: 'Order your way',
    body: 'Order from this website and pay by card, Yoco or at the counter. Prefer WhatsApp, Uber Eats or Mr D? Those are open to you too, and you can follow your order from kitchen to collection.',
  },
] as const;

export const GLOSSARY = [
  { term: 'Mogodu', meaning: 'Beef tripe (stomach lining), slow-cooked until tender. It is the heart of the Mogodu Monday tradition.' },
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
  { term: 'Mogodu Monday', meaning: 'A township tradition of eating mogodu on a Monday.' },
] as const;

export const FAQ = [
  {
    q: 'Where are you?',
    a: '323 Sisulu Street, Pretoria Central, Pretoria, 0002. Use the map on our Contact page for directions.',
  },
  {
    q: 'How can I order?',
    a: 'Order on this website for collection or dine-in, send your basket on WhatsApp, or order through Uber Eats or Mr D.',
  },
  {
    q: 'How do I pay?',
    a: 'Choose a debit card or Yoco at checkout, or pay at the counter when you collect your order.',
  },
  {
    q: 'Do you deliver?',
    a: 'Delivery is available through Mr D and Uber Eats. Dine-in and takeaway are available at our Pretoria Central restaurant.',
  },
  {
    q: 'Can I order ahead?',
    a: 'Yes. Pick a pickup time at checkout. Times are offered within our opening hours and allow for kitchen preparation.',
  },
  {
    q: 'Are prices VAT-inclusive?',
    a: 'Yes. Every price on this site includes VAT at 15%, and the VAT amount is shown on your order summary.',
  },
  {
    q: 'Something wrong with my order?',
    a: 'Tell us straight away on WhatsApp or by phone, and we will put it right.',
  },
  {
    q: 'Can you help with an event or office lunch?',
    a: 'Send us an enquiry from the Contact page with the date and number of guests. We will confirm what we can offer.',
  },
] as const;

export const ORDERING_CHANNELS = [
  {
    id: 'website',
    title: 'Order online',
    body: 'Build your basket, pick a pickup time and pay by debit card, Yoco or at the counter.',
    cta: 'Start your order',
    href: '/menu',
  },
  {
    id: 'whatsapp',
    title: 'Order on WhatsApp',
    body: 'Prefer a chat? Send your basket to our WhatsApp and we will confirm your order and payment.',
    cta: 'Send basket on WhatsApp',
    href: '/checkout?channel=whatsapp',
  },
  {
    id: 'ubereats',
    title: 'Uber Eats',
    body: 'Get delivery through Uber Eats. Your basket opens in Uber Eats so you can add the same meals there.',
    cta: 'Order on Uber Eats',
    href: 'ubereats',
  },
  {
    id: 'mrd',
    title: 'Mr D',
    body: 'Get delivery through Mr D. Your basket opens in Mr D so you can add the same meals there.',
    cta: 'Order on Mr D',
    href: 'mrd',
  },
] as const;

export const SEARCH_SUGGESTIONS = ['Mogodu', 'Kota', 'Magwinya', 'Samp & beans', 'Motogo', 'Chicken', 'Pap', 'Chakalaka'];
