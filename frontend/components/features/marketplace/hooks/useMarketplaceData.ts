import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { KioskClient, Network } from '@mysten/kiosk';
import { ATELIER_STATE_ID, PACKAGE_ID, SCULPT_TYPE } from '@/utils/transactions';
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
  isLoading: boolean;
  error: string | null;
}

interface Sculpt {
  id: string;
  atelierId: string;
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
            ? { ...img, configData, isLoading: false, error: null }
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

  // Fetch listed Sculpts using ItemListed events
  const fetchListedSculpts = async () => {
    try {
      console.log('Fetching listed Sculpts from Kiosk events...');
      
      // Query ItemListed events for Sculpts
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: '0x2::kiosk::ItemListed'
        },
        limit: 100,
        order: 'descending'
      });

      console.log('Found ItemListed events:', events.data.length);

      const allListedSculpts: Sculpt[] = [];

      // Filter for Sculpt type and fetch details
      for (const eventData of events.data) {
        const event = eventData.parsedJson as any;
        
        // Check if the type contains our SCULPT_TYPE
        if (event && event.id) {
          try {
            // Fetch the Sculpt object details
            const sculptObj = await suiClient.getObject({
              id: event.id,
              options: {
                showContent: true,
                showType: true,
              }
            });

            // Check if it's a Sculpt type
            if (sculptObj.data?.type?.includes('sculpt::Sculpt')) {
              if (sculptObj.data?.content && 'fields' in sculptObj.data.content) {
                const fields = sculptObj.data.content.fields as any;
                
                const sculptData: Sculpt = {
                  id: sculptObj.data.objectId,
                  atelierId: fields.atelier_id || '',
                  stlBlobId: fields.stl_data || '',
                  glbBlobId: fields.glb_data || '',
                  creator: fields.creator || '',
                  paramKeys: fields.param_keys || [],
                  paramValues: fields.param_values || [],
                  price: event.price || '0',
                  kioskId: event.kiosk || '',
                  glbUrl: null,
                  isLoading: true,
                  error: null,
                };

                allListedSculpts.push(sculptData);
              }
            }
          } catch (objErr) {
            console.error(`Error fetching Sculpt object ${event.id}:`, objErr);
          }
        }
      }

      console.log('Listed Sculpts found:', allListedSculpts.length);
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
  };

  const fetchAtelierData = async () => {
    try {
      setIsLoading(true);
    
      const events = await suiClient.queryEvents({
        query: {
          MoveEventType: `${PACKAGE_ID}::atelier::New_atelier`
        },
        limit: 50,
        order: 'descending'
      });

      console.log('Found Atelier events:', events.data.length);

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
  };

  useEffect(() => {
    fetchAtelierData();
  }, [currentAccount]);

  return {
    ateliers,
    sculpts,
    isLoading,
    error,
    refetch: fetchAtelierData
  };
}

