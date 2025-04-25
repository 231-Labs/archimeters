import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';
import { ARTLIER_STATE_ID } from '@/utils/transactions';

const ARTLLIER_TYPE = `${PACKAGE_ID}::archimeters::Artlier`;

interface Artlier {
  id: string;
  blobId: string;
  url: string | null;
  title: string;
  social: string;
  isLoading: boolean;
  error: string | null;
}

export function useSeriesImages() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [images, setImages] = useState<Artlier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtlierData = async () => {
    if (!currentAccount) {
      setError('Wallet not connected');
      setIsLoading(false);
      return;
    }

    try {
      const { data: artlierIds } = await suiClient.getObject({
        id: ARTLIER_STATE_ID,
        options: {
          showContent: true,
          showType: true,
        }
      });

      console.log(artlierIds);
    } catch (error) {
      console.error('Error fetching Artlier data:', error);
      setError('Failed to fetch Artlier data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtlierData();
  }, [currentAccount]);

  return {
    images,
    isLoading,
    error,
    refetch: fetchArtlierData
  };
}