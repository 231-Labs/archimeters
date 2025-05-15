import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';
import { withdrawAtelierPool } from '@/utils/transactions';
import { PACKAGE_ID } from '@/utils/transactions';

interface UseAtelierWithdrawProps {
  atelierId: string;
  onStatusChange?: (status: 'idle' | 'processing' | 'success' | 'error', message?: string, txDigest?: string) => void;
}

export function useAtelierWithdraw({ atelierId, onStatusChange }: UseAtelierWithdrawProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const fetchAtelierCap = async () => {
    if (!currentAccount?.address) {
      const errorMessage = 'Please connect your wallet';
      setError(errorMessage);
      onStatusChange?.('error', `Withdrawal failed: ${errorMessage}`);
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
        },
      });

      for (const object of objects) {
        const content = object.data?.content as any;
        if (content?.fields?.atelier_id === atelierId) {
          return object.data?.objectId;
        }
      }
      const errorMessage = 'No corresponding AtelierCap found';
      setError(errorMessage);
      onStatusChange?.('error', `Withdrawal failed${errorMessage}`);
      return null;
    } catch (error) {
      const errorMessage = 'Error fetching AtelierCap';
      setError(errorMessage);
      onStatusChange?.('error', `Withdrawal failed: ${errorMessage}`);
      return null;
    }
  };

  const handleWithdraw = async (poolAmount: number): Promise<boolean> => {
    if (!currentAccount?.address) {
      const errorMessage = 'Please connect your wallet';
      setError(errorMessage);
      onStatusChange?.('error', `Withdrawal failed: ${errorMessage}`);
      return false;
    }

    try {
      setIsWithdrawing(true);
      setError(null);
      onStatusChange?.('processing', 'Withdrawal processing...');

      const cap = await fetchAtelierCap();
      if (!cap) {
        return false;
      }

      const tx = await withdrawAtelierPool(atelierId, cap, poolAmount);

      return new Promise<boolean>((resolve) => {
        signAndExecuteTransaction(
          {
            transaction: tx as any,
            chain: 'sui:testnet',
          },
          {
            onSuccess: (result) => {
              const txHash = result?.digest ? ` (tx: ${result.digest})` : '';
              onStatusChange?.('success', `Withdrawal successful!${txHash}`, result?.digest);
              resolve(true);
            },
            onError: (error) => {
              console.error("Transaction failed:", error);
              const finalErrorMsg = (error.message || 'Withdrawal failed')
                .toLowerCase().includes('rejected')
                  ? 'Transaction cancelled by user'
                  : error.message || 'Withdrawal failed';
              
              setError(finalErrorMsg);
              onStatusChange?.('error', finalErrorMsg);
              setIsWithdrawing(false);
              resolve(false);
            },
          }
        );
      });
    } catch (error) {
      console.error("Error in handleWithdraw:", error);
      const errorMessage = 'Withdrawal failed';
      setError(errorMessage);
      onStatusChange?.('error', `Withdrawal failed:${errorMessage}`);
      return false;
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    handleWithdraw,
    isWithdrawing,
    error,
  };
}