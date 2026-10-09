import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/ui/Icons';
import type { SocialLinks } from '@/lib/types';

const NETWORKS = [
  { key: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  { key: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  { key: 'tiktok', label: 'TikTok', Icon: TikTokIcon },
] as const;

/** Only a full https:// link counts. Blank or incomplete links are never shown. */
function isLink(value: string): boolean {
  return /^https:\/\/\S+$/i.test(value.trim());
}

export function hasSocialLinks(social: SocialLinks): boolean {
  return NETWORKS.some((network) => isLink(social[network.key]));
}

/**
 * Facebook, Instagram and TikTok icons. An icon appears only when its link is saved in staff Settings,
 * so the site never shows an empty or made-up account.
 */
export function SocialIcons({ social, tone = 'light' }: { social: SocialLinks; tone?: 'light' | 'dark' }) {
  const shown = NETWORKS.filter((network) => isLink(social[network.key]));
  if (shown.length === 0) return null;
  const base =
    tone === 'light'
      ? 'border-cream/30 text-cream hover:bg-cream hover:text-navy'
      : 'border-navy/20 text-navy hover:bg-navy hover:text-cream';
  return (
    <ul className="flex flex-wrap gap-3">
      {shown.map(({ key, label, Icon }) => (
        <li key={key}>
          <a
            href={social[key].trim()}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${base}`}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">
              {label} (opens in a new tab)
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
