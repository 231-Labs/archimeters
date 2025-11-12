import { usePrintSculpt } from '../hooks/usePrintSculpt';
import { RetroButton } from '@/components/common/RetroButton';

interface SculptPrintButtonProps {
  sculptId: string;
  printerId?: string;
  kioskId?: string;
  kioskCapId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'processing' | 'success' | 'error', message?: string, txDigest?: string) => void;
}

export function SculptPrintButton({
  sculptId,
  printerId,
  kioskId,
  kioskCapId,
  onSuccess,
  onError,
  onStatusChange
}: SculptPrintButtonProps) {
  const { handlePrint, isPrinting, error, txDigest } = usePrintSculpt({
    sculptId,
    printerId,
    kioskId,
    kioskCapId,
    onStatusChange: onStatusChange 
      ? (status, message, txDigest) => {
          const mappedStatus = status === 'preparing' || status === 'printing' 
            ? 'processing' 
            : status;
          onStatusChange(mappedStatus, message, txDigest);
        } 
      : undefined
  });

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const success = await handlePrint();
      if (success) {
        onSuccess?.();
      }
    } catch (err) {
      console.error('Print button click handler error:', err);
    }
  };

  return (
    <RetroButton
      variant="primary"
      size="md"
      onClick={handleClick}
      disabled={!printerId}
      isLoading={isPrinting}
      title={!printerId ? 'Please select a printer' : undefined}
    >
      {isPrinting ? 'Printing...' : 'Print'}
    </RetroButton>
  );
} 