import type { ReactNode } from 'react';

// Payment pages use their own minimal layout, like a hosted checkout page.
export default function PayLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
