import { useState, useEffect } from 'react';
import { useSuiClient } from '@mysten/dapp-kit';
import { useMembershipData } from '@/components/features/entry/hooks/useMembershipData';

interface Atelier {
  id: string;
  photoBlobId: string;
  title: string;
  author: string;
  price: string;
  isLoading: boolean;
  error: string | null;
}

interface UseUserAteliersReturn {
  images: Atelier[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserAteliers(): UseUserAteliersReturn {
  const suiClient = useSuiClient();
  const { membership, isLoading: membershipLoading, error: membershipError, refetch: refetchMembership } = useMembershipData();
  const [images, setImages] = useState<Atelier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAteliers = async () => {
    if (!membership) {
      setImages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const atelierIds = membership.ateliers;

      if (atelierIds.length === 0) {
        setImages([]);
        setIsLoading(false);
        return;
      }

      // 獲取每個 Atelier 的詳細信息
      const atelierObjects = await suiClient.multiGetObjects({
        ids: atelierIds,
        options: {
          showContent: true,
          showType: true,
        }
      });

      const atelierImages = atelierObjects.map(obj => {
        const content = obj.data?.content;
        if (!content || typeof content !== 'object' || !('fields' in content)) {
          return {
            id: obj.data?.objectId || '',
            photoBlobId: '',
            title: '',
            author: '',
            price: '',
            isLoading: false,
            error: 'Invalid atelier data'
          };
        }

        const fields = content.fields as any;
        return {
          id: obj.data?.objectId || '',
          photoBlobId: fields.photo || '',
          title: fields.name || '',
          author: fields.author || '',
          price: fields.price || '',
          isLoading: true,
          error: null
        };
      });

      setImages(atelierImages);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user ateliers:', error);
      setError('Failed to fetch ateliers');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!membershipLoading) {
      fetchUserAteliers();
    }
  }, [membership, membershipLoading]);

  const refetch = async () => {
    await refetchMembership();
    await fetchUserAteliers();
  };

  return {
    images,
    isLoading: isLoading || membershipLoading,
    error: error || membershipError,
    refetch
  };
} 