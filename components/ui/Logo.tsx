import Link from 'next/link';

type LogoProps = {
  /** Path to the owner's logo file (from public/brand). When null, a placeholder mark is shown. */
  src?: string | null;
  href?: string;
  className?: string;
  tone?: 'navy' | 'light';
};

export function Logo({ src = null, href = '/', className = '', tone = 'navy' }: LogoProps) {
  if (src) {
    return (
      <Link href={href} aria-label="Heritage Bites home" className={`inline-flex shrink-0 items-center no-underline ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Heritage Bites" className="h-11 w-auto max-w-[11rem] object-contain sm:h-12" />
      </Link>
    );
  }
  const title = tone === 'light' ? 'text-cream' : 'text-navy';
  const sub = tone === 'light' ? 'text-ochre-bright' : 'text-ochre-deep';
  return (
    <Link href={href} aria-label="Heritage Bites home" className={`inline-flex min-w-0 items-center gap-3 no-underline ${className}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true" className="h-10 w-10 shrink-0 sm:h-11 sm:w-11">
        <circle cx="32" cy="32" r="31" fill="#B77E23" />
        <path d="M14 33h36c0 9.4-7.9 16-18 16S14 42.4 14 33z" fill="#F8F4EC" />
        <path
          d="M23 27c0-3.2 2.2-4.4 2.2-7.6M32 27c0-3.2 2.2-4.4 2.2-7.6M41 27c0-3.2 2.2-4.4 2.2-7.6"
          stroke="#F8F4EC"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
      <span className="flex min-w-0 flex-col leading-none">
        <span className={`truncate font-display text-[1.15rem] font-bold tracking-tight sm:text-[1.3rem] ${title}`}>Heritage Bites</span>
        <span className={`mt-1 hidden whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.28em] md:block ${sub}`}>
          Restaurant &amp; Takeaway
        </span>
      </span>
    </Link>
  );
}
