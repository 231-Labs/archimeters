import { useState, useCallback } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { createArtlier, ATELIER_STATE_ID } from '@/utils/transactions';
import type { UploadResults } from '../types';

interface TransactionState {
  transactionDigest: string;
  transactionError: string;
  isProcessing: boolean;
}

interface UseTransactionOptions {
  membershipId: string;
  workName: string;
  price: string;
  onSuccess?: (digest: string) => void;
  onError?: (error: string) => void;
}

export function useTransaction({
  membershipId,
  workName,
  price,
  onSuccess,
  onError,
}: UseTransactionOptions) {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [state, setState] = useState<TransactionState>({
    transactionDigest: '',
    transactionError: '',
    isProcessing: false,
  });

  const handleMint = useCallback(async (uploadResults: UploadResults) => {
    if (!membershipId) {
      const errorMsg = 'Membership ID not found';
      console.error('No membership ID available');
      setState(prev => ({ ...prev, transactionError: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    if (!uploadResults) {
      const errorMsg = 'Upload results not found';
      console.error('No upload results available');
      setState(prev => ({ ...prev, transactionError: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    const { imageBlobId, algoBlobId, metadataBlobId } = uploadResults;

    console.log('=== Transaction Parameters ===');
    console.log(JSON.stringify({
      artlierState: ATELIER_STATE_ID,
      membershipId,
      imageBlobId,
      websiteBlobId: metadataBlobId,
      algorithmBlobId: algoBlobId,
      clock: '0x6',
      price: parseInt(price)
    }, null, 2));

    if (!imageBlobId || !algoBlobId || !metadataBlobId) {
      const errorMsg = 'Missing blob IDs';
      console.error(errorMsg);
      setState(prev => ({ ...prev, transactionError: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, transactionError: '' }));

    try {
      const tx = await createArtlier(
        ATELIER_STATE_ID,
        membershipId,
        workName,
        imageBlobId,
        metadataBlobId,
        algoBlobId,
        '0x6',
        parseInt(price)
      );

      console.log('=== Transaction Object ===');
      console.log(JSON.stringify(tx, null, 2));

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            console.log('=== Transaction Result ===');
            console.log(JSON.stringify(result, null, 2));
            setState(prev => ({
              ...prev,
              transactionDigest: result.digest,
              isProcessing: false,
            }));
            onSuccess?.(result.digest);
          },
          onError: (error) => {
            console.error('=== Transaction Error ===');
            console.error(error);
            const errorMsg = error.message || 'Transaction failed';
            setState(prev => ({
              ...prev,
              transactionError: errorMsg,
              isProcessing: false,
            }));
            onError?.(errorMsg);
          }
        }
      );
    } catch (error) {
      console.error('=== Error in handleMint ===');
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setState(prev => ({
        ...prev,
        transactionError: errorMsg,
        isProcessing: false,
      }));
      onError?.(errorMsg);
    }
  }, [membershipId, workName, price, signAndExecuteTransaction, onSuccess, onError]);

  const resetTransaction = useCallback(() => {
    setState({
      transactionDigest: '',
      transactionError: '',
      isProcessing: false,
    });
  }, []);

  return {
    ...state,
    handleMint,
    resetTransaction,
  };
}

