import { usePrintSculpt } from '../hooks/usePrintSculpt';

interface SculptPrintButtonProps {
  sculptId: string;
  printerId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function SculptPrintButton({
  sculptId,
  printerId,
  onSuccess,
  onError
}: SculptPrintButtonProps) {
  const { handlePrint, isPrinting, error } = usePrintSculpt({
    sculptId,
    printerId
  });

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    try {
      const success = await handlePrint();
      if (success) {
        onSuccess?.();
      } else if (error) {
        onError?.(error);
      }
    } catch (err) {
      console.error('Print button click handler error:', err);
      onError?.('Print processing error');
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