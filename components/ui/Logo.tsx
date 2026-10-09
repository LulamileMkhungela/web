import Link from 'next/link';

export function Logo({ tone = 'navy', className = '', compact = false }: { tone?: 'navy' | 'light'; className?: string; compact?: boolean }) {
  const title = tone === 'light' ? 'text-cream' : 'text-navy';
  return (
    <Link href="/" className={`inline-flex items-center gap-3 no-underline ${className}`} aria-label="Heritage Bites home">
      <svg viewBox="0 0 64 64" aria-hidden="true" className={`${compact ? 'h-9 w-9' : 'h-11 w-11'} shrink-0`}>
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
      <span className="flex flex-col leading-none">
        <span className={`whitespace-nowrap font-display font-extrabold tracking-tight ${compact ? 'text-[1.1rem] sm:text-[1.32rem]' : 'text-[1.32rem]'} ${title}`}>Heritage Bites</span>
        <span
          className={`mt-1 whitespace-nowrap text-[0.58rem] font-semibold uppercase tracking-[0.3em] ${compact ? 'hidden' : ''} ${tone === 'light' ? 'text-ochre-bright' : 'text-ochre-deep'}`}
        >
          Restaurant &amp; Takeaway
        </span>
      </span>
    </Link>
  );
}
