'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-cream"
    >
      Print ticket
    </button>
  );
}
