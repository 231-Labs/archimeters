/**
 * Withdraw All Hook
 * Batch withdraw all Atelier pool balances in a single transaction (PTB)
 */

import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { PACKAGE_ID } from '@/utils/transactions';
import type { AtelierItem } from './useUserItems';

// Type argument for withdraw_pool - just the generic type parameter
const ATELIER_TYPE_ARG = `${PACKAGE_ID}::atelier::ATELIER`;

export type WithdrawStatus = 'idle' | 'processing' | 'success' | 'error';

interface UseWithdrawAllReturn {
  withdrawAll: (ateliers: AtelierItem[]) => Promise<void>;
  status: WithdrawStatus;
  error: string | null;
  txDigest: string | null;
  totalWithdrawn: number;
  resetStatus: () => void;
}

export function useWithdrawAll(): UseWithdrawAllReturn {
  const [status, setStatus] = useState<WithdrawStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(0);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  const withdrawAll = async (ateliers: AtelierItem[]) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    if (!PACKAGE_ID) {
      setError('Atelier package address not configured');
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      setError(null);
      setTotalWithdrawn(0);

      // Filter ateliers with non-zero balance
      const ateliersWithBalance = ateliers.filter(atelier => {
        const pool = Number(atelier.pool);
        return pool > 0;
      });

      if (ateliersWithBalance.length === 0) {
        setError('No ateliers with balance to withdraw');
        setStatus('error');
        return;
      }

      // Calculate total amount to withdraw
      const total = ateliersWithBalance.reduce((sum, atelier) => {
        return sum + Number(atelier.pool);
      }, 0);
      setTotalWithdrawn(total);

      // Fetch all AtelierPoolCap objects owned by the user
      const { data: poolCapObjects } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: `${PACKAGE_ID}::atelier::AtelierPoolCap<${ATELIER_TYPE_ARG}>`
        },
        options: {
          showContent: true,
        },
      });

      // Create a map of poolId -> poolCapId
      const poolCapMap = new Map<string, string>();
      for (const obj of poolCapObjects) {
        if (!obj.data?.content) continue;
        const content = obj.data.content as any;
        const poolId = content.fields?.pool_id;
        if (poolId) {
          poolCapMap.set(poolId, obj.data.objectId);
        }
      }

      const tx = new Transaction();

      ateliersWithBalance.forEach((atelier) => {
        const poolCapId = poolCapMap.get(atelier.poolId);
        if (!poolCapId) {
          console.warn(`No PoolCap found for atelier ${atelier.id}, skipping`);
          return;
        }

        const poolAmount = Number(atelier.pool);
        tx.moveCall({
          target: `${PACKAGE_ID}::atelier::withdraw_pool`,
          typeArguments: [ATELIER_TYPE_ARG],
          arguments: [
            tx.object(poolCapId),  // PoolCap first
            tx.object(atelier.id),
            tx.object(atelier.poolId),
            tx.pure.u64(poolAmount),
            tx.pure.address(currentAccount.address),
          ],
        });
      });

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            setTxDigest(result.digest);
            setStatus('success');
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw';
            setError(errorMessage);
            setStatus('error');
            console.error('❌ Batch withdraw failed:', err);
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to withdraw';
      setError(errorMessage);
      setStatus('error');
      console.error('❌ Batch withdraw error:', err);
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setError(null);
    setTxDigest(null);
    setTotalWithdrawn(0);
  };

  return {
    withdrawAll,
    status,
    error,
    txDigest,
    totalWithdrawn,
    resetStatus,
  };
}

