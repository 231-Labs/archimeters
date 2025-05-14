import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';
import { printSculpt } from '@/utils/transactions';
import { SUI_CLOCK } from '@/utils/transactions';

interface UsePrintSculptProps {
  sculptId: string;
  printerId?: string;
}

export function usePrintSculpt({ sculptId, printerId }: UsePrintSculptProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'preparing' | 'printing' | 'success' | 'error'>('idle');
  const [txDigest, setTxDigest] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handlePrint = async (): Promise<boolean> => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      setStatus('error');
      return false;
    }

    if (!printerId) {
      setError('Please select a printer');
      setStatus('error');
      return false;
    }

    try {
      setIsPrinting(true);
      setError(null);
      setStatus('preparing');

      const tx = await printSculpt(sculptId, SUI_CLOCK);
      
      setStatus('printing');

      return new Promise<boolean>((resolve) => {
        signAndExecuteTransaction(
          {
            transaction: tx as any,
            chain: 'sui:testnet',
          },
          {
            onSuccess: (result) => {
              setStatus('success');
              setTxDigest(result.digest);
              resolve(true);
            },
            onError: (error) => {
              console.error("Print failed:", error);
              const errorMsg = error.message || 'Print transaction failed';
              const isUserRejection = 
                errorMsg.includes('User rejected') || 
                errorMsg.includes('User denied') || 
                errorMsg.includes('cancelled') || 
                errorMsg.includes('canceled') ||
                errorMsg.includes('rejected');
              
              const finalErrorMsg = isUserRejection ? 'Transaction cancelled by user' : errorMsg;
              setError(finalErrorMsg);
              setStatus('error');
              setIsPrinting(false);
              resolve(false);
            }
          }
        );
      });
    } catch (error) {
      console.error("Print failed:", error);
      setError(error instanceof Error ? error.message : 'Print preparation failed');
      setStatus('error');
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  return {
    handlePrint,
    isPrinting,
    status,
    error,
    txDigest
  };
} 