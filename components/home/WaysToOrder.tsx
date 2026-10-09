import Link from 'next/link';
import { Bike, MessageCircle, ShoppingBag, Truck } from 'lucide-react';
import { BRAND } from '@/lib/config';
import { whatsappLink } from '@/lib/whatsapp';
import { SectionHeading } from '@/components/ui/SectionHeading';
import type { ContactSettings, StoreLinks } from '@/lib/types';

export function WaysToOrder({ storeLinks, contact }: { storeLinks: StoreLinks; contact: ContactSettings }) {
  const waNumber = contact.whatsapp.replace(/\D/g, '') || BRAND.whatsappNumber;
  const channels = [
    {
      icon: ShoppingBag,
      title: 'Order online',
      body: 'Build your basket, choose a pickup time and pay by debit card, Yoco or at the counter.',
      cta: 'Start your order',
      href: '/menu',
      external: false,
    },
    {
      icon: MessageCircle,
      title: 'Order on WhatsApp',
      body: 'Prefer a chat? Message us and we will confirm your order, pickup time and payment.',
      cta: 'Chat on WhatsApp',
      href: whatsappLink('Hi Heritage Bites, I would like to place an order.', waNumber),
      external: true,
    },
    {
      icon: Bike,
      title: 'Uber Eats',
      body: 'Get your meal delivered through Uber Eats. Find us there and add your favourites.',
      cta: 'Order on Uber Eats',
      href: storeLinks.ubereats,
      external: true,
    },
    {
      icon: Truck,
      title: 'Mr D',
      body: 'Get your meal delivered through Mr D. Find us there and add your favourites.',
      cta: 'Order on Mr D',
      href: storeLinks.mrd,
      external: true,
    },
  ];
  return (
    <section aria-labelledby="ways-to-order" className="mx-auto w-full max-w-[1240px] px-5 py-24 sm:px-8">
      <SectionHeading
        id="ways-to-order"
        kicker="Four ways to eat with us"
        script="Your table, your way"
        title="Order however suits you"
      >
        <p>Collect from our restaurant, eat in, or have us deliver through the apps you already use.</p>
      </SectionHeading>
      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {channels.map((c) => {
          const Icon = c.icon;
          return (
            <article key={c.title} className="card group flex flex-col gap-5 p-7 transition-transform duration-300 hover:-translate-y-1">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-ochre-bright transition-colors group-hover:bg-ochre group-hover:text-navy">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-2xl font-bold text-navy">{c.title}</h3>
              <p className="text-[0.95rem] leading-relaxed">{c.body}</p>
              <div className="mt-auto pt-2">
                {c.external ? (
                  <a
                    href={c.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm w-full"
                    aria-label={`${c.cta} (opens in new tab)`}
                  >
                    {c.cta}
                  </a>
                ) : (
                  <Link href={c.href} className="btn btn-outline btn-sm w-full">
                    {c.cta}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
