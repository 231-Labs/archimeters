import { useCurrentClient, useCurrentAccount, useDAppKit } from '@mysten/dapp-kit-react';
import { useState } from 'react';
import { withdrawAtelierPool, PACKAGE_ID } from '@/utils/transactions';
import { isTransactionSuccessful, getTransactionError, getEffectsResultDigest } from '@/utils/transaction-helpers';
import { listAllOwnedObjectsByType } from '@/lib/list-owned-objects';
import { moveObjectFields, pickField } from '@/lib/sui-object-json';

interface UseAtelierWithdrawProps {
  atelierId: string;
  poolId: string;
  onStatusChange?: (status: 'idle' | 'processing' | 'success' | 'error', message?: string, txDigest?: string) => void;
}

export function useAtelierWithdraw({ atelierId, poolId, onStatusChange }: UseAtelierWithdrawProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const suiClient = useCurrentClient();
  const currentAccount = useCurrentAccount();
  const dAppKit = useDAppKit();

  const fetchPoolCap = async () => {
    if (!currentAccount?.address) {
      const errorMessage = 'Please connect your wallet';
      setError(errorMessage);
      onStatusChange?.('error', `Withdrawal failed: ${errorMessage}`);
      return null;
    }

    try {
      // Fetch all AtelierPoolCap objects owned by the user
      const objects = await listAllOwnedObjectsByType(
        suiClient,
        currentAccount.address,
        `${PACKAGE_ID}::atelier::AtelierPoolCap<${PACKAGE_ID}::atelier::ATELIER>`
      );

      for (const object of objects) {
        const fields = moveObjectFields(object.json);
        const capPoolId = String(pickField(fields, 'pool_id', 'poolId') ?? '');

        if (capPoolId === poolId) {
          return object.objectId;
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

      try {
        const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });
        if (isTransactionSuccessful(result)) {
          const digest = getEffectsResultDigest(result);
          const txHash = digest ? ` (tx: ${digest})` : '';
          onStatusChange?.('success', `Withdrawal successful!${txHash}`, digest);
          return true;
        }
        const txError = getTransactionError(result);
        const errorMsg = txError || 'Transaction execution failed';
        setError(errorMsg);
        onStatusChange?.('error', errorMsg);
        return false;
      } catch (error) {
        console.error('Transaction failed:', error);
        const msg = error instanceof Error ? error.message : 'Withdrawal failed';
        const finalErrorMsg = msg.toLowerCase().includes('rejected')
          ? 'Transaction cancelled by user'
          : msg;
        setError(finalErrorMsg);
        onStatusChange?.('error', finalErrorMsg);
        return false;
      }
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