'use client';

import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const AppShell = dynamic(() => import('./AppShell').then((m) => m.AppShell), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[var(--background,#0a0a0a)]" aria-hidden />
  ),
});

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AppShell>{children}</AppShell>
    </QueryClientProvider>
  );
}
