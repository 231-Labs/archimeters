import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { MEMBERSHIP_TYPE } from '@/utils/transactions';

export const useMembershipCheck = () => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [hasMembership, setHasMembership] = useState(false);

  const checkMembershipNFT = useCallback(async () => {
    if (!currentAccount) {
      setHasMembership(false);
      sessionStorage.removeItem('membership-id');
      return false;
    }

    try {
      const { data: objects } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: MEMBERSHIP_TYPE
        },
        options: {
          showType: true,
        }
      });

      const hasNFT = objects && objects.length > 0;
      setHasMembership(hasNFT);
      
      if (hasNFT && objects[0].data?.objectId) {
        sessionStorage.setItem('membership-id', objects[0].data.objectId);
      } else {
        sessionStorage.removeItem('membership-id');
      }
      
      return hasNFT;
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
      setHasMembership(false);
      sessionStorage.removeItem('membership-id');
      return false;
    }
  }, [currentAccount, suiClient]);

  useEffect(() => {
    checkMembershipNFT();
  }, [currentAccount, checkMembershipNFT]);

  return { hasMembership, checkMembershipNFT };
};

