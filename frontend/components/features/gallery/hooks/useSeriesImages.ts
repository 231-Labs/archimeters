import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { ATELIER_STATE_ID } from '@/utils/transactions';

interface AtelierState {
  all_ateliers: string[];
}

interface AtelierFields {
  photo: string;      // Image blob-id
  name: string;
  author: string;
  price: string;
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

      const imageUrl = `https://aggregator.testnet.walrus.atalma.io/v1/blobs/${blobId}`;
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
      const algorithmUrl = `https://aggregator.testnet.walrus.atalma.io/v1/blobs/${blobId}`;
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
      const configUrl = `https://aggregator.testnet.walrus.atalma.io/v1/blobs/${blobId}`;
      
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
    // if (!currentAccount) {
    //   setError('Wallet not connected');
    //   setIsLoading(false);
    //   return;
    // }

    try {
      setIsLoading(true);
      const atelierState = await suiClient.getObject({
        id: ATELIER_STATE_ID,
        options: {
          showContent: true,
          showType: true,
        }
      });

      // Extract all_ateliers array from atelierState
      const content = atelierState.data?.content;
      if (!content || typeof content !== 'object' || !('fields' in content)) {
        throw new Error('Invalid atelier state data');
      }

      const fields = content.fields as unknown as AtelierState;
      const allAteliers = fields.all_ateliers || [];

      if (allAteliers.length === 0) {
        setImages([]);
        setIsLoading(false);
        return;
      }

      const allAteliersData = await suiClient.multiGetObjects({
        ids: allAteliers,
        options: {
          showContent: true,
          showType: true,
        }
      });

      const atelierImages = allAteliersData.map(obj => {
        const content = obj.data?.content;
        if (!content || typeof content !== 'object' || !('fields' in content)) {
          return {
            id: obj.data?.objectId || '',
            photoBlobId: '',
            algorithmBlobId: '',
            dataBlobId: '',
            url: null,
            algorithmContent: null,
            configData: null,
            title: '',
            author: '',
            price: '',
            isLoading: false,
            error: 'Invalid atelier data'
          };
        }

        const fields = content.fields as unknown as AtelierFields;
        return {
          id: obj.data?.objectId || '',
          photoBlobId: fields.photo || '',
          algorithmBlobId: fields.algorithm || '',
          dataBlobId: fields.data || '',
          url: null,
          algorithmContent: null,
          configData: null,
          title: fields.name || '',
          author: fields.author || '',
          price: fields.price || '',
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