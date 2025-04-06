import { ConnectButton, useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { retroButtonStyles } from '@/styles/components';
import { useState, useEffect } from 'react';
import { mintOS, PACKAGE_ID } from '@/utils/transactions';
import { WindowName } from '@/types/index';

// 模擬用的臨時類型
type WalletStatus = 'disconnected' | 'connected-no-nft' | 'connected-with-nft';

// NFT 類型常量
const OS_TYPE = `${PACKAGE_ID}::archimeter::ID`;

interface EntryWindowProps {
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
}

export default function EntryWindow({ onDragStart }: EntryWindowProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [username, setUsername] = useState('');
  const [digest, setDigest] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [welcomeGifUrl, setWelcomeGifUrl] = useState<string>('');
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [gifError, setGifError] = useState<string>('');

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const checkNFTOwnership = async () => {
    if (!currentAccount) {
      setWalletStatus('disconnected');
      setIsMinting(false);
      return;
    }

    try {
      const { data: objects } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: OS_TYPE
        },
        options: {
          showType: true,
        }
      });

      if (objects && objects.length > 0) {
        setWalletStatus('connected-with-nft');
        setIsMinting(false);
        return true;
      } else {
        setWalletStatus('connected-no-nft');
        return false;
      }
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
      setWalletStatus('connected-no-nft');
      setIsMinting(false);
      return false;
    }
  };

  const handleInitializeOS = async () => {
    if (!currentAccount?.address || !username.trim()) return;

    try {
      setIsMinting(true);
      const tx = await mintOS(username, 'initial-settings');

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: async (result) => {
            console.log("Transaction successful:", result);
            setDigest(result.digest);
            
            // 交易成功後等待 2 秒再檢查一次
            setTimeout(async () => {
              const hasNFT = await checkNFTOwnership();
              
              // 如果第一次檢查沒找到 NFT，最多再重試 3 次
              if (!hasNFT) {
                let attempts = 0;
                const maxAttempts = 3;
                const retryInterval = setInterval(async () => {
                  const found = await checkNFTOwnership();
                  attempts++;
                  
                  if (found || attempts >= maxAttempts) {
                    clearInterval(retryInterval);
                  }
                }, 2000);
              }
            }, 2000);
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            setIsMinting(false);
          }
        }
      );
    } catch (error) {
      console.error('Error in handleInitializeOS:', error);
      setIsMinting(false);
    }
  };

  useEffect(() => {
    checkNFTOwnership();
  }, [currentAccount, suiClient]);

  // 添加鍵盤事件監聽
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (walletStatus !== 'connected-no-nft') return;
      
      if (e.key === 'Enter') {
        handleInitializeOS();
        return;
      }
      
      if (e.key === 'Backspace') {
        setUsername(prev => prev.slice(0, -1));
        return;
      }
      
      if (e.key.length === 1) {
        setUsername(prev => prev + e.key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [walletStatus, username]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMinting) {
        handleCancelMint();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isMinting]);

  // 添加取消 mint 的功能
  const handleCancelMint = () => {
    setIsMinting(false);
    setDigest('');
    setUsername('');
  };

  // 添加獲取 GIF 的 useEffect
  useEffect(() => {
    const fetchWelcomeGif = async () => {
      setIsGifLoading(true);
      setGifError('');
      
      try {
        const blobId = '6Ci8-LwW5w0rZ4f3FATjJm3-1YyApJL1eTfUGuZITLw';
        const response = await fetch(`/api/walrus/blob/${blobId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load animation');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setWelcomeGifUrl(url);
      } catch (err) {
        console.error('Error loading welcome animation:', err);
        setGifError('Failed to load welcome animation');
      } finally {
        setIsGifLoading(false);
      }
    };

    fetchWelcomeGif();

    // 清理函數
    return () => {
      if (welcomeGifUrl) {
        URL.revokeObjectURL(welcomeGifUrl);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Connect Button 區域 */}
      <div className="pt-6 px-4 flex justify-center">
        <ConnectButton 
          style={retroButtonStyles.button} 
          onMouseOver={e => Object.assign(e.currentTarget.style, retroButtonStyles.buttonHover)}
          onMouseOut={e => Object.assign(e.currentTarget.style, retroButtonStyles.button)}
          connectText="Connect Wallet"
          className="retro-button"
        />
      </div>

      {/* 主要內容區域 */}
      <div className="flex-1 px-4 pb-4">
        {walletStatus === 'disconnected' && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="font-mono text-lg text-white mb-8">
              <span>Welcome to the Artlier!</span>
              <span className="cursor-blink">_</span>
            </div>
            <p className="text-sm text-white/90 mb-4">Please connect your wallet to continue</p>
          </div>
        )}

        {walletStatus === 'connected-no-nft' && (
          <div className="flex flex-col items-center justify-center h-full font-mono">
            {!isMinting ? (
              <>
                <div className="text-lg text-white mb-4">
                  <span>Initializing Art Space...</span>
                </div>
                
                <div className="text-sm text-white/90 mb-8">
                  <span>Please enter your artist name to continue.</span>
                </div>

                <div className="flex flex-col items-center space-y-2">
                  <div className="text-sm text-white/90">Enter your name:</div>
                  <div className="flex items-center">
                    <span className="text-lg text-white"> {username}</span>
                    <span className={`ml-1 inline-block w-2 h-5 bg-white ${isTyping ? 'animate-pulse' : 'animate-blink'}`}>
                    </span>
                  </div>
                </div>

                <div className="mt-8 text-xs text-white/90">
                  Press [Enter] to continue
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                {!digest ? (
                  <>
                    <div className="text-lg text-white">
                      <span>Initializing Art Space...</span>
                    </div>
                    <div className="text-sm text-white/90">
                      system {`>`} creating art space for: {username}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-lg text-green-400">
                      <span>Art Space Initialized</span>
                      <span className="cursor-blink">_</span>
                    </div>
                    <div className="text-sm text-white/90">
                      system {`>`} art space created for: {username}
                    </div>
                    <div className="text-sm text-white/90">
                      system {`>`} transaction digest:
                    </div>
                    <div className="text-sm font-mono break-all max-w-md text-white/80">
                      {digest}
                    </div>
                    <div className="mt-4 text-xs text-white/90">
                      Loading art space...
                      <span className="cursor-blink">_</span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {walletStatus === 'connected-with-nft' && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="font-mono text-lg text-white mb-2">
              <span>Art Space Active</span>
              <span className="cursor-blink">_</span>
            </div>
            
            <div className="relative h-80">
              {gifError ? (
                <div className="text-red-400 text-sm">{gifError}</div>
              ) : isGifLoading ? (
                <div className="text-white/90">Loading welcome animation...</div>
              ) : welcomeGifUrl ? (
                <img
                  src={welcomeGifUrl}
                  alt="Welcome Animation"
                  className="artlier-image w-full h-full object-contain border-black"
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 添加類型定義
interface ArtlierData {
  name: string;
  description: string;
  traits: string[];
} 