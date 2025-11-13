import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';

interface MembershipData {
  username: string;
  description: string;
  address: string;
}

export function useMembership() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [membershipId, setMembershipId] = useState<string>('');
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMembership = async () => {
      if (!currentAccount?.address) {
        setMembershipId('');
        setMembershipData(null);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: `${PACKAGE_ID}::archimeters::MemberShip`
          },
          options: {
            showType: true,
            showContent: true,
          }
        });

        if (objects && objects.length > 0) {
          const objectId = objects[0].data?.objectId || '';
          setMembershipId(objectId);
          
          // Extract membership data from content
          const membership = objects[0].data?.content;
          if (membership && 'fields' in membership) {
            const fields = membership.fields as Record<string, unknown>;
            const data = {
              username: String(fields.username || ''),
              description: String(fields.description || ''),
              address: currentAccount.address
            };
            setMembershipData(data);
          }
        } else {
          setMembershipId('');
          setMembershipData(null);
        }
      } catch (err) {
        console.error('Error fetching membership:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch membership');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembership();
  }, [currentAccount, suiClient]);

  return {
    membershipId,
    membershipData,
    setMembershipData,
    isLoading,
    error,
  };
}

