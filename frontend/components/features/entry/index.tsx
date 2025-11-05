import { ConnectButton } from '@mysten/dapp-kit';
import { retroButtonStyles } from '@/styles/components';
import { useState, useEffect } from 'react';
import type { EntryWindowProps } from './types';
import { useWalletStatus } from './hooks/useWalletStatus';
import { useMembership } from './hooks/useMembership';
import { getWalrusBlobUrl } from '@/config/walrus';
import KioskSelector from './components/KioskSelector';

export default function EntryWindow({ onDragStart }: EntryWindowProps) {
  const [username, setUsername] = useState('');
  const [welcomeGifUrl, setWelcomeGifUrl] = useState<string>('');
  const [isGifLoading, setIsGifLoading] = useState(false);
  const [gifError, setGifError] = useState<string>('');

  const { walletStatus, isMinting, setIsMinting, checkNFTOwnership } = useWalletStatus();
  const { handleInitializeOS } = useMembership(async () => {
    // Wait and retry checking for NFT ownership after transaction
    setTimeout(async () => {
      const hasNFT = await checkNFTOwnership();
      
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

  // Handle keyboard input for username
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (walletStatus !== 'connected-no-nft') return;
      
      if (e.key === 'Enter') {
        handleInitializeOS(username, '');
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
  }, [walletStatus, username, handleInitializeOS]);

  // Handle ESC key to cancel minting
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMinting) {
        setIsMinting(false);
        setUsername('');
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isMinting, setIsMinting]);

  // Fetch welcome GIF from Walrus
  useEffect(() => {
    const fetchWelcomeGif = async () => {
      setIsGifLoading(true);
      setGifError('');
      
      try {
        const blobId = 'yy3Ngjkh5O1Vg7GWp9R96pGsJ8fzNbvnopia9dc9uMw';
        const walrusUrl = getWalrusBlobUrl(blobId);
        
        const response = await fetch(walrusUrl, { method: 'HEAD' });
        
        if (!response.ok) {
          throw new Error('Failed to load animation');
        }
        
        setWelcomeGifUrl(walrusUrl);
      } catch (err) {
        console.error('Error loading welcome animation:', err);
        setGifError('Failed to load welcome animation');
      } finally {
        setIsGifLoading(false);
      }
    };

    fetchWelcomeGif();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="pt-6 px-4 flex justify-center">
        <ConnectButton 
          style={retroButtonStyles.button} 
          onMouseOver={e => Object.assign(e.currentTarget.style, retroButtonStyles.buttonHover)}
          onMouseOut={e => Object.assign(e.currentTarget.style, retroButtonStyles.button)}
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {walletStatus === 'connected-no-nft' && (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Welcome to Archimeters</h2>
            <p className="mb-4">Please enter your username to continue:</p>
            <div className="relative inline-block">
              <span className="text-lg font-mono">{username}</span>
            </div>
          </div>
        )}

        {walletStatus === 'connected-with-nft' && !isGifLoading && !gifError && welcomeGifUrl && (
          <div className="text-center space-y-4">
            <img 
              src={welcomeGifUrl} 
              alt="Welcome Animation" 
              className="max-w-full h-auto"
            />
            <div className="mt-4 px-4">
              <KioskSelector />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 