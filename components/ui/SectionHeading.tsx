import type { ReactNode } from 'react';

/** Section heading: small caps kicker, script line, then the title. Shared by every section. */
export function SectionHeading({
  kicker,
  script,
  title,
  children,
  align = 'left',
  light = false,
  id,
}: {
  kicker?: string;
  script?: string;
  title: string;
  children?: ReactNode;
  align?: 'left' | 'center';
  light?: boolean;
  id?: string;
}) {
  const alignClass = align === 'center' ? 'mx-auto text-center items-center' : 'items-start';
  return (
    <header className={`flex max-w-3xl flex-col gap-3 ${alignClass}`}>
      {kicker ? <p className={light ? 'kicker kicker-light' : 'kicker'}>{kicker}</p> : null}
      {script ? <p className={light ? 'eyebrow eyebrow-light' : 'eyebrow'}>{script}</p> : null}
      <h2 id={id} className={`text-[clamp(2rem,3.6vw,3.1rem)] font-bold ${light ? 'text-cream' : 'text-navy'}`}>
        {title}
      </h2>
      {children ? (
        <div className={`text-[1.02rem] leading-[1.75] ${light ? 'text-cream/80' : 'text-body'}`}>{children}</div>
      ) : null}
    </header>
  );
}
