import { FAQ } from '@/lib/content';

export function FaqList() {
  return (
    <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
      {FAQ.map((item) => (
        <details key={item.q} className="group p-5 sm:p-6">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-navy [&::-webkit-details-marker]:hidden">
            {item.q}
            <span
              aria-hidden="true"
              className="text-2xl font-normal leading-none text-ochre-deep transition-transform group-open:rotate-45"
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
