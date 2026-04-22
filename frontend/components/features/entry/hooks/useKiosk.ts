import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useCurrentClient } from '@mysten/dapp-kit-react';
import { Transaction } from '@mysten/sui/transactions';
import { listAllOwnedObjectsByType } from '@/lib/list-owned-objects';
import { moveObjectFields, pickField } from '@/lib/sui-object-json';

export interface KioskInfo {
  kioskId: string;
  kioskCapId: string;
  itemCount: number;
}

export function useKiosk() {
  const currentAccount = useCurrentAccount();
  const suiClient = useCurrentClient();
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
      const kioskCaps = await listAllOwnedObjectsByType(
        suiClient,
        currentAccount.address,
        '0x2::kiosk::KioskOwnerCap'
      );

      if (!kioskCaps.length) {
        setKiosks([]);
        setSelectedKiosk(null);
        return;
      }

      const kioskInfos: KioskInfo[] = [];

      for (const capObj of kioskCaps) {
        const fields = moveObjectFields(capObj.json);
        const kioskId = String(pickField(fields, 'for', 'kiosk_id') ?? '');
        const kioskCapId = capObj.objectId;

        if (kioskId) {
          try {
            const { object: kioskRow } = await suiClient.getObject({
              objectId: kioskId,
              include: { json: true },
            });

            let itemCount = 0;
            const kioskFields = moveObjectFields(kioskRow.json);
            const rawCount = pickField(kioskFields, 'item_count', 'itemCount');
            if (typeof rawCount === 'number') itemCount = rawCount;
            else if (typeof rawCount === 'string') itemCount = Number(rawCount) || 0;

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
    window.dispatchEvent(new CustomEvent('kiosk-selected', { detail: kiosk }));
  }, []);

  // When account changes, refetch kiosks
  useEffect(() => {
    fetchUserKiosks();
  }, [fetchUserKiosks]);

  // When selection changes, save to session storage and dispatch event
  useEffect(() => {
    if (selectedKiosk) {
      sessionStorage.setItem('kiosk-id', selectedKiosk.kioskId);
      sessionStorage.setItem('kiosk-cap-id', selectedKiosk.kioskCapId);
      window.dispatchEvent(new CustomEvent('kiosk-selected', { detail: selectedKiosk }));
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

