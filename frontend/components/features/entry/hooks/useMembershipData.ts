import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';

interface MemberShipData {
  id: string;
  ateliers: string[];
  username: string;
  description: string;
}

interface UseMembershipDataReturn {
  membership: MemberShipData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;

export function useMembershipData(): UseMembershipDataReturn {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [membership, setMembership] = useState<MemberShipData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembership = async () => {
    if (!currentAccount) {
      setMembership(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data: membershipObjects } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: MEMBERSHIP_TYPE
        },
        options: {
          showContent: true,
          showType: true,
        }
      });

      if (!membershipObjects || membershipObjects.length === 0) {
        setMembership(null);
        setIsLoading(false);
        return;
      }

      const membership = membershipObjects[0];
      const content = membership.data?.content;
      if (!content || typeof content !== 'object' || !('fields' in content)) {
        throw new Error('Invalid membership data');
      }

      const fields = content.fields as any;
      setMembership({
        id: membership.data?.objectId || '',
        ateliers: fields.ateliers?.fields?.contents || [],
        username: fields.username || '',
        description: fields.description || ''
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching membership:', error);
      setError('Failed to fetch membership');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembership();
  }, [currentAccount, suiClient]);

  return {
    membership,
    isLoading,
    error,
    refetch: fetchMembership
  };
} 