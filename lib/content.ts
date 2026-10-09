// Editable site copy. Facts come from heritagebites.co.za. Vision and Mission are drafts
// written for the owner to approve (see the staff launch checklist).

export const STORY_INTRO = [
  'Heritage Bites is a culturally inspired African restaurant and takeaway in Pretoria Central, serving authentic South African traditional meals in a clean, modern and welcoming environment.',
  'Our food celebrates rich flavours, familiar recipes and wholesome ingredients: from mogodu, tshotlo and samp to favourite takeaways and a warm breakfast porridge.',
  'We bridge the gap between informal traditional food and formal restaurant dining, with consistent quality and generous portions.',
] as const;

export const HOW_WE_STARTED = [
  'Heritage Bites was born from a lifelong passion for cooking and celebrating the rich flavours of African cuisine.',
  'While the business was officially established in 2025, our journey began years earlier in family kitchens, where tradition, hospitality and great food brought people together.',
  'Today we proudly continue that tradition, serving comforting and authentic meals.',
] as const;

export const STORY_TEASER =
  'Heritage Bites was born from a lifelong passion for cooking and celebrating the rich flavours of African cuisine. Our journey began in family kitchens, and today we carry that tradition to Pretoria Central.';

export const WHY_CHOOSE_US = [
  { title: 'Authentic flavours', body: 'Traditional South African recipes, from mogodu and samp to kota and magwinya.' },
  { title: 'Fresh ingredients', body: 'Wholesome ingredients go into every plate.' },
  { title: 'Convenient ordering', body: 'Visit us, order takeaway or enjoy delivery through Mr D and Uber Eats.' },
  { title: 'Great value', body: 'Generous portions, affordable pricing and meals that keep customers coming back.' },
] as const;

export const VISION = {
  text:
    'To make traditional African food a proud, everyday part of life in Pretoria: honest flavour, warm hospitality and a table that welcomes everyone.',
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
};

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
