import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect } from 'react';
import { PACKAGE_ID } from '@/utils/transactions';

interface Atelier {
  id: string;
  photoBlobId: string;
  title: string;
  author: string;
  price: string;
  isLoading: boolean;
  error: string | null;
}

export function useUserAteliers() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [ateliers, setAteliers] = useState<Atelier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembershipNFT = async () => {
    if (!currentAccount?.address) return null;

    try {
      const { data: objects } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::archimeters::MemberShip`
        },
        options: {
          showContent: true,
        }
      });

      if (objects && objects.length > 0) {
        return objects[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching membership NFT:', error);
      return null;
    }
  };

  // Get Atelier data
  const fetchAtelierData = async (objectIds: string[]) => {
    try {
      const objects = await suiClient.multiGetObjects({
        ids: objectIds,
        options: {
          showContent: true,
        }
      });

      return objects.map(object => {
        if (object.data?.content) {
          const content = object.data.content as any;
          return {
            id: object.data.objectId,
            photoBlobId: content.fields.photo || '',
            title: content.fields.name || '',
            author: content.fields.author || '',
            price: content.fields.price || '',
            isLoading: false,
            error: null
          } as Atelier;
        }
        return null;
      }).filter((atelier): atelier is Atelier => atelier !== null);
    } catch (error) {
      console.error('Error fetching atelier data:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadAteliers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const membershipNFT = await fetchMembershipNFT();
        if (!membershipNFT) {
          setAteliers([]);
          setIsLoading(false);
          return;
        }

        const content = membershipNFT.data?.content as any;
        const atelierIds = content?.fields?.ateliers?.fields?.contents || [];

        if (atelierIds.length > 0) {
          const ateliers = await fetchAtelierData(atelierIds);
          setAteliers(ateliers);
        } else {
          setAteliers([]);
        }
      } catch (error) {
        setError('Failed to load ateliers');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentAccount) {
      loadAteliers();
    }
  }, [currentAccount, suiClient]);

  return {
    ateliers,
    isLoading,
    error
  };
} 