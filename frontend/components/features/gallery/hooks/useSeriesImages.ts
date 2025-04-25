import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { ARTLIER_STATE_ID } from '@/utils/transactions';

interface ArtlierState {
  all_artliers: string[];
}

interface ArtlierFields {
  photo: string;
  name: string;
  author: string;
  price: string;
  publish_time: string;
  algorithm: string;
  artificials: string[];
  data: string;
  id: { id: string };
}

interface Artlier {
  id: string;
  blobId: string;
  url: string | null;
  title: string;
  social: string;
  isLoading: boolean;
  error: string | null;
}

interface UseSeriesImagesReturn {
  images: Artlier[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSeriesImages(): UseSeriesImagesReturn {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [images, setImages] = useState<Artlier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImageFromWalrus = async (id: string, blobId: string) => {
    try {
      
      // 在開始加載時設置狀態
      setImages(prev => prev.map(img => 
        img.id === id 
          ? { ...img, isLoading: true, error: null }
          : img
      ));

      // 直接使用 Walrus 的 URL 作為圖片源
      const imageUrl = `https://agg.test.walrus.eosusa.io/v1/blobs/${blobId}`;
      // console.log('Generated image URL:', imageUrl);
      
      // 測試 URL 是否可訪問
      const response = await fetch(imageUrl);
      // console.log(`Response status: ${response.status}`);
      // console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error('Failed to load image');
      }

      // 直接使用 Walrus URL，而不是創建 Blob URL
      setImages(prev => {
        const newImages = prev.map(img => 
          img.id === id 
            ? { ...img, url: imageUrl, isLoading: false, error: null }
            : img
        );
        // console.log('Updated images:', newImages);
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

  const fetchArtlierData = async () => {
    if (!currentAccount) {
      setError('Wallet not connected');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const artlierState = await suiClient.getObject({
        id: ARTLIER_STATE_ID,
        options: {
          showContent: true,
          showType: true,
        }
      });

      // 從 artlierState 中提取 all_artliers 數組
      const content = artlierState.data?.content;
      if (!content || typeof content !== 'object' || !('fields' in content)) {
        throw new Error('Invalid artlier state data');
      }

      const fields = content.fields as unknown as ArtlierState;
      const allArtliers = fields.all_artliers || [];

      if (allArtliers.length === 0) {
        setImages([]);
        setIsLoading(false);
        return;
      }

      const allArtliersData = await suiClient.multiGetObjects({
        ids: allArtliers,
        options: {
          showContent: true,
          showType: true,
        }
      });

      const artlierImages = allArtliersData.map(obj => {
        const content = obj.data?.content;
        if (!content || typeof content !== 'object' || !('fields' in content)) {
          return {
            id: obj.data?.objectId || '',
            blobId: '',
            url: null,
            title: '',
            social: '',
            isLoading: false,
            error: 'Invalid artlier data'
          };
        }

        const fields = content.fields as unknown as ArtlierFields;
        return {
          id: obj.data?.objectId || '',
          blobId: fields.photo || '',
          url: null,
          title: fields.name || '',
          social: `@${fields.author?.slice(0, 8)}`,
          isLoading: true,
          error: null
        };
      });

      setImages(artlierImages);
      setIsLoading(false);

      // 開始加載每個圖片
      artlierImages.forEach(image => {
        if (image.blobId) {
          fetchImageFromWalrus(image.id, image.blobId);
        }
      });
    } catch (error) {
      console.error('Error fetching Artlier data:', error);
      setError('Failed to fetch Artlier data');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtlierData();

    // Cleanup function to revoke object URLs
    return () => {
      images.forEach(image => {
        if (image.url) {
          URL.revokeObjectURL(image.url);
        }
      });
    };
  }, [currentAccount]);

  return {
    images,
    isLoading,
    error,
    refetch: fetchArtlierData
  };
}