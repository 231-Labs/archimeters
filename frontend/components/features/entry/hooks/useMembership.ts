import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { mintMembership } from '@/utils/transactions';

export function useMembership(onSuccess?: () => void) {
  const currentAccount = useCurrentAccount();
  const [digest, setDigest] = useState('');
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handleInitializeOS = async (username: string, description: string) => {
    if (!currentAccount?.address || !username.trim() || !description.trim()) return;

    try {
      const tx = await mintMembership(username, description);

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            setDigest(result.digest);
            onSuccess?.();
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
          }
        }
      );
    } catch (error) {
      console.error('Error in handleInitializeOS:', error);
    }
  };

  return {
    digest,
    handleInitializeOS
  };
} 