import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect } from 'react';
import { PACKAGE_ID } from '@/utils/transactions';

interface Atelier {
  id: string;
  photoBlobId: string;
  title: string;
  author: string;
  price: string;
  pool: string;
  publish_time: string;
  isLoading: boolean;
  error: string | null;
}

export function useUserAteliers() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [ateliers, setAteliers] = useState<Atelier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  const fetchMembershipNFT = async () => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet to view your Ateliers.');
      return null;
    }

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
      setError('No Membership NFT found. Please mint your Membership first.');
      return null;
    } catch (error) {
      setError('Error fetching Membership NFT.');
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

      const ateliers = objects.map(object => {
        if (object.data?.content) {
          const content = object.data.content as any;
          return {
            id: object.data.objectId,
            photoBlobId: content.fields.photo || '',
            title: content.fields.name || '',
            author: content.fields.author || '',
            price: content.fields.price || '',
            pool: content.fields.pool || '',
            publish_time: content.fields.publish_time
              ? new Date(Number(content.fields.publish_time)).toLocaleDateString('en-CA')
              : '',
            isLoading: false,
            error: null
          } as Atelier;
        }
        return null;
      }).filter((atelier): atelier is Atelier => atelier !== null);

      console.log('[useUserAteliers] fetchAtelierData result:', ateliers);
      return ateliers;
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
          console.log('[useUserAteliers] setAteliers:', ateliers);
          setAteliers(ateliers);
        } else {
          setAteliers([]);
        }
      } catch (error) {
        setError('Failed to load ateliers.');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentAccount) {
      loadAteliers();
    } else {
      setError('Please connect your wallet to view your Ateliers.');
      setAteliers([]);
      setIsLoading(false);
    }
  }, [currentAccount, suiClient, reloadFlag]);

  // 新增 reload 方法
  const reload = () => setReloadFlag((f) => f + 1);

  return {
    ateliers,
    isLoading,
    error,
    reload,
  };
} 