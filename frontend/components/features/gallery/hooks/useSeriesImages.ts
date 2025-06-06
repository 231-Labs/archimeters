import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { ATELIER_STATE_ID } from '@/utils/transactions';

interface AtelierState {
  all_ateliers: string[];
}

interface AtelierFields {
  photo: string;      // 圖片的 blob-id
  name: string;
  author: string;
  price: string;
  publish_time: string;
  algorithm: string;  // 演算法檔案的 blob-id
  artificials: string[];
  data: string;      // JSON 配置檔的 blob-id
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

  // 從 Walrus 獲取圖片
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
      
      // 測試 URL 是否可訪問
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error('Failed to load image');
      }

      // 更新圖片 URL
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

  // 從 Walrus 獲取演算法內容
  const fetchAlgorithmFromWalrus = async (id: string, blobId: string) => {
    try {
      // 直接使用 Walrus 的 URL 獲取演算法內容
      const algorithmUrl = `https://agg.test.walrus.eosusa.io/v1/blobs/${blobId}`;
      
      const response = await fetch(algorithmUrl);
      
      if (!response.ok) {
        throw new Error('Failed to load algorithm');
      }

      // 獲取演算法文本內容
      const algorithmContent = await response.text();

      // 更新演算法內容
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

  // 從 Walrus 獲取配置文件
  const fetchConfigDataFromWalrus = async (id: string, blobId: string) => {
    try {
      // 直接使用 Walrus 的 URL 獲取配置文件
      const configUrl = `https://agg.test.walrus.eosusa.io/v1/blobs/${blobId}`;
      
      const response = await fetch(configUrl);
      
      if (!response.ok) {
        throw new Error('Failed to load config data');
      }

      // 獲取配置文件內容並解析為 JSON
      const configText = await response.text();
      let configData;
      
      try {
        configData = JSON.parse(configText);
      } catch (parseErr) {
        console.error('Failed to parse config data as JSON:', parseErr);
        configData = { rawText: configText }; // 如果解析失敗，保存原始文本
      }

      // 更新配置數據
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

      // 從 atelierState 中提取 all_ateliers 數組
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

      // 開始加載每個 Atelier 的資源
      atelierImages.forEach(image => {
        // 加載圖片
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