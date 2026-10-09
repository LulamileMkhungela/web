import Link from 'next/link';
import { Bike, MessageCircle, ShoppingBag, Truck } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ContactSettings, StoreLinks } from '@/lib/types';
import { whatsappLink } from '@/lib/whatsapp';

/** Four ways to order. Each card is one step: the website, WhatsApp, Uber Eats or Mr D. */
export function WaysToOrder({ storeLinks, contact }: { storeLinks: StoreLinks; contact: ContactSettings }) {
  const channels = [
    {
      icon: ShoppingBag,
      title: 'Order online',
      body: 'Build your basket, choose a collection time and pay by debit card, Yoco or at the counter.',
      cta: 'Start your order',
      href: '/menu',
      external: false,
    },
    {
      icon: MessageCircle,
      title: 'Order on WhatsApp',
      body: 'Prefer a chat? Message us and we will confirm your order, collection time and payment.',
      cta: 'Chat on WhatsApp',
      href: whatsappLink('Hi Heritage Bites, I would like to place an order.', contact.whatsapp),
      external: true,
    },
    {
      icon: Bike,
      title: 'Uber Eats',
      body: 'Get your order delivered through Uber Eats.',
      cta: 'Order on Uber Eats',
      href: storeLinks.ubereats,
      external: true,
    },
    {
      icon: Truck,
      title: 'Mr D',
      body: 'Get your order delivered through Mr D.',
      cta: 'Order on Mr D',
      href: storeLinks.mrd,
      external: true,
    },
  ];
  return (
    <section aria-labelledby="ways-to-order" className="container-hb py-16 md:py-24">
      <SectionHeading id="ways-to-order" kicker="Four ways to eat with us" script="Your meal, your way" title="Order however suits you">
        <p>Collect from our restaurant, eat in, or have us deliver through the apps you already use.</p>
      </SectionHeading>
      <ul className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <li
              key={channel.title}
              className="card group flex flex-col gap-5 p-7 transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-ochre-bright transition-colors group-hover:bg-ochre group-hover:text-navy">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-2xl font-bold text-navy">{channel.title}</h3>
              <p className="text-[0.95rem] leading-relaxed">{channel.body}</p>
              <div className="mt-auto pt-2">
                {channel.external ? (
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm w-full"
                  >
                    {channel.cta}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ) : (
                  <Link href={channel.href} className="btn btn-outline btn-sm w-full">
                    {channel.cta}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
