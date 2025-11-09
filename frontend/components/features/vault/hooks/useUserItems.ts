import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect } from 'react';
import { KioskClient, Network } from '@mysten/kiosk';
import { PACKAGE_ID } from '@/utils/transactions';
import { extractBlobId } from '@/utils/formatters';

export interface BaseVaultItem {
  id: string;
  isLoading: boolean;
  error: string | null;
}

export interface AtelierItem extends BaseVaultItem {
  type: 'atelier';
  photoBlobId: string;
  title: string;
  author: string;
  price: string;
  pool: string;
  poolId: string;
  publish_time: string;
}

export interface SculptItem extends BaseVaultItem {
  type: 'sculpt';
  blueprint: string;
  photoBlobId: string;
  alias: string;
  creator: string;
  printed: string;
  glbFile: string; // GLB file for 3D preview
  structure: string; // STL file for printing (optional, encrypted)
  time: string;
  kioskId: string;
  kioskCapId: string;
}

export type VaultItem = AtelierItem | SculptItem;

export interface KioskInfo {
  kioskId: string;
  kioskCapId: string;
}

export function useUserItems(fieldKey: 'ateliers' | 'sculptures') {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [kioskInfo, setKioskInfo] = useState<KioskInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      setError(null);

      if (!currentAccount?.address) {
        setError('Please connect your wallet.');
        setItems([]);
        setIsLoading(false);
        return;
      }

      try {
        if (fieldKey === 'sculptures') {
          await loadSculptsViaEvents();
        } else {
          await loadAteliers();
        }
      } catch (err) {
        setError(`Failed to load ${fieldKey}.`);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    const loadSculptsViaEvents = async () => {
      const kioskClient = new KioskClient({
        client: suiClient as any,
        network: Network.TESTNET,
      });

      const { kioskOwnerCaps, kioskIds } = await kioskClient.getOwnedKiosks({ 
        address: currentAccount!.address 
      });

      if (kioskOwnerCaps.length === 0 || kioskIds.length === 0) {
        setItems([]);
        setKioskInfo(null);
        return;
      }

      const firstKiosk = kioskOwnerCaps[0];
      const currentKioskInfo: KioskInfo = {
        kioskId: firstKiosk.kioskId,
        kioskCapId: firstKiosk.objectId,
      };
      setKioskInfo(currentKioskInfo);

      const allSculptIds: string[] = [];
      const sculptToKioskMap = new Map<string, { kioskId: string; kioskCapId: string }>();
      
      for (let i = 0; i < kioskIds.length; i++) {
        const kioskId = kioskIds[i];
        const kioskCapId = kioskOwnerCaps[i].objectId;

        try {
          const kioskData = await kioskClient.getKiosk({
            id: kioskId,
            options: {
              withKioskFields: true,
              withObjects: true,
            }
          });

          const sculptsInKiosk = kioskData.items
            .filter(item => {
              const isSculpt = item.type?.includes('sculpt::Sculpt');
              const isCurrentPackage = item.type?.includes(PACKAGE_ID);
              return isSculpt && isCurrentPackage;
            })
            .map(item => {
              sculptToKioskMap.set(item.objectId, { kioskId, kioskCapId });
              return item.objectId;
            });
          
          allSculptIds.push(...sculptsInKiosk);
        } catch (singleKioskError) {
          continue;
        }
      }
      
      (window as any).__sculptToKioskMap = sculptToKioskMap;

      if (allSculptIds.length === 0) {
        setItems([]);
        return;
      }

      const results = await suiClient.multiGetObjects({
        ids: allSculptIds,
        options: {
          showContent: true,
          showType: true,
        },
      });

      const parsedItems: VaultItem[] = [];

      for (const object of results) {
        if (!object.data?.content) continue;
        const content = object.data.content as any;
        
        const sculptKioskInfo = sculptToKioskMap.get(object.data.objectId);
        const kioskId = sculptKioskInfo?.kioskId || currentKioskInfo.kioskId;
        const kioskCapId = sculptKioskInfo?.kioskCapId || currentKioskInfo.kioskCapId;
        
        // Handle Option<String> for structure field
        // Sui returns Option as {vec: ["value"]} for Some(value) or {vec: []} for None
        let structureValue = '';
        if (content.fields.structure && typeof content.fields.structure === 'object') {
          const structureOption = content.fields.structure as any;
          if (structureOption.vec && Array.isArray(structureOption.vec) && structureOption.vec.length > 0) {
            structureValue = structureOption.vec[0];
          }
        }
        
        parsedItems.push({
          id: object.data.objectId,
          type: 'sculpt',
          blueprint: content.fields.blueprint || '',
          photoBlobId: extractBlobId(content.fields.blueprint) || '',
          alias: content.fields.alias || '',
          creator: content.fields.creator || '',
          printed: content.fields.printed || '0',
          glbFile: content.fields.glb_file || '', // glb_file is already a blob ID, not a URL
          structure: structureValue, // structure is Option<String>, extract from vec if present
          time: content.fields.time
            ? new Date(Number(content.fields.time)).toLocaleDateString('en-CA')
            : '',
          kioskId,
          kioskCapId,
          isLoading: false,
          error: null,
        } as SculptItem);
      }

      setItems(parsedItems);
    };

    const loadAteliers = async () => {
      const { data: objects } = await suiClient.getOwnedObjects({
        owner: currentAccount!.address,
        filter: {
          StructType: `${PACKAGE_ID}::archimeters::MemberShip`,
        },
        options: {
          showContent: true,
        },
      });

      if (!objects || !objects.length) {
        setError('No Membership NFT found. Please mint your Membership first.');
        setItems([]);
        return;
      }

      const membership = objects[0];
      const content = membership.data?.content as any;
      let objectIds: string[] = content?.fields?.ateliers?.fields?.contents || [];
      
      try {
        const kioskClient = new KioskClient({
          client: suiClient as any,
          network: Network.TESTNET,
        });

        const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({ 
          address: currentAccount!.address 
        });

        if (kioskOwnerCaps.length > 0) {
          const firstKiosk = kioskOwnerCaps[0];
          setKioskInfo({
            kioskId: firstKiosk.kioskId,
            kioskCapId: firstKiosk.objectId,
          });
        }
      } catch (err) {
        console.error('Error fetching kiosk info for ateliers:', err);
      }

      if (!Array.isArray(objectIds)) {
        objectIds = [];
      }

      if (objectIds.length === 0) {
        setItems([]);
        return;
      }

      const results = await suiClient.multiGetObjects({
        ids: objectIds,
        options: {
          showContent: true,
          showType: true,
        },
      });

      const parsedItems: VaultItem[] = [];

      for (const object of results) {
        if (!object.data?.content) continue;
        const content = object.data.content as any;
        
        const poolId = content.fields.pool_id || '';
        let poolBalance = '0';
        
        if (poolId) {
          try {
            const poolObject = await suiClient.getObject({
              id: poolId,
              options: { showContent: true },
            });
            
            if (poolObject.data?.content) {
              const poolContent = poolObject.data.content as any;
              poolBalance = poolContent.fields?.balance || '0';
            }
          } catch (err) {
            console.error('Error fetching pool balance:', err);
          }
        }
        
        parsedItems.push({
          id: object.data.objectId,
          type: 'atelier',
          photoBlobId: content.fields.photo || '',
          title: content.fields.name || '',
          author: content.fields.current_owner || content.fields.original_creator || '',
          price: content.fields.price || '',
          pool: poolBalance,
          poolId: poolId,
          publish_time: content.fields.publish_time
            ? new Date(Number(content.fields.publish_time)).toLocaleDateString('en-CA')
            : '',
          isLoading: false,
          error: null,
        } as AtelierItem);
      }

      setItems(parsedItems);
    };

    loadItems();
  }, [currentAccount, suiClient, reloadFlag, fieldKey]);

  const reload = () => setReloadFlag((prev) => prev + 1);

  return {
    items,
    kioskInfo,
    isLoading,
    error,
    reload,
  };
}
