import { useAtelierWithdraw } from '../hooks/useAtelierWithdraw';

interface AtelierWithdrawButtonProps {
  atelierId: string;
  poolAmount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function AtelierWithdrawButton({
  atelierId,
  poolAmount,
  onSuccess,
  onError
}: AtelierWithdrawButtonProps) {
  const { handleWithdraw, isWithdrawing, error } = useAtelierWithdraw({
    atelierId
  });

  const handleClick = async () => {
    const success = await handleWithdraw(poolAmount, onSuccess);
    if (success) {
      onSuccess?.();
    } else if (error) {
      onError?.(error);
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