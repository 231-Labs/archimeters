'use client';

import { DAppKitProvider } from '@mysten/dapp-kit-react';
import { dAppKit } from '@/lib/dapp-kit';

export function AppShell({ children }: { children: React.ReactNode }) {
  return <DAppKitProvider dAppKit={dAppKit}>{children}</DAppKitProvider>;
}
