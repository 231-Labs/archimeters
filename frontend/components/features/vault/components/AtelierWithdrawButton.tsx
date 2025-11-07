import { useAtelierWithdraw } from '../hooks/useAtelierWithdraw';
import { RetroButton } from '@/components/common/RetroButton';

interface AtelierWithdrawButtonProps {
  atelierId: string;
  poolId: string;
  poolAmount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'processing' | 'success' | 'error', message?: string) => void;
}

export function AtelierWithdrawButton({
  atelierId,
  poolId,
  poolAmount,
  onSuccess,
  onError,
  onStatusChange,
}: AtelierWithdrawButtonProps) {
  const { handleWithdraw, isWithdrawing, error } = useAtelierWithdraw({ atelierId, poolId });

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    try {
      onStatusChange?.('processing', 'Processing withdrawal...');
      const success = await handleWithdraw(poolAmount);
      if (success) {
        onSuccess?.();
      } else if (error) {
        // Check if user cancelled the transaction
        const errorMsg = error.toLowerCase();
        if (errorMsg.includes('transaction cancelled') || 
            errorMsg.includes('user rejected') ||
            errorMsg.includes('user denied')) {
          onStatusChange?.('error', 'Transaction cancelled');
        } else {
          onStatusChange?.('error', `Withdrawal failed: ${error}`);
        }
        onError?.(error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction processing error';
      onError?.(errorMessage);
      onStatusChange?.('error', `Withdrawal failed: ${errorMessage}`);
    }
  };

  return (
    <RetroButton
      variant="primary"
      size="md"
      onClick={handleClick}
      disabled={poolAmount <= 0}
      isLoading={isWithdrawing}
    >
      {isWithdrawing ? 'Processing...' : 'Withdraw All'}
    </RetroButton>
  );
} 