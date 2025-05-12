import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect } from 'react';
import { PACKAGE_ID } from '@/utils/transactions';

interface VaultItem {
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

export function useUserItems(fieldKey: 'ateliers' | 'sculptures') {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      setError(null);

      if (!currentAccount?.address) {
        setError('Please connect your wallet.');
        setItems([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: `${PACKAGE_ID}::archimeters::MemberShip`,
          },
          options: {
            showContent: true,
          },
        });

        if (!objects || !objects.length) {
          setError('No Membership NFT found. Please mint your Membership first.');
          setItems([]);
          setIsLoading(false);
          return;
        }

        const membership = objects[0];
        const content = membership.data?.content as any;
        // console.log(fieldKey,'fieldKey-------')
        // console.log(content,'content-------')
        // console.log(content?.fields?.[fieldKey],'content?.fields?.[fieldKey]-------')
        const objectIds = content?.fields?.[fieldKey]?.fields?.contents || [];

        const results = await suiClient.multiGetObjects({
          ids: objectIds,
          options: {
            showContent: true,
          },
        });

        const parsedItems = results
          .map((object) => {
            if (!object.data?.content) return null;
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
              error: null,
            } as VaultItem;
          })
          .filter((item): item is VaultItem => item !== null);

        setItems(parsedItems);
      } catch (err) {
        console.error(`[useUserItems] Error fetching ${fieldKey}:`, err);
        setError(`Failed to load ${fieldKey}.`);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [currentAccount, suiClient, reloadFlag, fieldKey]);

  const reload = () => setReloadFlag((prev) => prev + 1);

  return {
    items,
    isLoading,
    error,
    reload,
  };
}
