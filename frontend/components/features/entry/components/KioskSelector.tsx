import { useKiosk } from '../hooks/useKiosk';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';

export default function KioskSelector() {
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
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateKiosk = async () => {
    setIsCreating(true);
    try {
      const tx = await createKiosk();
      if (!tx) {
        setIsCreating(false);
        return;
      }

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: async (result) => {
            console.log('Kiosk created:', result.digest);
            setTimeout(() => {
              fetchUserKiosks();
              setIsCreating(false);
            }, 2000);
          },
          onError: (error) => {
            console.error('Failed to create kiosk:', error);
            setIsCreating(false);
          }
        }
      );
    } catch (err) {
      console.error('Error in handleCreateKiosk:', err);
      setIsCreating(false);
    }
  };

  // Format Kiosk ID to show: keep head and tail, use ... in the middle
  const formatKioskId = (id: string) => {
    if (id.length <= 16) return id;
    return `${id.slice(0, 10)}...${id.slice(-6)}`;
  };

  if (isLoading) {
    return (
      <div className="text-green-400 text-xs animate-pulse">
        LOADING...
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="text-red-400 text-xs">
          {error}
        </div>
      )}

      {kiosks.length === 0 ? (
        <button
          onClick={handleCreateKiosk}
          disabled={isCreating}
          className="w-full text-xs px-3 py-2 bg-black/80 border-2 text-white hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            fontFamily: 'monospace',
            borderColor: 'rgba(255, 255, 255, 0.3)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          {isCreating ? 'CREATING KIOSK...' : 'CREATE KIOSK'}
        </button>
      ) : (
        <div className="flex gap-2">
          <select
            value={selectedKiosk?.kioskId || ''}
            onChange={(e) => {
              const kiosk = kiosks.find(k => k.kioskId === e.target.value);
              if (kiosk) selectKiosk(kiosk);
            }}
            className="flex-1 bg-black/80 border-2 text-white text-xs px-2 py-2 focus:outline-none"
            style={{
              fontFamily: 'monospace',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            {kiosks.map((kiosk) => (
              <option key={kiosk.kioskId} value={kiosk.kioskId}>
                {`${formatKioskId(kiosk.kioskId)} (${kiosk.itemCount} ITEMS)`}
              </option>
            ))}
          </select>
          
          <button
            onClick={handleCreateKiosk}
            disabled={isCreating}
            className="text-xs px-3 py-2 bg-black/80 border-2 text-white hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{
              fontFamily: 'monospace',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            {isCreating ? 'New Kiosk' : 'New Kiosk'}
          </button>
        </div>
      )}
    </div>
  );
}

