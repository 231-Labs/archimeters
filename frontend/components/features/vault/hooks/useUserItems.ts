import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect } from 'react';
import { PACKAGE_ID } from '@/utils/transactions';

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
  structure: string;
  time: string;
}

export type VaultItem = AtelierItem | SculptItem;

// Extract blob ID from URL
function extractBlobId(url: string): string | null {
  if (!url) return null;

  const regex = /\/blobs\/([A-Za-z0-9_-]+)/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
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
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
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
          setIsLoading(false);
          return;
        }

        const membership = objects[0];
        const content = membership.data?.content as any;
        
        // Extract kiosk information from membership
        const kioskId = content?.fields?.kiosk_id;
        const kioskCapId = content?.fields?.kiosk_cap_id;
        
        if (kioskId && kioskCapId) {
          setKioskInfo({ kioskId, kioskCapId });
        } else {
          console.warn('Kiosk information not found in membership');
        }
        
        let objectIds: string[] = [];
        
        if (fieldKey === 'ateliers') {
          objectIds = content?.fields?.ateliers?.fields?.contents || [];
        } else if (fieldKey === 'sculptures') {
          if (content?.fields?.sculptures?.type?.includes('vec_set::VecSet')) {
            objectIds = content?.fields?.sculptures?.fields?.contents || [];
          } else {
            objectIds = content?.fields?.sculptures || [];
          }
        }
        
        if (!Array.isArray(objectIds)) {
          objectIds = [];
        }

        if (objectIds.length === 0) {
          setItems([]);
          setIsLoading(false);
          return;
        }

        const results = await suiClient.multiGetObjects({
          ids: objectIds,
          options: {
            showContent: true,
          },
        });

        const parsedItems: VaultItem[] = [];

        for (const object of results) {
          if (!object.data?.content) continue;
          const content = object.data.content as any;
          
          if (fieldKey === 'ateliers') {
            const poolId = content.fields.pool_id || '';
            let poolBalance = '0';
            
            // Fetch pool balance from AtelierPool object
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
          } else {
            parsedItems.push({
              id: object.data.objectId,
              type: 'sculpt',
              blueprint: content.fields.blueprint || '',
              photoBlobId: extractBlobId(content.fields.blueprint) || '',
              alias: content.fields.alias || '',
              creator: content.fields.creator || '',
              printed: content.fields.printed || '0',
              structure: content.fields.structure || '',
              time: content.fields.time
                ? new Date(Number(content.fields.time)).toLocaleDateString('en-CA')
                : '',
              isLoading: false,
              error: null,
            } as SculptItem);
          }
        }

        setItems(parsedItems);
      } catch (err) {
        setError(`Failed to load ${fieldKey}.`);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
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
