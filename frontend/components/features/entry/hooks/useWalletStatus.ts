import { useState, useEffect } from 'react';
import { useCurrentAccount, useCurrentClient } from '@mysten/dapp-kit-react';
import { PACKAGE_ID } from '@/utils/transactions';
import type { WalletStatus } from '../types';

const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;

export function useWalletStatus() {
  const currentAccount = useCurrentAccount();
  const suiClient = useCurrentClient();
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [isMinting, setIsMinting] = useState(false);

  const checkNFTOwnership = async () => {
    if (!currentAccount) {
      setWalletStatus('disconnected');
      setIsMinting(false);
      return false;
    }

    try {
      const { objects } = await suiClient.listOwnedObjects({
        owner: currentAccount.address,
        type: MEMBERSHIP_TYPE,
        limit: 1,
      });

      if (objects.length > 0) {
        setWalletStatus('connected-with-nft');
        setIsMinting(false);
        return true;
      } else {
        setWalletStatus('connected-no-nft');
        return false;
      }
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
      setWalletStatus('connected-no-nft');
      setIsMinting(false);
      return false;
    }
  };

  useEffect(() => {
    checkNFTOwnership();
  }, [currentAccount, suiClient]);

  return {
    walletStatus,
    isMinting,
    setIsMinting,
    checkNFTOwnership
  };
} 