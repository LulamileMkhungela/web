import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/ui/Icons';
import type { SocialLinks } from '@/lib/types';

const BUSINESS = 'Heritage Bites Pretoria';

/**
 * Facebook, Instagram and TikTok icons. A page link saved in staff Settings (a full https:// link on the
 * network's own domain) takes the visitor to the business's own page. Until a link is saved, the icon opens
 * a search for the business on that platform, so no account is ever invented.
 */
const NETWORKS = [
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon, search: `https://www.facebook.com/search/top/?q=${encodeURIComponent(BUSINESS)}` },
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon, search: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(BUSINESS)}` },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon, search: `https://www.tiktok.com/search?q=${encodeURIComponent(BUSINESS)}` },
] as const;

/** Only a full https:// link counts as the business's own page. */
function isPageLink(value: string): boolean {
  return /^https:\/\/\S+$/i.test(value.trim());
}

export function SocialIcons({ social, tone = 'light' }: { social: SocialLinks; tone?: 'light' | 'dark' }) {
  const base =
    tone === 'light'
      ? 'border-cream/30 text-cream hover:bg-cream hover:text-navy'
      : 'border-navy/20 text-navy hover:bg-navy hover:text-cream';
  return (
    <ul className="flex flex-wrap gap-3">
      {NETWORKS.map(({ key, label, Icon, search }) => {
        const ownPage = isPageLink(social[key]);
        return (
          <li key={key}>
            <a
              href={ownPage ? social[key].trim() : search}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${base}`}
            >
              <Icon className="h-5 w-5" />
              <span className="sr-only">
                {ownPage ? `${label} (opens in a new tab)` : `Search ${label} for ${BUSINESS} (opens in a new tab)`}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
