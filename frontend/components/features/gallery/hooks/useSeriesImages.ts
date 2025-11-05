import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { ATELIER_STATE_ID, PACKAGE_ID } from '@/utils/transactions';
import { getWalrusBlobUrl } from '@/config/walrus';

interface AtelierState {
  all_ateliers: string[];
}

interface AtelierFields {
  photo: string;      // Image blob-id
  name: string;
  author: string;
  price: string;
  pool_id: string;    // Associated pool ID
  publish_time: string;
  algorithm: string;  // Algorithm file blob-id
  artificials: string[];
  data: string;      // JSON config file blob-id
  id: { id: string };
}

interface Atelier {
  id: string;
  photoBlobId: string;
  algorithmBlobId: string;
  dataBlobId: string;
  poolId: string;     // Pool ID for payment
  url: string | null;
  algorithmContent: string | null;
  configData: any | null;
  title: string;
  author: string;
  price: string;
  isLoading: boolean;
  error: string | null;
}

interface UseSeriesImagesReturn {
  images: Atelier[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSeriesImages(): UseSeriesImagesReturn {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [images, setImages] = useState<Atelier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch image from Walrus
  const fetchImageFromWalrus = async (id: string, blobId: string) => {
    try {
      // Set status when starting to load
      setImages(prev => prev.map(img => 
        img.id === id 
          ? { ...img, isLoading: true, error: null }
          : img
      ));

      const imageUrl = getWalrusBlobUrl(blobId);
      // Test if URL is accessible
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Failed to load image');
      }

      // Update image URL
      setImages(prev => {
        const newImages = prev.map(img => 
          img.id === id 
            ? { ...img, url: imageUrl, isLoading: false, error: null }
            : img
        );
        return newImages;
      });

    } catch (err) {
      console.error(`Error loading image for ${id}:`, err);
      setImages(prev => prev.map(img => 
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

      // Fetch algorithm text content
      const algorithmContent = await response.text();

      // Update algorithm content
      setImages(prev => {
        const newImages = prev.map(img => 
          img.id === id 
            ? { ...img, algorithmContent, isLoading: false, error: null }
            : img
        );
        return newImages;
      });

    } catch (err) {
      console.error(`Error loading algorithm for ${id}:`, err);
      setImages(prev => prev.map(img => 
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

      // Fetch config file content and parse as JSON
      const configText = await response.text();
      let configData;
      
      try {
        configData = JSON.parse(configText);
      } catch (parseErr) {
        console.error('Failed to parse config data as JSON:', parseErr);
        configData = { rawText: configText }; // If parsing fails, save original text
      }

      // Update config data
      setImages(prev => {
        const newImages = prev.map(img => 
          img.id === id 
            ? { ...img, configData, isLoading: false, error: null }
            : img
        );
        return newImages;
      });

    } catch (err) {
      console.error(`Error loading config data for ${id}:`, err);
      setImages(prev => prev.map(img => 
        img.id === id 
          ? { ...img, error: 'Failed to load config data', isLoading: false }
          : img
      ));
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

      console.log('Found events:', events.data.length);

      if (events.data.length === 0) {
        setImages([]);
        setIsLoading(false);
        return;
      }

      // 直接從事件中構建 Atelier 數據（因為 Atelier 在 Kiosk 中無法直接查詢）
      const atelierImages = events.data.map((eventData: any) => {
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

      setImages(atelierImages);
      setIsLoading(false);

      // Start loading resources for each Atelier
      atelierImages.forEach(image => {
        // Load image
        if (image.photoBlobId) {
          fetchImageFromWalrus(image.id, image.photoBlobId);
        }
        
        // 加載演算法
        if (image.algorithmBlobId) {
          fetchAlgorithmFromWalrus(image.id, image.algorithmBlobId);
        }
        
        // 加載配置數據
        if (image.dataBlobId) {
          fetchConfigDataFromWalrus(image.id, image.dataBlobId);
        }
      });
    } catch (error) {
      console.error('Error fetching Atelier data:', error);
      setError('Failed to fetch Atelier data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAtelierData();
  }, [currentAccount]);

  return {
    images,
    isLoading,
    error,
    refetch: fetchAtelierData
  };
}