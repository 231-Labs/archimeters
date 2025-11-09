'use client';

import { useEffect } from 'react';
import { useKiosk } from '@/components/features/entry/hooks/useKiosk';
import { RetroButton } from './RetroButton';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';

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
    selectKiosk 
  } = useKiosk();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  useEffect(() => {
    if (onKioskChange) {
      onKioskChange(
        selectedKiosk?.kioskId || null,
        selectedKiosk?.kioskCapId || null
      );
    }
  }, [selectedKiosk, onKioskChange]);

  const handleCreateKiosk = async () => {
    try {
      const tx = await createKiosk();
      if (!tx) return;

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: async () => {
            setTimeout(() => {
              fetchUserKiosks();
            }, 2000);
          },
          onError: (error) => {
            console.error('Failed to create kiosk:', error);
          }
        }
      );
    } catch (err) {
      console.error('Error in handleCreateKiosk:', err);
    }
  };

  const formatKioskId = (id: string) => {
    if (id.length <= 16) return id;
    return compact 
      ? `${id.slice(0, 6)}...${id.slice(-4)}`
      : `${id.slice(0, 10)}...${id.slice(-6)}`;
  };

  if (isLoading) {
    return (
      <div className="text-white/50 text-xs font-mono animate-pulse">
        Loading Kiosks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-xs font-mono">
        {error}
      </div>
    );
  }

  if (kiosks.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-white/50 text-xs font-mono">No Kiosk found</p>
        <RetroButton
          variant="primary"
          size="sm"
          onClick={handleCreateKiosk}
          className="w-full"
        >
          Create Kiosk
        </RetroButton>
      </div>
    );
  }

  return (
    <div className={compact ? "flex gap-1" : "space-y-2"}>
      <select
        value={selectedKiosk?.kioskId || ''}
        onChange={(e) => {
          const kiosk = kiosks.find(k => k.kioskId === e.target.value);
          if (kiosk) selectKiosk(kiosk);
        }}
        className={`
          ${compact ? 'flex-1' : 'w-full'} 
          bg-[#0a0a0a] text-white text-xs px-2 py-2 font-mono
          outline-none transition-all
          cursor-pointer
        `}
        style={{
          borderTop: '2px solid #000000',
          borderLeft: '2px solid #000000',
          borderBottom: '2px solid #2a2a2a',
          borderRight: '2px solid #2a2a2a',
          boxShadow: `
            inset 2px 2px 3px rgba(0, 0, 0, 0.8),
            inset -1px -1px 2px rgba(255, 255, 255, 0.02)
          `,
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `
            inset 2px 2px 4px rgba(0, 0, 0, 0.9),
            inset -1px -1px 2px rgba(255, 255, 255, 0.05),
            0 0 0 1px rgba(255, 255, 255, 0.4)
          `;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = `
            inset 2px 2px 3px rgba(0, 0, 0, 0.8),
            inset -1px -1px 2px rgba(255, 255, 255, 0.02)
          `;
        }}
      >
        {kiosks.map((kiosk) => (
          <option 
            key={kiosk.kioskId} 
            value={kiosk.kioskId}
            style={{ 
              backgroundColor: '#0a0a0a',
              color: 'white',
              fontFamily: 'monospace'
            }}
          >
            {formatKioskId(kiosk.kioskId)} ({kiosk.itemCount} items)
          </option>
        ))}
      </select>
      
      {!compact && (
        <RetroButton
          variant="secondary"
          size="sm"
          onClick={handleCreateKiosk}
          className="w-full"
        >
          + New Kiosk
        </RetroButton>
      )}
    </div>
  );
}

