import type { ReactNode } from 'react';

/** Navy title band used at the top of every inner page, so headings align the same way everywhere. */
export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <section className="grain relative overflow-hidden bg-navy text-cream">
      <div className="container-hb pb-14 pt-12 md:pb-16 md:pt-16">
        <p className="kicker kicker-light">{kicker}</p>
        <h1 className="mt-3 max-w-3xl text-[clamp(2.4rem,5vw,3.6rem)] font-bold text-cream">{title}</h1>
        {children ? <div className="mt-5 max-w-2xl text-lg leading-relaxed text-cream/85">{children}</div> : null}
      </div>
      <div aria-hidden="true" className="band-stripe" />
    </section>
  );
}
