import { useState, useEffect } from 'react';
import { useCurrentAccount, useCurrentClient } from '@mysten/dapp-kit-react';
import { moveObjectFields, pickField } from '@/lib/sui-object-json';
import { PACKAGE_ID } from '@/utils/transactions';

interface MembershipData {
  username: string;
  description: string;
  address: string;
}

export function useMembership() {
  const currentAccount = useCurrentAccount();
  const suiClient = useCurrentClient();
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
        const { objects } = await suiClient.listOwnedObjects({
          owner: currentAccount.address,
          type: `${PACKAGE_ID}::archimeters::MemberShip`,
          limit: 1,
          include: { json: true },
        });

        if (objects.length > 0) {
          const objectId = objects[0].objectId || '';
          setMembershipId(objectId);

          const fields = moveObjectFields(objects[0].json);
          if (fields) {
            const data = {
              username: String(pickField(fields, 'username') ?? ''),
              description: String(pickField(fields, 'description') ?? ''),
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

