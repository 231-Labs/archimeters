import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';
import { printSculpt } from '@/utils/transactions';

interface UsePrintSculptProps {
  sculptId: string;
  printerId?: string;
  kioskId?: string;
  kioskCapId?: string;
  onStatusChange?: (status: 'idle' | 'preparing' | 'printing' | 'success' | 'error', message?: string, txDigest?: string) => void;
}

export function usePrintSculpt({ sculptId, printerId, kioskId, kioskCapId, onStatusChange }: UsePrintSculptProps) {
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
      onStatusChange?.('error', 'Please connect your wallet');
      return false;
    }

    if (!printerId) {
      setError('Please select a printer');
      setStatus('error');
      onStatusChange?.('error', 'Please select a printer');
      return false;
    }

    if (!kioskId || !kioskCapId) {
      setError('Kiosk information missing');
      setStatus('error');
      onStatusChange?.('error', 'Kiosk information missing');
      return false;
    }

    try {
      setIsPrinting(true);
      setError(null);
      setStatus('preparing');
      onStatusChange?.('preparing', 'Preparing print transaction...');

      const tx = await printSculpt(sculptId, printerId, kioskId, kioskCapId);
      
      setStatus('printing');
      onStatusChange?.('printing', 'Waiting for wallet approval...');

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
              setIsPrinting(false);
              onStatusChange?.('success', 'Print job created successfully!', result.digest);
              resolve(true);
            },
            onError: (error) => {
              console.error("Print transaction error:", error);
              
              let finalErrorMsg = 'Print transaction failed';
              const errorMsg = error.message || '';
              
              if (errorMsg.toLowerCase().includes('rejected') || 
                  errorMsg.toLowerCase().includes('user rejected') ||
                  errorMsg.toLowerCase().includes('user denied') ||
                  errorMsg.toLowerCase().includes('cancelled')) {
                finalErrorMsg = 'Transaction cancelled by user';
              } else if (errorMsg) {
                finalErrorMsg = errorMsg;
              }
              
              setError(finalErrorMsg);
              setStatus('error');
              setIsPrinting(false);
              onStatusChange?.('error', finalErrorMsg);
              resolve(false);
            }
          }
        );
      });
    } catch (error) {
      console.error("Print failed:", error);
      const errorMsg = error instanceof Error ? error.message : 'Print preparation failed';
      setError(errorMsg);
      setStatus('error');
      setIsPrinting(false);
      onStatusChange?.('error', errorMsg);
      return false;
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