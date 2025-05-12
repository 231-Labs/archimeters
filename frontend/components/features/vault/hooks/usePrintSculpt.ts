import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState } from 'react';
import { printSculpt } from '@/utils/transactions';
import { SUI_CLOCK } from '@/utils/transactions';

interface UsePrintSculptProps {
  sculptId: string;
}

export function usePrintSculpt({ sculptId }: UsePrintSculptProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const handlePrint = async (): Promise<boolean> => {
    if (!currentAccount?.address) {
      setError('Please connect your wallet');
      return false;
    }

    try {
      setIsPrinting(true);
      setError(null);

      const tx = await printSculpt(sculptId, SUI_CLOCK);

      return new Promise<boolean>((resolve) => {
        signAndExecuteTransaction(
          {
            transaction: tx as any,
            chain: 'sui:testnet',
          },
          {
            onSuccess: (result) => {
              console.log("Print success:", result);
              resolve(true);
            },
            onError: (error) => {
              console.error("Print failed:", error);
              setError('Print failed');
              resolve(false);
            }
          }
        );
      });
    } catch (error) {
      console.error("Print failed:", error);
      setError('Print failed');
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  return {
    handlePrint,
    isPrinting,
    error
  };
} 