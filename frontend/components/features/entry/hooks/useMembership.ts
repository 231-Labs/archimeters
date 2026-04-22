import { useState } from 'react';
import { useCurrentAccount, useDAppKit } from '@mysten/dapp-kit-react';
import { mintMembership } from '@/utils/transactions';
import { getExecutedTransactionDigest } from '@/lib/transaction-result';

export function useMembership(onSuccess?: () => void) {
  const currentAccount = useCurrentAccount();
  const dAppKit = useDAppKit();
  const [digest, setDigest] = useState('');

  const handleInitializeOS = async (username: string, description: string) => {
    if (!currentAccount?.address || !username.trim() || !description.trim()) return;

    try {
      const tx = mintMembership(username, description);

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      console.log('Transaction successful:', result);
      setDigest(getExecutedTransactionDigest(result));
      onSuccess?.();
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return {
    digest,
    handleInitializeOS
  };
} 