import { useState, useCallback } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { NETWORK, SCULPT_TYPE, PACKAGE_ID, SCULPT_TRANSFER_POLICY } from '@/utils/transactions';
import { isTransactionSuccessful, getTransactionError } from '@/utils/transaction-helpers';
import type { KioskInfo } from '../types';

export type PurchaseStatus = 'idle' | 'loading_kiosk' | 'processing' | 'success' | 'error';

interface UseMarketplacePurchaseReturn {
  purchaseSculpt: (sculptId: string, sellerKioskId: string, price: string, targetKioskInfo?: KioskInfo | null) => Promise<void>;
  status: PurchaseStatus;
  error: string | null;
  txDigest: string | null;
  resetStatus: () => void;
}

export function useMarketplacePurchase(): UseMarketplacePurchaseReturn {
  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();

  const getUserKioskInfo = async (): Promise<KioskInfo | null> => {
    if (!currentAccount?.address) return null;

    try {
      const { data: kioskCaps } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: '0x2::kiosk::KioskOwnerCap'
        },
        options: {
          showContent: true,
          showType: true,
        }
      });

      if (kioskCaps && kioskCaps.length > 0) {
        const capObj = kioskCaps[0];
        if (capObj.data?.content && 'fields' in capObj.data.content) {
          const fields = capObj.data.content.fields as any;
          const kioskId = fields.for || fields.kiosk_id;
          const kioskCapId = capObj.data.objectId;
          
          if (kioskId && kioskCapId) {
            return { kioskId, kioskCapId };
          }
        }
      }
      return null;
    } catch (err) {
      console.error('Error fetching kiosk info:', err);
      return null;
    }
  };

  const purchaseSculpt = useCallback(async (
    sculptId: string,
    sellerKioskId: string,
    price: string,
    targetKioskInfo?: KioskInfo | null
  ) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading_kiosk');
      setError(null);

      let kioskInfo: KioskInfo | null = targetKioskInfo || null;
      
      if (!kioskInfo) {
        kioskInfo = await getUserKioskInfo();
      }
      
      if (!kioskInfo) {
        setError('No kiosk found. Please create a kiosk first.');
        setStatus('error');
        return;
      }

      setStatus('processing');

      const tx = new Transaction();
      const priceNum = parseInt(price);
      const royaltyBps = 1000;
      const royaltyAmount = Math.floor((priceNum * royaltyBps) / 10000);
      
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceNum)]);
      const [royaltyCoin] = royaltyAmount > 0 
        ? tx.splitCoins(tx.gas, [tx.pure.u64(royaltyAmount)])
        : [tx.pure.u64(0)];

      const [item, transferRequest] = tx.moveCall({
        target: '0x2::kiosk::purchase',
        arguments: [
          tx.object(sellerKioskId),
          tx.pure.id(sculptId),
          paymentCoin,
        ],
        typeArguments: [SCULPT_TYPE],
      });

      if (royaltyAmount > 0) {
        tx.moveCall({
          target: `${PACKAGE_ID}::royalty_rule::pay`,
          arguments: [
            tx.object(SCULPT_TRANSFER_POLICY),
            transferRequest,
            royaltyCoin,
          ],
          typeArguments: [SCULPT_TYPE],
        });
      }

      tx.moveCall({
        target: '0x2::transfer_policy::confirm_request',
        arguments: [
          tx.object(SCULPT_TRANSFER_POLICY),
          transferRequest,
        ],
        typeArguments: [SCULPT_TYPE],
      });

      tx.moveCall({
        target: '0x2::kiosk::place',
        arguments: [
          tx.object(kioskInfo.kioskId),
          tx.object(kioskInfo.kioskCapId),
          item,
        ],
        typeArguments: [SCULPT_TYPE],
      });

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: `sui:${NETWORK}`,
        },
        {
          onSuccess: (result) => {
            setTxDigest(result.digest);
            
            if (isTransactionSuccessful(result)) {
              setStatus('success');
            } else {
              const txError = getTransactionError(result);
              setError(txError || 'Transaction execution failed');
              setStatus('error');
            }
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Failed to purchase sculpt';
            setError(errorMessage);
            setStatus('error');
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to purchase sculpt';
      setError(errorMessage);
      setStatus('error');
    }
  }, [currentAccount?.address, suiClient, signAndExecuteTransaction]);

  const resetStatus = useCallback(() => {
    setStatus('idle');
    setError(null);
    setTxDigest(null);
  }, []);

  return {
    purchaseSculpt,
    status,
    error,
    txDigest,
    resetStatus,
  };
}
