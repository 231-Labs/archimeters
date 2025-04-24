import { ConnectButton } from '@mysten/dapp-kit';
import { retroButtonStyles } from '@/styles/components';
import { useState, useEffect } from 'react';
import type { EntryWindowProps } from './types';
import { useWalletStatus } from './hooks/useWalletStatus';
import { useMembership } from './hooks/useMembership';

export default function EntryWindow({ onDragStart }: EntryWindowProps) {
  const [username, setUsername] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [welcomeGifUrl, setWelcomeGifUrl] = useState<string>('');
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [gifError, setGifError] = useState<string>('');

  const { walletStatus, isMinting, setIsMinting, checkNFTOwnership } = useWalletStatus();
  const { handleInitializeOS } = useMembership(async () => {
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
  });

  // 添加鍵盤事件監聽
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (walletStatus !== 'connected-no-nft') return;
      
      if (e.key === 'Enter') {
        handleInitializeOS(username);
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
    setUsername('');
  };

  // 添加獲取 GIF 的 useEffect
  useEffect(() => {
    const fetchWelcomeGif = async () => {
      setIsGifLoading(true);
      setGifError('');
      
      try {
        const blobId = 'yy3Ngjkh5O1Vg7GWp9R96pGsJ8fzNbvnopia9dc9uMw';
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
        />
      </div>

      {/* 主要內容區域 */}
      <div className="flex-1 flex items-center justify-center p-4">
        {walletStatus === 'connected-no-nft' && (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Welcome to Archimeters</h2>
            <p className="mb-4">Please enter your username to continue:</p>
            <div className="relative inline-block">
              <span className="text-lg font-mono">
                {username}
                {isTyping && <span className="animate-blink">|</span>}
              </span>
            </div>
          </div>
        )}

        {walletStatus === 'connected-with-nft' && !isGifLoading && !gifError && welcomeGifUrl && (
          <div className="text-center">
            <img 
              src={welcomeGifUrl} 
              alt="Welcome Animation" 
              className="max-w-full h-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
} 