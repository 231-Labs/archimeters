import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useCurrentClient } from '@mysten/dapp-kit-react';
import { PACKAGE_ID } from '@/utils/transactions';
import { getWalrusBlobUrl } from '@/config/walrus';
import { extractBlobId } from '@/utils/formatters';
import { getSuiJsonRpcClientForEvents } from '@/lib/sui-jsonrpc-events';
import { moveObjectFields, pickField } from '@/lib/sui-object-json';
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
  const suiClient = useCurrentClient();
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
    const eventsClient = getSuiJsonRpcClientForEvents('testnet');

    try {
      const sculptType = `${PACKAGE_ID}::sculpt::Sculpt<${PACKAGE_ID}::atelier::ATELIER>`;
      const listedEventType = `0x2::kiosk::ItemListed<${sculptType}>`;

      const listedEvents = await eventsClient.queryEvents({
        query: { MoveEventType: listedEventType },
        limit: 200,
        order: 'descending'
      });

      const delistedEventType = `0x2::kiosk::ItemDelisted<${sculptType}>`;
      const purchasedEventType = `0x2::kiosk::ItemPurchased<${sculptType}>`;

      const [delistedEvents, purchasedEvents] = await Promise.all([
        eventsClient.queryEvents({
          query: { MoveEventType: delistedEventType },
          limit: 200,
          order: 'descending'
        }),
        eventsClient.queryEvents({
          query: { MoveEventType: purchasedEventType },
          limit: 200,
          order: 'descending'
        })
      ]);

      const removedItems = new Map<string, number>();

      [...delistedEvents.data, ...purchasedEvents.data].forEach(eventData => {
        const event = eventData.parsedJson as Record<string, unknown>;
        const itemId = event?.id || event?.item_id || event?.itemId;
        if (itemId) {
          const timestamp = Number(eventData.timestampMs || '0');
          const existing = removedItems.get(String(itemId));
          if (!existing || timestamp > existing) {
            removedItems.set(String(itemId), timestamp);
          }
        }
      });

      const validItems: Array<{ itemId: string; price: string; kioskId: string }> = [];
      for (const eventData of listedEvents.data) {
        const event = eventData.parsedJson as Record<string, unknown>;
        const itemId = event?.id || event?.item_id || event?.itemId;

        if (!itemId) continue;

        const listedTimestamp = Number(eventData.timestampMs || '0');
        const removalTimestamp = removedItems.get(String(itemId));

        if (removalTimestamp && removalTimestamp > listedTimestamp) continue;

        validItems.push({
          itemId: String(itemId),
          price: String(event.price || event.list_price || '0'),
          kioskId: String(event.kiosk || event.kiosk_id || ''),
        });
      }

      if (validItems.length > 0) {
        try {
          const { objects: itemObjects } = await suiClient.getObjects({
            objectIds: validItems.map(item => item.itemId),
            include: { json: true },
          });

          const allListedSculpts: Sculpt[] = [];

          itemObjects.forEach((itemObj, index) => {
            if (itemObj instanceof Error) return;
            const { itemId, price, kioskId } = validItems[index];
            const fields = moveObjectFields(itemObj.json);
            if (!fields) return;

            const blueprint = String(pickField(fields, 'blueprint') ?? '');
            const photoBlobId = extractBlobId(blueprint) || '';

            allListedSculpts.push({
              id: itemId,
              atelierId: String(pickField(fields, 'atelier_id', 'atelierId') ?? ''),
              blueprint,
              photoBlobId,
              stlBlobId: String(pickField(fields, 'stl_data', 'stlData') ?? ''),
              glbBlobId: String(pickField(fields, 'glb_data', 'glbData') ?? ''),
              creator: String(pickField(fields, 'creator') ?? ''),
              paramKeys: (pickField(fields, 'param_keys', 'paramKeys') as string[]) || [],
              paramValues:
                ((pickField(fields, 'param_values', 'paramValues') as unknown[]) || []).map(v =>
                  String(v)
                ),
              price: price.toString(),
              kioskId,
              glbUrl: null,
              isLoading: false,
              error: null,
            });
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
    const eventsClient = getSuiJsonRpcClientForEvents('testnet');

    if (!suiClient) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const events = await eventsClient.queryEvents({
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

      const atelierData = events.data.map((eventData) => {
        const event = eventData.parsedJson as Record<string, unknown> | null | undefined;

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
          id: String(event.id),
          photoBlobId: String(event.photo || ''),
          algorithmBlobId: String(event.algorithm || ''),
          dataBlobId: String(event.data || ''),
          poolId: String(event.pool_id || ''),
          url: null,
          algorithmContent: null,
          configData: null,
          title: String(event.name || ''),
          author: String(event.original_creator || ''),
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
    } catch (e) {
      console.error('Error fetching marketplace data:', e);
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
