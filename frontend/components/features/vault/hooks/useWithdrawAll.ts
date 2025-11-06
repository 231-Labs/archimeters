/**
 * Withdraw All Hook
 * Batch withdraw all Atelier pool balances in a single transaction (PTB)
 */

import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import type { AtelierItem } from './useUserItems';

const ATELIER_PACKAGE = process.env.NEXT_PUBLIC_ATELIER_PACKAGE || '';
const ATELIER_TYPE = ATELIER_PACKAGE ? `${ATELIER_PACKAGE}::atelier::ATELIER` : '';

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

  const withdrawAll = async (ateliers: AtelierItem[]) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    if (!ATELIER_PACKAGE) {
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

      console.log(`📤 Withdrawing from ${ateliersWithBalance.length} ateliers, total: ${total} MIST`);

      // Build PTB (Programmable Transaction Block)
      const tx = new Transaction();

      // Add withdraw_pool call for each atelier
      ateliersWithBalance.forEach((atelier) => {
        const poolAmount = Number(atelier.pool);
        
        console.log(`  - Atelier ${atelier.id}: ${poolAmount} MIST`);

        tx.moveCall({
          target: `${ATELIER_PACKAGE}::atelier::withdraw_pool`,
          arguments: [
            tx.object(atelier.id),
            tx.object(atelier.poolId),
            tx.pure.u64(poolAmount),
            tx.pure.address(currentAccount.address),
          ],
          typeArguments: [ATELIER_TYPE],
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
            console.log(`✅ Batch withdraw successful: ${result.digest}`);
            console.log(`   Total withdrawn: ${total} MIST from ${ateliersWithBalance.length} ateliers`);
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

