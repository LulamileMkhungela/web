import Link from 'next/link';
import { whatsappLink } from '@/lib/whatsapp';

type Card = {
  title: string;
  body: string;
  cta: string;
  href: string;
  external: boolean;
};

/** Four ways to order, each one step from this page. */
export function HowToOrder({ storeLinks, whatsapp }: { storeLinks: { ubereats: string; mrd: string }; whatsapp: string }) {
  const cards: Card[] = [
    {
      title: 'Order here',
      body: 'Add dishes to your cart, choose a collection time and pay by debit card, Yoco or at the counter.',
      cta: 'Start your order',
      href: '/menu',
      external: false,
    },
    {
      title: 'WhatsApp',
      body: 'Send your order to us on WhatsApp. We confirm your collection time and how you pay.',
      cta: 'Chat on WhatsApp',
      href: whatsappLink('Hi Heritage Bites, I would like to place an order.', whatsapp),
      external: true,
    },
    {
      title: 'Uber Eats',
      body: 'Get your order delivered through Uber Eats.',
      cta: 'Order on Uber Eats',
      href: storeLinks.ubereats,
      external: true,
    },
    {
      title: 'Mr D',
      body: 'Get your order delivered through Mr D.',
      cta: 'Order on Mr D',
      href: storeLinks.mrd,
      external: true,
    },
  ];

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <li key={card.title} className="flex h-full flex-col rounded-3xl border border-white/10 bg-navy-soft p-6 sm:p-7">
          <h3 className="text-2xl font-bold text-cream">{card.title}</h3>
          <p className="mt-3 flex-1 leading-relaxed text-cream/85">{card.body}</p>
          {card.external ? (
            <a href={card.href} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-block mt-7">
              {card.cta}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Link href={card.href} className="btn btn-primary btn-block mt-7">
              {card.cta}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
