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
    <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
      <div className="flex flex-col gap-2">
        {uploadStatus === 'uploading' && (
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-white/90 text-sm font-mono tracking-wider">{uploadProgress}</span>
          </div>
        )}
        
        {uploadStatus === 'success' && mintStatus !== 'success' && (
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border-2 border-green-500/50 rounded-full" />
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-white/90 text-sm font-mono tracking-wider">{uploadProgress}</span>
          </div>
        )}

        {uploadStatus === 'error' && (
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border-2 border-red-500/50 rounded-full" />
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-white/90 text-sm font-mono tracking-wider">{uploadProgress}</span>
          </div>
        )}
        
        {(mintStatus === 'preparing' || mintStatus === 'minting') && (
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
              <div className="absolute inset-0 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
            </div>
            <span className="text-white/90 text-sm font-mono tracking-wider">
              {mintStatus === 'preparing' ? 'Preparing files...' : 'Minting Sculpt...'}
            </span>
          </div>
        )}

        {mintStatus === 'success' && (
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border-2 border-green-500/50 rounded-full" />
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/90 text-sm font-mono tracking-wider">Sculpt minted successfully!</span>
              {txDigest && (
                <a
                  href={`https://suiexplorer.com/txblock/${txDigest}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white/50 hover:text-white/80 transition-colors underline underline-offset-2"
                >
                  View Transaction
                </a>
              )}
            </div>
          </div>
        )}

        {mintStatus === 'error' && (
          <div className="flex items-center gap-3">
            <div className="relative w-4 h-4">
              <div className="absolute inset-0 border-2 border-red-500/50 rounded-full" />
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <span className="text-white/90 text-sm font-mono tracking-wider">{mintError}</span>
          </div>
        )}
      </div>
    </div>
  );
};

