import { useState, useEffect } from 'react';
import { useCurrentAccount, useCurrentClient } from '@mysten/dapp-kit-react';
import { moveObjectFields, pickField } from '@/lib/sui-object-json';
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
  const suiClient = useCurrentClient();
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
      const { objects: membershipObjects } = await suiClient.listOwnedObjects({
        owner: currentAccount.address,
        type: MEMBERSHIP_TYPE,
        limit: 1,
        include: { json: true },
      });

      if (!membershipObjects.length) {
        setMembership(null);
        setIsLoading(false);
        return;
      }

      const membership = membershipObjects[0];
      const fields = moveObjectFields(membership.json);
      if (!fields) {
        throw new Error('Invalid membership data');
      }

      const ateliersRaw = pickField(fields, 'ateliers') as Record<string, unknown> | undefined;
      const atelierContents =
        ateliersRaw &&
        typeof ateliersRaw === 'object' &&
        'fields' in ateliersRaw &&
        typeof (ateliersRaw as { fields?: unknown }).fields === 'object' &&
        (ateliersRaw as { fields?: { contents?: unknown } }).fields !== null
          ? ((ateliersRaw as { fields: { contents?: unknown[] } }).fields.contents ?? [])
          : [];

      setMembership({
        id: membership.objectId || '',
        ateliers: Array.isArray(atelierContents) ? atelierContents.map(String) : [],
        username: String(pickField(fields, 'username') ?? ''),
        description: String(pickField(fields, 'description') ?? ''),
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