import { useState, useEffect, useCallback } from 'react';
import { useCurrentAccount, useCurrentClient } from '@mysten/dapp-kit-react';
import { MEMBERSHIP_TYPE } from '@/utils/transactions';

export const useMembershipCheck = () => {
  const currentAccount = useCurrentAccount();
  const suiClient = useCurrentClient();
  const [hasMembership, setHasMembership] = useState(false);

  const checkMembershipNFT = useCallback(async () => {
    if (!currentAccount) {
      setHasMembership(false);
      sessionStorage.removeItem('membership-id');
      return false;
    }

    try {
      const { objects } = await suiClient.listOwnedObjects({
        owner: currentAccount.address,
        type: MEMBERSHIP_TYPE,
        limit: 1,
      });

      const hasNFT = objects.length > 0;
      setHasMembership(hasNFT);
      
      if (hasNFT && objects[0].objectId) {
        sessionStorage.setItem('membership-id', objects[0].objectId);
      } else {
        sessionStorage.removeItem('membership-id');
      }
      
      return hasNFT;
    } catch (error) {
      console.error('Error checking membershipNFT ownership:', error);
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

