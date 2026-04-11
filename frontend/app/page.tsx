'use client';

import dynamic from 'next/dynamic';

const HomeClient = dynamic(() => import('./HomeClient'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[var(--background,#0a0a0a)] flex items-center justify-center font-mono text-sm text-[var(--muted-foreground,#888)]">
      Loading…
    </div>
  ),
});

export default function Home() {
  return <HomeClient />;
}
