import { UploadStatus, MintStatus } from '../types';

interface MintStatusNotificationProps {
  uploadStatus: UploadStatus;
  uploadProgress: string;
  mintStatus: MintStatus;
  mintError: string | null;
  txDigest: string | null;
}

export const MintStatusNotification = ({
  uploadStatus,
  uploadProgress,
  mintStatus,
  mintError,
  txDigest,
}: MintStatusNotificationProps) => {
  if (uploadStatus === 'idle' && mintStatus === 'idle') {
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
        {uploadStatus === 'uploading' && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="relative w-3 h-3">
                <div className="absolute inset-0 border border-white/20" />
                <div className="absolute inset-0 border border-white/50 border-t-transparent animate-spin" />
              </div>
              <span className="text-white/90 text-xs uppercase tracking-wider">UPLOADING</span>
            </div>
            <span className="text-white/60 text-xs">{uploadProgress}</span>
          </div>
        )}
        
        {uploadStatus === 'success' && mintStatus !== 'success' && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-xs">✓</span>
              <span className="text-white/90 text-xs uppercase tracking-wider">UPLOADED</span>
            </div>
            <span className="text-white/60 text-xs">{uploadProgress}</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xs">✕</span>
              <span className="text-white/90 text-xs uppercase tracking-wider">UPLOAD FAILED</span>
            </div>
            <span className="text-white/60 text-xs">{uploadProgress}</span>
          </div>
        )}
        
        {(mintStatus === 'preparing' || mintStatus === 'minting') && (
          <div className="flex items-center gap-2">
            <div className="relative w-3 h-3">
              <div className="absolute inset-0 border border-white/20" />
              <div className="absolute inset-0 border border-white/50 border-t-transparent animate-spin" />
            </div>
            <span className="text-white/90 text-xs uppercase tracking-wider">
              {mintStatus === 'preparing' ? 'PREPARING' : 'MINTING SCULPT'}
            </span>
          </div>
        )}

        {mintStatus === 'success' && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-xs">✓</span>
              <span className="text-white/90 text-xs uppercase tracking-wider">MINT SUCCESS</span>
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

        {mintStatus === 'error' && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-red-500 text-xs">✕</span>
              <span className="text-white/90 text-xs uppercase tracking-wider">MINT FAILED</span>
            </div>
            <p className="text-white/60 text-[10px] leading-tight">{mintError}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

