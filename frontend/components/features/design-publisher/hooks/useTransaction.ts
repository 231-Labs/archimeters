import { useState, useCallback } from 'react';
import { useDAppKit } from '@mysten/dapp-kit-react';
import { getExecutedTransactionDigest } from '@/lib/transaction-result';
import { createArtlier, ParameterInput } from '@/utils/transactions';
import type { UploadResults, ParameterRules } from '../types';

interface TransactionState {
  transactionDigest: string;
  transactionError: string;
  isProcessing: boolean;
}

interface UseTransactionOptions {
  membershipId: string;
  kioskId: string;
  kioskCapId: string;
  workName: string;
  price: string;
  parameterRules: ParameterRules;
  onSuccess?: (digest: string) => void;
  onError?: (error: string) => void;
}

export function useTransaction({
  membershipId,
  kioskId,
  kioskCapId,
  workName,
  price,
  parameterRules,
  onSuccess,
  onError,
}: UseTransactionOptions) {
  const dAppKit = useDAppKit();
  const [state, setState] = useState<TransactionState>({
    transactionDigest: '',
    transactionError: '',
    isProcessing: false,
  });

  const handleMint = useCallback(async (uploadResults: UploadResults) => {
    if (!membershipId) {
      const errorMsg = 'Membership ID not found';
      setState(prev => ({ ...prev, transactionError: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    if (!kioskId || !kioskCapId) {
      const errorMsg = 'Kiosk not selected. Please go to Entry Window and select/create a Kiosk.';
      setState(prev => ({ ...prev, transactionError: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    if (!uploadResults) {
      const errorMsg = 'Upload results not found';
      setState(prev => ({ ...prev, transactionError: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    const { imageBlobId, algoBlobId, metadataBlobId } = uploadResults;

    if (!imageBlobId || !algoBlobId || !metadataBlobId) {
      const errorMsg = 'Missing blob IDs';
      setState(prev => ({ ...prev, transactionError: errorMsg }));
      onError?.(errorMsg);
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true, transactionError: '' }));

    try {
      const parameters: ParameterInput[] = Object.entries(parameterRules).map(([key, rule]) => ({
        key,
        param_type: rule.type,
        label: rule.label,
        min_value: rule.minValue,
        max_value: rule.maxValue,
        default_value: rule.defaultValue,
      }));

      const priceInMist = Math.floor(Math.max(0, parseFloat(price) || 0) * 1_000_000_000);

      const tx = createArtlier(
        membershipId,
        workName,
        imageBlobId,
        metadataBlobId,
        algoBlobId,
        priceInMist,
        parameters
      );

      const result = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      const digest = getExecutedTransactionDigest(result);
      setState(prev => ({
        ...prev,
        transactionDigest: digest,
        isProcessing: false,
      }));
      onSuccess?.(digest);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      setState(prev => ({
        ...prev,
        transactionError: errorMsg,
        isProcessing: false,
      }));
      onError?.(errorMsg);
    }
  }, [membershipId, kioskId, kioskCapId, workName, price, parameterRules, dAppKit, onSuccess, onError]);

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

