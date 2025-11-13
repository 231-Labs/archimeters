import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';
import { withdrawAtelierPool, ATELIER_TYPE, PACKAGE_ID } from '@/utils/transactions';
import { isTransactionSuccessful, getTransactionError } from '@/utils/transaction-helpers';

interface UseAtelierWithdrawProps {
  atelierId: string;
  poolId: string;
  onStatusChange?: (status: 'idle' | 'processing' | 'success' | 'error', message?: string, txDigest?: string) => void;
}

export function useAtelierWithdraw({ atelierId, poolId, onStatusChange }: UseAtelierWithdrawProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const fetchPoolCap = async () => {
    if (!currentAccount?.address) {
      const errorMessage = 'Please connect your wallet';
      setError(errorMessage);
      onStatusChange?.('error', `Withdrawal failed: ${errorMessage}`);
      return null;
    }

    try {
      // Fetch all AtelierPoolCap objects owned by the user
      const { data: objects } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::atelier::AtelierPoolCap<${PACKAGE_ID}::atelier::ATELIER>`
        },
        options: {
          showContent: true,
        },
      });

      // Find the PoolCap that matches this pool
      for (const object of objects) {
        if (!object.data?.content) continue;
        const content = object.data.content as any;
        const capPoolId = content.fields?.pool_id;
        
        if (capPoolId === poolId) {
          return object.data.objectId;
        }
      }

      const errorMessage = 'No AtelierPoolCap found for this pool. You may not have withdrawal rights.';
      setError(errorMessage);
      onStatusChange?.('error', `Withdrawal failed: ${errorMessage}`);
      return null;
    } catch (error) {
      console.error('Error fetching PoolCap:', error);
      const errorMessage = 'Error fetching withdrawal capability';
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

      const poolCapId = await fetchPoolCap();
      if (!poolCapId) {
        return false;
      }

      const tx = withdrawAtelierPool(poolCapId, atelierId, poolId, poolAmount, currentAccount.address);

      return new Promise<boolean>((resolve) => {
        signAndExecuteTransaction(
          {
            transaction: tx as any,
            chain: 'sui:testnet',
          },
          {
            onSuccess: (result) => {
              if (isTransactionSuccessful(result)) {
                const txHash = result?.digest ? ` (tx: ${result.digest})` : '';
                onStatusChange?.('success', `Withdrawal successful!${txHash}`, result?.digest);
                resolve(true);
              } else {
                const txError = getTransactionError(result);
                const errorMsg = txError || 'Transaction execution failed';
                setError(errorMsg);
                onStatusChange?.('error', errorMsg);
                setIsWithdrawing(false);
                resolve(false);
              }
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
      onStatusChange?.('error', `Withdrawal failed: ${errorMessage}`);
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