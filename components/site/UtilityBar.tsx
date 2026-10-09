import Link from 'next/link';
import { Clock, MessageCircle, Phone } from 'lucide-react';
import { BRAND } from '@/lib/config';
import { whatsappLink } from '@/lib/whatsapp';
import type { ContactSettings } from '@/lib/types';

export function UtilityBar({
  status,
  contact,
}: {
  status: { isOpen: boolean; label: string; detail: string };
  contact: ContactSettings;
}) {
  const waNumber = contact.whatsapp.replace(/\D/g, '') || BRAND.whatsappNumber;
  const tel = `tel:+${contact.phone.replace(/\D/g, '') || BRAND.phoneTel.replace('+', '')}`;
  return (
    <div className="no-print bg-navy text-cream/85">
      <div className="mx-auto flex w-full max-w-[1240px] items-center justify-between gap-4 px-5 py-2.5 text-[0.78rem] sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={`inline-block h-2 w-2 shrink-0 rounded-full ${status.isOpen ? 'bg-[#6fd29a] shadow-[0_0_0_4px_rgba(111,210,154,0.18)]' : 'bg-cream/40'}`}
          />
          <Clock className="hidden h-3.5 w-3.5 shrink-0 text-ochre-bright sm:block" aria-hidden="true" />
          <span className="truncate">
            <span className="font-semibold text-cream">{status.label}</span>
            <span className="text-cream/70"> · {status.detail}</span>
          </span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          <span>{BRAND.street}, {BRAND.suburb}</span>
          <a href={tel} className="inline-flex items-center gap-1.5 text-cream no-underline hover:text-ochre-bright">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {contact.phone}
          </a>
          <a
            href={whatsappLink(undefined, waNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-cream no-underline hover:text-ochre-bright"
          >
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            WhatsApp (opens in new tab)
          </a>
        </div>
        <Link
          href="/menu"
          className="inline-flex shrink-0 items-center rounded-full bg-ochre px-4 py-1.5 font-semibold text-navy no-underline transition-colors hover:bg-ochre-bright"
        >
          Order now
        </Link>
      </div>
    </div>
  );
}
