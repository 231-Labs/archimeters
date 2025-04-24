import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';
import type { WalletStatus } from '../types';

const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;

export function useWalletStatus() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [isMinting, setIsMinting] = useState(false);

  const checkNFTOwnership = async () => {
    if (!currentAccount) {
      setWalletStatus('disconnected');
      setIsMinting(false);
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

      if (objects && objects.length > 0) {
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