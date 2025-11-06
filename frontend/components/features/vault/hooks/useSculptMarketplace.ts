/**
 * Sculpt Marketplace Hook
 * Handles listing, delisting, and purchasing Sculpts through Kiosk
 */

import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

// TODO: Update with actual contract addresses after deployment
const KIOSK_PACKAGE = '0x2';
const SCULPT_PACKAGE = process.env.NEXT_PUBLIC_SCULPT_PACKAGE || '';
const ATELIER_TYPE = process.env.NEXT_PUBLIC_ATELIER_PACKAGE ? `${process.env.NEXT_PUBLIC_ATELIER_PACKAGE}::atelier::ATELIER` : '';

export type MarketplaceStatus = 'idle' | 'processing' | 'success' | 'error';

interface UseSculptMarketplaceReturn {
  listSculpt: (sculptId: string, kioskId: string, kioskCapId: string, price: number) => Promise<void>;
  delistSculpt: (sculptId: string, kioskId: string, kioskCapId: string) => Promise<void>;
  purchaseSculpt: (sculptId: string, sellerKioskId: string, price: number, royaltyAmount: number, policyId: string) => Promise<void>;
  status: MarketplaceStatus;
  error: string | null;
  txDigest: string | null;
  resetStatus: () => void;
}

export function useSculptMarketplace(): UseSculptMarketplaceReturn {
  const [status, setStatus] = useState<MarketplaceStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();

  const listSculpt = async (
    sculptId: string,
    kioskId: string,
    kioskCapId: string,
    price: number
  ) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      setError(null);

      const tx = new Transaction();
      
      // List the sculpt in the kiosk
      tx.moveCall({
        target: `${KIOSK_PACKAGE}::kiosk::list`,
        arguments: [
          tx.object(kioskId),
          tx.object(kioskCapId),
          tx.pure.id(sculptId),
          tx.pure.u64(price),
        ],
        typeArguments: [`${SCULPT_PACKAGE}::sculpt::Sculpt<${ATELIER_TYPE}>`],
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
            console.log('✅ Sculpt listed successfully:', result.digest);
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Failed to list sculpt';
            setError(errorMessage);
            setStatus('error');
            console.error('❌ List failed:', err);
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list sculpt';
      setError(errorMessage);
      setStatus('error');
      console.error('❌ List error:', err);
    }
  };

  const delistSculpt = async (
    sculptId: string,
    kioskId: string,
    kioskCapId: string
  ) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      setError(null);

      const tx = new Transaction();
      
      // Delist the sculpt from the kiosk
      tx.moveCall({
        target: `${KIOSK_PACKAGE}::kiosk::delist`,
        arguments: [
          tx.object(kioskId),
          tx.object(kioskCapId),
          tx.pure.id(sculptId),
        ],
        typeArguments: [`${SCULPT_PACKAGE}::sculpt::Sculpt<${ATELIER_TYPE}>`],
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
            console.log('✅ Sculpt delisted successfully:', result.digest);
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delist sculpt';
            setError(errorMessage);
            setStatus('error');
            console.error('❌ Delist failed:', err);
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delist sculpt';
      setError(errorMessage);
      setStatus('error');
      console.error('❌ Delist error:', err);
    }
  };

  const purchaseSculpt = async (
    sculptId: string,
    sellerKioskId: string,
    price: number,
    royaltyAmount: number,
    policyId: string
  ) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      setError(null);

      const tx = new Transaction();
      
      // Split coins for payment and royalty
      const [paymentCoin] = tx.splitCoins(tx.gas, [price]);
      const [royaltyCoin] = royaltyAmount > 0 
        ? tx.splitCoins(tx.gas, [royaltyAmount])
        : [tx.pure.u64(0)];

      // Purchase from kiosk
      const purchased = tx.moveCall({
        target: `${KIOSK_PACKAGE}::kiosk::purchase`,
        arguments: [
          tx.object(sellerKioskId),
          tx.pure.id(sculptId),
          paymentCoin,
        ],
        typeArguments: [`${SCULPT_PACKAGE}::sculpt::Sculpt<${ATELIER_TYPE}>`],
      });

      // If there's royalty, pay it
      if (royaltyAmount > 0) {
        tx.moveCall({
          target: `${process.env.NEXT_PUBLIC_ARCHIMETERS_PACKAGE}::royalty_rule::pay`,
          arguments: [
            tx.object(policyId),
            purchased[1], // transfer_request
            royaltyCoin,
          ],
          typeArguments: [`${SCULPT_PACKAGE}::sculpt::Sculpt<${ATELIER_TYPE}>`],
        });
      }

      // Confirm the transfer request
      tx.moveCall({
        target: `0x2::transfer_policy::confirm_request`,
        arguments: [
          tx.object(policyId),
          purchased[1], // transfer_request
        ],
        typeArguments: [`${SCULPT_PACKAGE}::sculpt::Sculpt<${ATELIER_TYPE}>`],
      });

      // Transfer to buyer
      tx.transferObjects([purchased[0]], currentAccount.address);

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            setTxDigest(result.digest);
            setStatus('success');
            console.log('✅ Sculpt purchased successfully:', result.digest);
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Failed to purchase sculpt';
            setError(errorMessage);
            setStatus('error');
            console.error('❌ Purchase failed:', err);
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase sculpt';
      setError(errorMessage);
      setStatus('error');
      console.error('❌ Purchase error:', err);
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setError(null);
    setTxDigest(null);
  };

  return {
    listSculpt,
    delistSculpt,
    purchaseSculpt,
    status,
    error,
    txDigest,
    resetStatus,
  };
}

