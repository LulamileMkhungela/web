import { BRAND, SITE_URL } from '@/lib/config';
import { LONG_DAYS } from '@/lib/config';
import { fromMinutes, toMinutes } from '@/lib/time';
import type { ContactSettings, Hours } from '@/lib/types';

/** Schema.org Restaurant data so search engines can show address, hours and phone. */
export function JsonLd({ hours, contact }: { hours: Hours; contact: ContactSettings }) {
  const openingHoursSpecification = hours.flatMap((day, index) =>
    day
      ? [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: LONG_DAYS[index],
            opens: fromMinutes(toMinutes(day.open)),
            closes: fromMinutes(toMinutes(day.close)),
          },
        ]
      : [],
  );
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: BRAND.name,
    description: BRAND.description,
    url: SITE_URL,
    telephone: contact.phone,
    email: contact.email,
    servesCuisine: ['South African', 'African'],
    priceRange: 'R',
    currenciesAccepted: 'ZAR',
    paymentAccepted: 'Debit card, Yoco, Cash',
    address: {
      '@type': 'PostalAddress',
      streetAddress: BRAND.street,
      addressLocality: BRAND.city,
      addressRegion: BRAND.region,
      postalCode: BRAND.postcode,
      addressCountry: BRAND.country,
    },
    hasMenu: `${SITE_URL}/menu`,
    openingHoursSpecification,
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
