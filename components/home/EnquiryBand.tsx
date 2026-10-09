import Link from 'next/link';
import { Briefcase, CalendarHeart, Table2 } from 'lucide-react';

/** Three enquiry routes. Each one opens the single contact form with its topic already chosen. */
export function EnquiryBand() {
  const items = [
    {
      icon: CalendarHeart,
      title: 'Event enquiry',
      body: 'Birthdays, family gatherings, Heritage Day and other events. Tell us the date and number of guests and we will confirm what we can offer.',
      href: '/contact?topic=catering',
      cta: 'Send an event enquiry',
    },
    {
      icon: Briefcase,
      title: 'Office lunch plan',
      body: 'Feed your team from our menu. Tell us your company, the number of people and the days you need lunch.',
      href: '/contact?topic=catering',
      cta: 'Ask about office lunches',
    },
    {
      icon: Table2,
      title: 'Book a table',
      body: 'Request a table for dine-in. Tell us the date, time and number of guests, and we will reply to confirm.',
      href: '/contact?topic=table',
      cta: 'Request a table',
    },
  ];
  return (
    <section aria-labelledby="enquiries-heading" className="grain relative overflow-hidden bg-navy text-cream">
      <div className="band-zigzag absolute inset-x-0 top-0 opacity-70" aria-hidden="true" />
      <div className="container-hb py-16 md:py-24">
        <div className="max-w-2xl">
          <p className="kicker kicker-light">Beyond the counter</p>
          <p className="eyebrow eyebrow-light mt-2">Let’s plan something together</p>
          <h2 id="enquiries-heading" className="mt-3 text-[clamp(2rem,3.6vw,3rem)] font-bold text-cream">
            Events, offices and tables
          </h2>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="flex flex-col gap-5 rounded-[1.75rem] border border-cream/12 bg-navy-soft/50 p-7"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ochre-bright text-navy">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-2xl font-bold text-cream">{item.title}</h3>
                <p className="text-[0.95rem] leading-relaxed text-cream/75">{item.body}</p>
                <Link href={item.href} className="btn btn-ghost-light btn-sm mt-auto self-start">
                  {item.cta}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
