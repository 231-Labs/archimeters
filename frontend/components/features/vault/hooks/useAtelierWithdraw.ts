import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';
import { withdrawAtelierPool } from '@/utils/transactions';
import { PACKAGE_ID } from '@/utils/transactions';

interface UseAtelierWithdrawProps {
  atelierId: string;
}

export function useAtelierWithdraw({ atelierId }: UseAtelierWithdrawProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const fetchAtelierCap = async () => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      return null;
    }

    try {
      const { data: objects } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::atelier::AtelierCap`
        },
        options: {
          showContent: true,
        }
      });

      for (const object of objects) {
        const content = object.data?.content as any;
        if (content?.fields?.atelier_id === atelierId) {
          return object.data?.objectId;
        }
      }
      setError('No corresponding AtelierCap found');
      return null;
    } catch (error) {
      setError('Error fetching AtelierCap');
      return null;
    }
  };

  const handleWithdraw = async (poolAmount: number, onSuccess?: () => void) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      return;
    }

    try {
      setIsWithdrawing(true);
      setError(null);

      const cap = await fetchAtelierCap();
      if (!cap) {
        return;
      }

      const tx = await withdrawAtelierPool(
        atelierId,
        cap,
        poolAmount
      );

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            onSuccess?.();
            return true;
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            setError('Withdrawal failed');
            return false;
          }
        }
      );
    } catch (error) {
      setError('Withdrawal failed');
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    handleWithdraw,
    isWithdrawing,
    error
  };
} 