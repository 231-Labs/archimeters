import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

export interface KioskInfo {
  kioskId: string;
  kioskCapId: string;
  itemCount: number;
}

export function useKiosk() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [kiosks, setKiosks] = useState<KioskInfo[]>([]);
  const [selectedKiosk, setSelectedKiosk] = useState<KioskInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all Kiosks owned by the user
  const fetchUserKiosks = useCallback(async () => {
    if (!currentAccount?.address) {
      setKiosks([]);
      setSelectedKiosk(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch KioskOwnerCaps owned by the user
      const { data: kioskCaps } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: '0x2::kiosk::KioskOwnerCap'
        },
        options: {
          showContent: true,
          showType: true,
        }
      });

      if (!kioskCaps || kioskCaps.length === 0) {
        setKiosks([]);
        setSelectedKiosk(null);
        return;
      }

      // Extract kiosk information
      const kioskInfos: KioskInfo[] = [];
      
      for (const capObj of kioskCaps) {
        if (capObj.data?.content && 'fields' in capObj.data.content) {
          const fields = capObj.data.content.fields as any;
          const kioskId = fields.for || fields.kiosk_id;
          const kioskCapId = capObj.data.objectId;

          if (kioskId) {
            try {
              // Fetch Kiosk details to get item count
              const kioskObj = await suiClient.getObject({
                id: kioskId,
                options: {
                  showContent: true,
                }
              });

              let itemCount = 0;
              if (kioskObj.data?.content && 'fields' in kioskObj.data.content) {
                const kioskFields = kioskObj.data.content.fields as any;
                itemCount = kioskFields.item_count || 0;
              }

              kioskInfos.push({
                kioskId,
                kioskCapId,
                itemCount,
              });
            } catch (err) {
              console.error(`Error fetching kiosk ${kioskId}:`, err);
            }
          }
        }
      }

      setKiosks(kioskInfos);

      // Restore selection from session storage
      const savedKioskId = sessionStorage.getItem('kiosk-id');
      if (savedKioskId) {
        const savedKiosk = kioskInfos.find(k => k.kioskId === savedKioskId);
        if (savedKiosk) {
          setSelectedKiosk(savedKiosk);
        } else if (kioskInfos.length > 0) {
          setSelectedKiosk(kioskInfos[0]);
        }
      } else if (kioskInfos.length > 0) {
        setSelectedKiosk(kioskInfos[0]);
      }
    } catch (err) {
      console.error('Error fetching kiosks:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch kiosks');
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount, suiClient]);

  // Create new Kiosk
  const createKiosk = useCallback(async () => {
    if (!currentAccount?.address) {
      setError('Please connect wallet first');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tx = new Transaction();
      
      // Call kiosk::default to create and auto-share new kiosk
      // This function creates kiosk, shares it, and transfers cap to sender
      tx.moveCall({
        target: '0x2::kiosk::default',
        arguments: [],
      });

      return tx;
    } catch (err) {
      console.error('Error creating kiosk:', err);
      setError(err instanceof Error ? err.message : 'Failed to create kiosk');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentAccount]);

  // Select Kiosk
  const selectKiosk = useCallback((kiosk: KioskInfo) => {
    setSelectedKiosk(kiosk);
    sessionStorage.setItem('kiosk-id', kiosk.kioskId);
    sessionStorage.setItem('kiosk-cap-id', kiosk.kioskCapId);
  }, []);

  // When account changes, refetch kiosks
  useEffect(() => {
    fetchUserKiosks();
  }, [fetchUserKiosks]);

  // When selection changes, save to session storage
  useEffect(() => {
    if (selectedKiosk) {
      sessionStorage.setItem('kiosk-id', selectedKiosk.kioskId);
      sessionStorage.setItem('kiosk-cap-id', selectedKiosk.kioskCapId);
    }
  }, [selectedKiosk]);

  return {
    kiosks,
    selectedKiosk,
    isLoading,
    error,
    fetchUserKiosks,
    createKiosk,
    selectKiosk,
  };
}

