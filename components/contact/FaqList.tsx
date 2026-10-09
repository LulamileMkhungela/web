import { FAQ } from '@/lib/content';

/** Accessible accordion built on native details/summary, so it works without JavaScript. */
export function FaqList() {
  return (
    <div className="divide-y divide-navy/10 rounded-[1.75rem] border border-navy/10 bg-white">
      {FAQ.map((item, i) => (
        <details key={item.q} className="group px-6 py-5 open:bg-cream/60" open={i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold text-navy marker:content-none">
            {item.q}
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/5 text-navy transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl leading-relaxed">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
