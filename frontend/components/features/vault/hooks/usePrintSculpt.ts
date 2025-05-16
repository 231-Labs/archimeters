import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';
import { printSculpt } from '@/utils/transactions';

interface UsePrintSculptProps {
  sculptId: string;
  printerId?: string;
  onStatusChange?: (status: 'idle' | 'preparing' | 'printing' | 'success' | 'error', message?: string, txDigest?: string) => void;
}

export function usePrintSculpt({ sculptId, printerId, onStatusChange }: UsePrintSculptProps) {
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

      const tx = await printSculpt(sculptId, printerId);
      
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
              if (result?.digest) {
                console.log(`Print successful! (tx: ${result.digest})`);
                onStatusChange?.('success', `Print successful! (tx: ${result.digest})`, result.digest);
              } else {
                onStatusChange?.('success', 'Print successful!');
              }
              resolve(true);
            },
            onError: (error) => {
              const finalErrorMsg = (error.message || 'Print transaction failed')
                .includes('rejected')
                  ? 'Transaction cancelled by user'
                  : error.message || 'Print transaction failed';
              
              setError(finalErrorMsg);
              setStatus('error');
              onStatusChange?.('error', finalErrorMsg);
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