import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Staff console',
  robots: { index: false, follow: false },
};

export default function StaffLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-cream">{children}</div>;
}
