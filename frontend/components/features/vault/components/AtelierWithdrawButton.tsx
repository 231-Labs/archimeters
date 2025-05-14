import { useAtelierWithdraw } from '../hooks/useAtelierWithdraw';

interface AtelierWithdrawButtonProps {
  atelierId: string;
  poolAmount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: 'idle' | 'processing' | 'success' | 'error', message?: string) => void;
}

export function AtelierWithdrawButton({
  atelierId,
  poolAmount,
  onSuccess,
  onError,
  onStatusChange,
}: AtelierWithdrawButtonProps) {
  const { handleWithdraw, isWithdrawing, error } = useAtelierWithdraw({ atelierId });

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止事件冒泡
    try {
      onStatusChange?.('processing', 'Processing withdrawal...');
      const success = await handleWithdraw(poolAmount);
      if (success) {
        onSuccess?.();
      } else if (error) {
        onError?.(error);
        onStatusChange?.('error', `Withdrawal failed:${error}`);
      }
    } catch (err) {
      console.error('Error in withdraw button click handler:', err);
      const errorMessage = 'Transaction processing error';
      onError?.(errorMessage);
      onStatusChange?.('error', `Withdrawal failed:${errorMessage}`);
    }
  };

  return (
    <button
      className="bg-black/70 text-white text-sm font-semibold rounded px-5 py-2 shadow-lg backdrop-blur-sm border border-white/10 hover:bg-black/90 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleClick}
      disabled={isWithdrawing || poolAmount <= 0}
    >
      {isWithdrawing ? 'Processing...' : 'Collect Fee'}
      </button>
  );
} 