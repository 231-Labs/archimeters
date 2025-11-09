import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';
import { getWalrusBlobUrl } from '@/config/walrus';

interface AtelierState {
  all_ateliers: string[];
}

interface AtelierFields {
  photo: string;
  name: string;
  author: string;
  price: string;
  pool_id: string;
  publish_time: string;
  algorithm: string;
  artificials: string[];
  data: string;
  id: { id: string };
}

interface Atelier {
  id: string;
  photoBlobId: string;
  algorithmBlobId: string;
  dataBlobId: string;
  poolId: string;
  url: string | null;
  algorithmContent: string | null;
  configData: any | null;
  title: string;
  author: string;
  price: string;
  description?: string;
  artistStatement?: string;
  artistName?: string;
  artistAddress?: string;
  isLoading: boolean;
  error: string | null;
}

interface Sculpt {
  id: string;
  atelierId: string;
  blueprint: string;
  photoBlobId: string;
  stlBlobId: string;
  glbBlobId: string;
  creator: string;
  paramKeys: string[];
  paramValues: string[];
  price: string;
  kioskId: string;
  glbUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

// Extract blob ID from URL
function extractBlobId(url: string): string | null {
  if (!url) return null;

  const regex = /\/blobs\/([A-Za-z0-9_-]+)/;
  const match = url.match(regex);
  
  return match ? match[1] : null;
}

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

  // Fetch image from Walrus
  const fetchImageFromWalrus = async (id: string, blobId: string) => {
    try {
      setAteliers(prev => prev.map(img => 
        img.id === id 
          ? { ...img, isLoading: true, error: null }
          : img
      ));

      const imageUrl = getWalrusBlobUrl(blobId);
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Failed to load image');
      }

      setAteliers(prev => {
        const newImages = prev.map(img => 
          img.id === id 
            ? { ...img, url: imageUrl, isLoading: false, error: null }
            : img
        );
        return newImages;
      });

    } catch (err) {
      console.error(`Error loading image for ${id}:`, err);
      setAteliers(prev => prev.map(img => 
        img.id === id 
          ? { ...img, error: 'Failed to load image', isLoading: false }
          : img
      ));
    }
  };

  // Fetch algorithm content from Walrus
  const fetchAlgorithmFromWalrus = async (id: string, blobId: string) => {
    try {
      const algorithmUrl = getWalrusBlobUrl(blobId);
      const response = await fetch(algorithmUrl);
      
      if (!response.ok) {
        throw new Error('Failed to load algorithm');
      }

      const algorithmContent = await response.text();

      setAteliers(prev => {
        const newImages = prev.map(img => 
          img.id === id 
            ? { ...img, algorithmContent, isLoading: false, error: null }
            : img
        );
        return newImages;
      });

    } catch (err) {
      console.error(`Error loading algorithm for ${id}:`, err);
      setAteliers(prev => prev.map(img => 
        img.id === id 
          ? { ...img, error: 'Failed to load algorithm', isLoading: false }
          : img
      ));
    }
  };

  // Fetch config file from Walrus
  const fetchConfigDataFromWalrus = async (id: string, blobId: string) => {
    try {
      const configUrl = getWalrusBlobUrl(blobId);
      
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        throw new Error('Failed to load config data');
      }

      const configText = await response.text();
      let configData;
      
      try {
        configData = JSON.parse(configText);
      } catch (parseErr) {
        console.error('Failed to parse config data as JSON:', parseErr);
        configData = { rawText: configText };
      }

      setAteliers(prev => {
        const newImages = prev.map(img => 
          img.id === id 
            ? { 
                ...img, 
                configData, 
                description: configData?.artwork?.description || '',
                artistStatement: configData?.artist?.introduction || '',
                artistName: configData?.artist?.name || img.author,
                artistAddress: configData?.artist?.address || '',
                isLoading: false, 
                error: null 
              }
            : img
        );
        return newImages;
      });

    } catch (err) {
      console.error(`Error loading config data for ${id}:`, err);
      setAteliers(prev => prev.map(img => 
        img.id === id 
          ? { ...img, error: 'Failed to load config data', isLoading: false }
          : img
      ));
    }
  };

  // Fetch GLB from Walrus for Sculpts
  const fetchGLBFromWalrus = async (id: string, blobId: string) => {
    try {
      const glbUrl = getWalrusBlobUrl(blobId);
      const response = await fetch(glbUrl);
      
      if (!response.ok) {
        throw new Error('Failed to load GLB');
      }

      setSculpts(prev => prev.map(sculpt => 
        sculpt.id === id 
          ? { ...sculpt, glbUrl, isLoading: false, error: null }
          : sculpt
      ));

    } catch (err) {
      console.error(`Error loading GLB for ${id}:`, err);
      setSculpts(prev => prev.map(sculpt => 
        sculpt.id === id 
          ? { ...sculpt, error: 'Failed to load GLB', isLoading: false }
          : sculpt
      ));
    }
  };

  // Fetch listed Sculpts using Event-based indexing
  const fetchListedSculpts = useCallback(async () => {
    if (!suiClient) {
      return;
    }
 
    try {
      const allListedSculpts: Sculpt[] = [];
      
      const sculptType = `${PACKAGE_ID}::sculpt::Sculpt<${PACKAGE_ID}::atelier::ATELIER>`;
      const listedEventType = `0x2::kiosk::ItemListed<${sculptType}>`;
      
      const listedEvents = await suiClient.queryEvents({
        query: {
          MoveEventType: listedEventType
        },
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

      // Build a map of removed items (itemId -> latest removal timestamp)
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

      // Process ItemListed events
      for (const eventData of listedEvents.data) {
        const event = eventData.parsedJson as any;
        const itemId = event?.id || event?.item_id || event?.itemId;
        
        if (!itemId) {
          continue;
        }

        const listedTimestamp = Number(eventData.timestampMs || '0');
        const removalTimestamp = removedItems.get(itemId);
        
        if (removalTimestamp && removalTimestamp > listedTimestamp) {
          continue;
        }

        try {
          const itemObj = await suiClient.getObject({
            id: itemId,
            options: {
              showContent: true,
              showType: true,
            }
          });

          const price = event.price || event.list_price || '0';
          const kioskId = event.kiosk || event.kiosk_id || '';

          if (itemObj.data?.content && 'fields' in itemObj.data.content) {
            const fields = itemObj.data.content.fields as any;
            const blueprint = fields.blueprint || '';
            const photoBlobId = extractBlobId(blueprint) || '';
            
            const sculptData: Sculpt = {
              id: itemId,
              atelierId: fields.atelier_id || '',
              blueprint: blueprint,
              photoBlobId: photoBlobId,
              stlBlobId: fields.stl_data || '',
              glbBlobId: fields.glb_data || '',
              creator: fields.creator || '',
              paramKeys: fields.param_keys || [],
              paramValues: fields.param_values || [],
              price: price.toString(),
              kioskId: kioskId,
              glbUrl: null,
              isLoading: false,
              error: null,
            };

            allListedSculpts.push(sculptData);
          }
        } catch (err) {
          // Skip failed items
        }
      }

      setSculpts(allListedSculpts);

      // Load GLB previews
      allListedSculpts.forEach(sculpt => {
        if (sculpt.glbBlobId) {
          fetchGLBFromWalrus(sculpt.id, sculpt.glbBlobId);
        }
      });

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

      // Build Atelier data from events
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

      // Start loading resources for each Atelier
      atelierData.forEach(atelier => {
        if (atelier.photoBlobId) {
          fetchImageFromWalrus(atelier.id, atelier.photoBlobId);
        }
        
        if (atelier.algorithmBlobId) {
          fetchAlgorithmFromWalrus(atelier.id, atelier.algorithmBlobId);
        }
        
        if (atelier.dataBlobId) {
          fetchConfigDataFromWalrus(atelier.id, atelier.dataBlobId);
        }
      });

      // Also fetch listed Sculpts
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

