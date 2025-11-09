import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

const MARKETPLACE_PACKAGE = process.env.NEXT_PUBLIC_MARKETPLACE_PACKAGE || '';
const ATELIER_PACKAGE = process.env.NEXT_PUBLIC_ATELIER_PACKAGE || '';
const ATELIER_TYPE = ATELIER_PACKAGE ? `${ATELIER_PACKAGE}::atelier::ATELIER` : '';

export type MarketplaceStatus = 'idle' | 'processing' | 'success' | 'error';

interface UseAtelierMarketplaceReturn {
  listAtelier: (atelierId: string, kioskId: string, kioskCapId: string, price: number) => Promise<void>;
  delistAtelier: (atelierId: string, kioskId: string, kioskCapId: string) => Promise<void>;
  purchaseAtelier: (
    atelierId: string,
    sellerKioskId: string,
    poolId: string,
    originalOwner: string,
    price: number,
    royaltyAmount: number,
    policyId: string
  ) => Promise<void>;
  status: MarketplaceStatus;
  error: string | null;
  txDigest: string | null;
  resetStatus: () => void;
}

export function useAtelierMarketplace(): UseAtelierMarketplaceReturn {
  const [status, setStatus] = useState<MarketplaceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  const listAtelier = async (
    atelierId: string,
    kioskId: string,
    kioskCapId: string,
    price: number
  ) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    if (!MARKETPLACE_PACKAGE) {
      setError('Marketplace package address not configured');
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      setError(null);

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${MARKETPLACE_PACKAGE}::atelier_marketplace::list_atelier`,
        arguments: [
          tx.object(kioskId),
          tx.object(kioskCapId),
          tx.object(atelierId),
          tx.pure.u64(price),
        ],
        typeArguments: [ATELIER_TYPE],
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
            const errorMessage = err instanceof Error ? err.message : 'Failed to list atelier';
            setError(errorMessage);
            setStatus('error');
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list atelier';
      setError(errorMessage);
      setStatus('error');
    }
  };

  const delistAtelier = async (
    atelierId: string,
    kioskId: string,
    kioskCapId: string
  ) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    if (!MARKETPLACE_PACKAGE) {
      setError('Marketplace package address not configured');
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      setError(null);

      const tx = new Transaction();
      
      tx.moveCall({
        target: `${MARKETPLACE_PACKAGE}::atelier_marketplace::delist_atelier`,
        arguments: [
          tx.object(kioskId),
          tx.object(kioskCapId),
          tx.pure.id(atelierId),
        ],
        typeArguments: [ATELIER_TYPE],
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
            const errorMessage = err instanceof Error ? err.message : 'Failed to delist atelier';
            setError(errorMessage);
            setStatus('error');
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delist atelier';
      setError(errorMessage);
      setStatus('error');
    }
  };

  const purchaseAtelier = async (
    atelierId: string,
    sellerKioskId: string,
    poolId: string,
    originalOwner: string,
    price: number,
    royaltyAmount: number,
    policyId: string
  ) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    if (!MARKETPLACE_PACKAGE) {
      setError('Marketplace package address not configured');
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      setError(null);

      const tx = new Transaction();
      
      const [paymentCoin] = tx.splitCoins(tx.gas, [price]);
      const [royaltyCoin] = royaltyAmount > 0 
        ? tx.splitCoins(tx.gas, [royaltyAmount])
        : [tx.pure.u64(0)];

      tx.moveCall({
        target: `${MARKETPLACE_PACKAGE}::atelier_marketplace::purchase_atelier_with_pool`,
        arguments: [
          tx.object(sellerKioskId),
          tx.object(poolId),
          tx.pure.id(atelierId),
          tx.pure.address(originalOwner),
          paymentCoin,
          royaltyCoin,
          tx.object(policyId),
        ],
        typeArguments: [ATELIER_TYPE],
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
            const errorMessage = err instanceof Error ? err.message : 'Failed to purchase atelier';
            setError(errorMessage);
            setStatus('error');
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase atelier';
      setError(errorMessage);
      setStatus('error');
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setError(null);
    setTxDigest(null);
  };

  return {
    listAtelier,
    delistAtelier,
    purchaseAtelier,
    status,
    error,
    txDigest,
    resetStatus,
  };
}
