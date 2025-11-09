import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';
import { getWalrusBlobUrl } from '@/config/walrus';
import { extractBlobId } from '@/utils/formatters';
import type { Atelier, Sculpt } from '../types';

interface UseMarketplaceDataReturn {
  ateliers: Atelier[];
  sculpts: Sculpt[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMarketplaceData(): UseMarketplaceDataReturn {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [ateliers, setAteliers] = useState<Atelier[]>([]);
  const [sculpts, setSculpts] = useState<Sculpt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFromWalrus = async <T extends Atelier | Sculpt>(
    id: string,
    blobId: string,
    resourceType: 'image' | 'algorithm' | 'config' | 'glb',
    setState: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    try {
      const url = getWalrusBlobUrl(blobId);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to load ${resourceType}`);
      }

      if (resourceType === 'image' || resourceType === 'glb') {
        setState(prev => prev.map(item => 
          item.id === id 
            ? { ...item, [resourceType === 'glb' ? 'glbUrl' : 'url']: url, isLoading: false, error: null } as T
            : item
        ));
      } else if (resourceType === 'algorithm') {
        const content = await response.text();
        setState(prev => prev.map(item => 
          item.id === id 
            ? { ...item, algorithmContent: content, isLoading: false, error: null } as T
            : item
        ));
      } else if (resourceType === 'config') {
        const text = await response.text();
        let configData;
        try {
          configData = JSON.parse(text);
        } catch {
          configData = { rawText: text };
        }
        
        setState(prev => prev.map(item => 
          item.id === id 
            ? { 
                ...item, 
                configData,
                description: configData?.artwork?.description || '',
                artistStatement: configData?.artist?.introduction || '',
                artistName: configData?.artist?.name || (item as Atelier).author,
                artistAddress: configData?.artist?.address || '',
                isLoading: false, 
                error: null 
              } as T
            : item
        ));
      }
    } catch (err) {
      console.error(`Error loading ${resourceType} for ${id}:`, err);
      setState(prev => prev.map(item => 
        item.id === id 
          ? { ...item, error: `Failed to load ${resourceType}`, isLoading: false } as T
          : item
      ));
    }
  };

  const fetchListedSculpts = useCallback(async () => {
    if (!suiClient) return;

    try {
      const sculptType = `${PACKAGE_ID}::sculpt::Sculpt<${PACKAGE_ID}::atelier::ATELIER>`;
      const listedEventType = `0x2::kiosk::ItemListed<${sculptType}>`;
      
      const listedEvents = await suiClient.queryEvents({
        query: { MoveEventType: listedEventType },
        limit: 200,
        order: 'descending'
      });

      const delistedEventType = `0x2::kiosk::ItemDelisted<${sculptType}>`;
      const purchasedEventType = `0x2::kiosk::ItemPurchased<${sculptType}>`;
      
      const [delistedEvents, purchasedEvents] = await Promise.all([
        suiClient.queryEvents({
          query: { MoveEventType: delistedEventType },
          limit: 200,
          order: 'descending'
        }),
        suiClient.queryEvents({
          query: { MoveEventType: purchasedEventType },
          limit: 200,
          order: 'descending'
        })
      ]);

      const removedItems = new Map<string, number>();
      
      [...delistedEvents.data, ...purchasedEvents.data].forEach(eventData => {
        const event = eventData.parsedJson as any;
        const itemId = event?.id || event?.item_id || event?.itemId;
        if (itemId) {
          const timestamp = Number(eventData.timestampMs || '0');
          const existing = removedItems.get(itemId);
          if (!existing || timestamp > existing) {
            removedItems.set(itemId, timestamp);
          }
        }
      });

      const validItems: Array<{ itemId: string; price: string; kioskId: string }> = [];
      for (const eventData of listedEvents.data) {
        const event = eventData.parsedJson as any;
        const itemId = event?.id || event?.item_id || event?.itemId;
        
        if (!itemId) continue;

        const listedTimestamp = Number(eventData.timestampMs || '0');
        const removalTimestamp = removedItems.get(itemId);
        
        if (removalTimestamp && removalTimestamp > listedTimestamp) continue;

        validItems.push({
          itemId,
          price: event.price || event.list_price || '0',
          kioskId: event.kiosk || event.kiosk_id || '',
        });
      }

      if (validItems.length > 0) {
        try {
          const itemObjects = await suiClient.multiGetObjects({
            ids: validItems.map(item => item.itemId),
            options: {
              showContent: true,
              showType: true,
            }
          });

          const allListedSculpts: Sculpt[] = [];

          itemObjects.forEach((itemObj, index) => {
            const { itemId, price, kioskId } = validItems[index];

            if (itemObj.data?.content && 'fields' in itemObj.data.content) {
              const fields = itemObj.data.content.fields as any;
              const blueprint = fields.blueprint || '';
              const photoBlobId = extractBlobId(blueprint) || '';
              
              allListedSculpts.push({
                id: itemId,
                atelierId: fields.atelier_id || '',
                blueprint,
                photoBlobId,
                stlBlobId: fields.stl_data || '',
                glbBlobId: fields.glb_data || '',
                creator: fields.creator || '',
                paramKeys: fields.param_keys || [],
                paramValues: fields.param_values || [],
                price: price.toString(),
                kioskId,
                glbUrl: null,
                isLoading: false,
                error: null,
              });
            }
          });

          setSculpts(allListedSculpts);

          allListedSculpts.forEach(sculpt => {
            if (sculpt.glbBlobId) {
              fetchFromWalrus(sculpt.id, sculpt.glbBlobId, 'glb', setSculpts);
            }
          });
        } catch (err) {
          console.error('Error fetching sculpt objects:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching listed Sculpts:', err);
    }
  }, [suiClient]);

  const fetchAtelierData = useCallback(async () => {
    if (!suiClient) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
    
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::atelier::New_atelier`
        },
        limit: 50,
        order: 'descending'
      });

      if (events.data.length === 0) {
        setAteliers([]);
        setIsLoading(false);
        return;
      }

      const atelierData = events.data.map((eventData: any) => {
        const event = eventData.parsedJson;
        
        if (!event || !event.id) {
          return {
            id: '',
            photoBlobId: '',
            algorithmBlobId: '',
            dataBlobId: '',
            poolId: '',
            url: null,
            algorithmContent: null,
            configData: null,
            title: '',
            author: '',
            price: '',
            isLoading: false,
            error: 'Invalid event data'
          };
        }

        return {
          id: event.id,
          photoBlobId: event.photo || '',
          algorithmBlobId: event.algorithm || '',
          dataBlobId: event.data || '',
          poolId: event.pool_id || '',
          url: null,
          algorithmContent: null,
          configData: null,
          title: event.name || '',
          author: event.original_creator || '',
          price: event.price?.toString() || '',
          isLoading: true,
          error: null
        };
      });

      setAteliers(atelierData);

      atelierData.forEach(atelier => {
        if (atelier.photoBlobId) {
          fetchFromWalrus(atelier.id, atelier.photoBlobId, 'image', setAteliers);
        }
        if (atelier.algorithmBlobId) {
          fetchFromWalrus(atelier.id, atelier.algorithmBlobId, 'algorithm', setAteliers);
        }
        if (atelier.dataBlobId) {
          fetchFromWalrus(atelier.id, atelier.dataBlobId, 'config', setAteliers);
        }
      });

      await fetchListedSculpts();
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      setError('Failed to fetch marketplace data');
      setIsLoading(false);
    }
  }, [suiClient, fetchListedSculpts]);

  useEffect(() => {
    fetchAtelierData();
  }, [currentAccount, fetchAtelierData]);

  return {
    ateliers,
    sculpts,
    isLoading,
    error,
    refetch: fetchAtelierData
  };
}
