'use client';

import { useEffect } from 'react';
import { useKiosk } from '@/components/features/entry/hooks/useKiosk';
import { RetroButton } from './RetroButton';
import { useDAppKit } from '@mysten/dapp-kit-react';

interface RetroKioskSelectorProps {
  onKioskChange?: (kioskId: string | null, kioskCapId: string | null) => void;
  compact?: boolean;
}

export function RetroKioskSelector({ onKioskChange, compact = false }: RetroKioskSelectorProps) {
  const {
    kiosks,
    selectedKiosk,
    isLoading,
    error,
    fetchUserKiosks,
    createKiosk,
    selectKiosk,
  } = useKiosk();
  const dAppKit = useDAppKit();

  useEffect(() => {
    if (onKioskChange) {
      onKioskChange(selectedKiosk?.kioskId || null, selectedKiosk?.kioskCapId || null);
    }
  }, [selectedKiosk, onKioskChange]);

  const handleCreateKiosk = async () => {
    try {
      const tx = await createKiosk();
      if (!tx) return;

      try {
        await dAppKit.signAndExecuteTransaction({ transaction: tx });
        setTimeout(() => {
          fetchUserKiosks();
        }, 2000);
      } catch (error) {
        console.error('Failed to create kiosk:', error);
      }
    } catch (err) {
      console.error('Error in handleCreateKiosk:', err);
    }
  };

  const formatKioskId = (id: string) => {
    if (id.length <= 16) return id;
    return compact ? `${id.slice(0, 6)}...${id.slice(-4)}` : `${id.slice(0, 10)}...${id.slice(-6)}`;
  };

  if (isLoading) {
    return (
      <div className="text-muted-foreground text-xs font-mono animate-pulse">Loading Kiosks...</div>
    );
  }

  if (error) {
    return <div className="text-red-600 dark:text-red-400 text-xs font-mono">{error}</div>;
  }

  if (kiosks.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground text-xs font-mono">No Kiosk found</p>
        <RetroButton variant="primary" size="sm" onClick={handleCreateKiosk} className="w-full">
          Create Kiosk
        </RetroButton>
      </div>
    );
  }

  const optionStyle = {
    backgroundColor: 'var(--panel-deep)',
    color: 'var(--foreground)',
    fontFamily: 'monospace',
  } as const;

  return (
    <div className={compact ? 'flex gap-1' : 'space-y-2'}>
      <select
        value={selectedKiosk?.kioskId || ''}
        onChange={(e) => {
          const kiosk = kiosks.find((k) => k.kioskId === e.target.value);
          if (kiosk) selectKiosk(kiosk);
        }}
        className={`
          ${compact ? 'flex-1' : 'w-full'}
          publisher-input-embed text-xs px-2 py-2 font-mono
          outline-none transition-shadow cursor-pointer text-foreground
        `}
      >
        {kiosks.map((kiosk) => (
          <option key={kiosk.kioskId} value={kiosk.kioskId} style={optionStyle}>
            {formatKioskId(kiosk.kioskId)} ({kiosk.itemCount} items)
          </option>
        ))}
      </select>

      {!compact && (
        <RetroButton variant="secondary" size="sm" onClick={handleCreateKiosk} className="w-full">
          + New Kiosk
        </RetroButton>
      )}
    </div>
  );
}
