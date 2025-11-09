import { useSuiClient, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';
import { withdrawAtelierPool, ATELIER_TYPE } from '@/utils/transactions';
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

  const fetchAtelierObject = async () => {
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
          StructType: ATELIER_TYPE
        },
        options: {
          showContent: true,
        },
      });

      for (const object of objects) {
        if (object.data?.objectId === atelierId) {
          return object.data?.objectId;
        }
      }
      const errorMessage = 'No corresponding Atelier found in your wallet';
      setError(errorMessage);
      onStatusChange?.('error', `Withdrawal failed: ${errorMessage}`);
      return null;
    } catch (error) {
      const errorMessage = 'Error fetching Atelier object';
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

      const atelierObjectId = await fetchAtelierObject();
      if (!atelierObjectId) {
        return false;
      }

      const tx = withdrawAtelierPool(atelierObjectId, poolId, poolAmount, currentAccount.address);

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