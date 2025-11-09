import { useState } from 'react';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { SCULPT_TYPE, PACKAGE_ID } from '@/utils/transactions';
import { KioskClient, KioskTransaction, Network } from '@mysten/kiosk';

const KIOSK_PACKAGE = '0x2';

export type MarketplaceStatus = 'idle' | 'processing' | 'success' | 'error';

interface UseSculptMarketplaceReturn {
  listSculpt: (sculptId: string, kioskId: string, kioskCapId: string, price: number, onSuccessCallback?: () => void) => Promise<void>;
  delistSculpt: (sculptId: string, kioskId: string, kioskCapId: string, onSuccessCallback?: () => void) => Promise<void>;
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
  const suiClient = useSuiClient();

  const listSculpt = async (
    sculptId: string,
    kioskId: string,
    kioskCapId: string,
    price: number,
    onSuccessCallback?: () => void
  ) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      setError(null);

      const kioskClient = new KioskClient({
        client: suiClient as any,
        network: Network.TESTNET,
      });

      const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({
        address: currentAccount.address,
      });

      const cap = kioskOwnerCaps.find(c => c.kioskId === kioskId);
      if (!cap) {
        throw new Error(`Could not find KioskOwnerCap for Kiosk ${kioskId}`);
      }

      const tx = new Transaction();
      const kioskTx = new KioskTransaction({
        transaction: tx,
        kioskClient,
        cap,
      });

      kioskTx.list({
        itemId: sculptId,
        itemType: SCULPT_TYPE,
        price: BigInt(price),
      });

      kioskTx.finalize();

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            setTxDigest(result.digest);
            setStatus('success');
            if (onSuccessCallback) {
              onSuccessCallback();
            }
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Failed to list sculpt';
            setError(errorMessage);
            setStatus('error');
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list sculpt';
      setError(errorMessage);
      setStatus('error');
    }
  };

  const delistSculpt = async (
    sculptId: string,
    kioskId: string,
    kioskCapId: string,
    onSuccessCallback?: () => void
  ) => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return;
    }

    try {
      setStatus('processing');
      setError(null);

      const kioskClient = new KioskClient({
        client: suiClient as any,
        network: Network.TESTNET,
      });

      const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({
        address: currentAccount.address,
      });

      const cap = kioskOwnerCaps.find(c => c.kioskId === kioskId);
      if (!cap) {
        throw new Error(`Could not find KioskOwnerCap for Kiosk ${kioskId}`);
      }

      const tx = new Transaction();
      const kioskTx = new KioskTransaction({
        transaction: tx,
        kioskClient,
        cap,
      });

      kioskTx.delist({
        itemId: sculptId,
        itemType: SCULPT_TYPE,
      });

      kioskTx.finalize();

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            setTxDigest(result.digest);
            setStatus('success');
            if (onSuccessCallback) {
              onSuccessCallback();
            }
          },
          onError: (err) => {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delist sculpt';
            setError(errorMessage);
            setStatus('error');
          },
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delist sculpt';
      setError(errorMessage);
      setStatus('error');
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
      
      const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(price)]);
      const [royaltyCoin] = royaltyAmount > 0 
        ? tx.splitCoins(tx.gas, [tx.pure.u64(royaltyAmount)])
        : [tx.pure.u64(0)];

      const purchased = tx.moveCall({
        target: `${KIOSK_PACKAGE}::kiosk::purchase`,
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
            tx.object(policyId),
            purchased[1],
            royaltyCoin,
          ],
          typeArguments: [SCULPT_TYPE],
        });
      }

      tx.moveCall({
        target: `0x2::transfer_policy::confirm_request`,
        arguments: [
          tx.object(policyId),
          purchased[1],
        ],
        typeArguments: [SCULPT_TYPE],
      });

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
