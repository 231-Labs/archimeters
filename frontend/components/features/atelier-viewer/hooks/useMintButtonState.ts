import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { MIST_PER_SUI } from '@/utils/transactions';
import { MintButtonState, Atelier } from '../types';

export const useMintButtonState = (
  hasMembership: boolean,
  atelier: Atelier | null
) => {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [suiBalance, setSuiBalance] = useState<bigint>(BigInt(0));
  const [mintButtonState, setMintButtonState] = useState<MintButtonState>({
    disabled: true,
    tooltip: 'Please connect your wallet',
  });

  useEffect(() => {
    const checkBalance = async () => {
      if (!currentAccount) {
        setSuiBalance(BigInt(0));
        return;
      }

      try {
        const { totalBalance } = await suiClient.getBalance({
          owner: currentAccount.address,
          coinType: '0x2::sui::SUI'
        });

        setSuiBalance(BigInt(totalBalance));
      } catch (error) {
        console.error('Error checking SUI balance:', error);
        setSuiBalance(BigInt(0));
      }
    };

    checkBalance();
  }, [currentAccount, suiClient]);

  useEffect(() => {
    if (!currentAccount) {
      setMintButtonState({
        disabled: true,
        tooltip: 'Please connect your wallet'
      });
      return;
    }

    if (!hasMembership) {
      setMintButtonState({
        disabled: true,
        tooltip: 'Membership NFT required'
      });
      return;
    }

    if (!atelier) {
      setMintButtonState({
        disabled: true,
        tooltip: 'Loading artwork information'
      });
      return;
    }

    try {
      const price = BigInt(atelier.price);
      const gasEstimate = BigInt(10000000);
      const totalNeeded = price + gasEstimate;
      
      if (suiBalance < totalNeeded) {
        const totalNeededSui = Number(totalNeeded) / MIST_PER_SUI;
        setMintButtonState({
          disabled: true,
          tooltip: `Insufficient balance, need ${totalNeededSui.toFixed(2)} SUI`
        });
        return;
      }

      setMintButtonState({
        disabled: false,
        tooltip: 'Click to mint'
      });
    } catch (error) {
      console.error('Error checking balance:', error);
      setMintButtonState({
        disabled: true,
        tooltip: 'Error checking price'
      });
    }
  }, [currentAccount, hasMembership, suiBalance, atelier?.price]);

  return { mintButtonState, suiBalance };
};

