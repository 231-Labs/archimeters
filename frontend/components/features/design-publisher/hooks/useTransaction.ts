import { useState, useCallback } from 'react';
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { createArtlier, ATELIER_STATE_ID, ParameterInput } from '@/utils/transactions';
import type { UploadResults, ParameterRules } from '../types';

interface TransactionState {
  transactionDigest: string;
  transactionError: string;
  isProcessing: boolean;
}

interface UseTransactionOptions {
  membershipId: string;
  workName: string;
  price: string;
  parameterRules: ParameterRules;
  onSuccess?: (digest: string) => void;
  onError?: (error: string) => void;
}

export function useTransaction({
  membershipId,
  workName,
  price,
  parameterRules,
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
      // Convert ParameterRules to ParameterInput[]
      // Note: Parameters are already offset to handle negative values in exportParameterRules
      const parameters: ParameterInput[] = Object.entries(parameterRules).map(([key, rule]) => {
        console.log(`Parameter ${key}:`, { 
          minValue: rule.minValue, 
          maxValue: rule.maxValue, 
          defaultValue: rule.defaultValue 
        });
        
        return {
          key,
          param_type: rule.type,
          label: rule.label,
          min_value: rule.minValue,
          max_value: rule.maxValue,
          default_value: rule.defaultValue,
        };
      });

      // Convert price from SUI to MIST and ensure it's a valid integer
      const priceInMist = Math.floor(Math.max(0, parseFloat(price) || 0) * 1_000_000_000);
      console.log(`Price: ${price} SUI = ${priceInMist} MIST`);

      const tx = await createArtlier(
        ATELIER_STATE_ID,
        membershipId,
        workName,
        imageBlobId,
        metadataBlobId,
        algoBlobId,
        '0x6',
        priceInMist,
        parameters
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
  }, [membershipId, workName, price, parameterRules, signAndExecuteTransaction, onSuccess, onError]);

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

