import { useState, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';

export function useSuiBalance() {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!currentAccount?.address) {
        setBalance(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const balanceData = await suiClient.getBalance({
          owner: currentAccount.address,
          coinType: '0x2::sui::SUI',
        });
        
        setBalance(BigInt(balanceData.totalBalance));
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError('Failed to fetch balance');
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    const intervalId = setInterval(fetchBalance, 10000);

    return () => clearInterval(intervalId);
  }, [currentAccount?.address, suiClient]);

  const hasEnoughBalance = (requiredAmount: bigint): boolean => {
    if (balance === null) return false;
    return balance >= requiredAmount;
  };

  return {
    balance,
    isLoading,
    error,
    hasEnoughBalance,
  };
}

