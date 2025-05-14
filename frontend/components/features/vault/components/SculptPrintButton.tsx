import { usePrintSculpt } from '../hooks/usePrintSculpt';

interface SculptPrintButtonProps {
  sculptId: string;
  printerId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'processing' | 'success' | 'error', message?: string, txDigest?: string) => void;
}

export function SculptPrintButton({
  sculptId,
  printerId,
  onSuccess,
  onError,
  onStatusChange
}: SculptPrintButtonProps) {
  const { handlePrint, isPrinting, status, error, txDigest } = usePrintSculpt({
    sculptId,
    printerId
  });

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    
    if (onStatusChange) {
      onStatusChange('processing', 'Preparing print transaction...');
    }
    
    try {
      const success = await handlePrint();
      
      if (success) {
        if (onStatusChange) {
          onStatusChange('success', 'Print transaction successful', txDigest || undefined);
        }
        onSuccess?.();
      } else if (error) {
        const errorMsg = (error || '').toLowerCase();
        if (errorMsg.includes('transaction cancelled') || 
            errorMsg.includes('user rejected') ||
            errorMsg.includes('user denied') ||
            errorMsg.includes('rejected')) {
          if (onStatusChange) {
            // Force update to error state with clear message about cancellation
            onStatusChange('error', 'Transaction cancelled by user', undefined);
            setTimeout(() => {
              onError?.('Transaction cancelled');
            }, 50);
          } else {
            onError?.('Transaction cancelled');
          }
        } else {
          if (onStatusChange) {
            onStatusChange('error', `Print failed: ${error}`, undefined);
          }
          onError?.(error);
        }
      } else {
        // No explicit error but also no success - handle implicit failure
        if (onStatusChange) {
          onStatusChange('error', 'Print operation failed', undefined);
        }
        onError?.('Print operation failed');
      }
    } catch (err) {
      console.error('Print button click handler error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Print processing error';
      if (onStatusChange) {
        onStatusChange('error', `Print failed: ${errorMessage}`, undefined);
      }
      onError?.(errorMessage);
    }
  };

  return (
    <button
      className="bg-black/70 text-white text-sm font-semibold rounded px-5 py-2 shadow-lg backdrop-blur-sm border border-white/10 hover:bg-black/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleClick}
      disabled={isPrinting || !printerId}
      title={!printerId ? 'Please select a printer' : undefined}
    >
      {isPrinting ? 'Printing...' : 'Print Sculpt'}
    </button>
  );
} 