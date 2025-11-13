'use client';

interface WithdrawStatusNotificationProps {
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string | null;
  txDigest?: string | null;
}

export const WithdrawStatusNotification = ({
  status,
  message,
  txDigest,
}: WithdrawStatusNotificationProps) => {
  if (status === 'idle') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Retro Ticket Style Toast */}
      <div 
        className="relative bg-[#1a1a1a] font-mono min-w-[320px]"
        style={{
          borderTop: '2px solid #2a2a2a',
          borderLeft: '2px solid #2a2a2a',
          borderBottom: '2px solid #0a0a0a',
          borderRight: '2px solid #0a0a0a',
          boxShadow: '4px 4px 8px rgba(0, 0, 0, 0.8), inset 1px 1px 2px rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Ticket Punch Holes */}
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0a0a0a] rounded-full"
          style={{
            boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.8)',
          }}
        />
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-[#0a0a0a] rounded-full"
          style={{
            boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.8)',
          }}
        />
        
        {/* Ticket Header */}
        <div 
          className="px-4 py-2 border-b-2 border-dashed border-white/10"
          style={{
            background: 'linear-gradient(to bottom, #1f1f1f, #1a1a1a)',
          }}
        >
          <p className="text-[10px] text-white/40 uppercase tracking-widest">ARCHIMETERS SYSTEM</p>
        </div>
        
        {/* Ticket Content */}
        <div className="px-4 py-3 space-y-2">
          {status === 'processing' && (
            <div className="flex items-center gap-2">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 border border-white/20" />
                <div className="absolute inset-0 border border-white/50 border-t-transparent animate-spin" />
              </div>
              <span className="text-white/90 text-xs uppercase tracking-wider">
                WITHDRAWING PROFIT
              </span>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xs">✓</span>
                <span className="text-white/90 text-xs uppercase tracking-wider">WITHDRAW SUCCESS</span>
              </div>
              {txDigest && (
                <div className="pt-2 border-t border-dashed border-white/10">
                  <a
                    href={`https://suiexplorer.com/txblock/${txDigest}?network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-white/40 hover:text-white/70 transition-colors uppercase tracking-widest underline"
                  >
                    VIEW TRANSACTION →
                  </a>
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-red-500 text-xs">✕</span>
                <span className="text-white/90 text-xs uppercase tracking-wider">WITHDRAW FAILED</span>
              </div>
              {message && (
                <p className="text-white/60 text-[10px] leading-tight">{message}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

