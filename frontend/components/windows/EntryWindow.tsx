import { ConnectButton, useCurrentAccount, useSuiClient, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { retroButtonStyles } from '@/styles/components';
import { useState, useEffect } from 'react';
import { mintMembership, PACKAGE_ID } from '@/utils/transactions';
import { WindowName } from '@/types';
import KioskSelector from '@/components/features/entry/components/KioskSelector';

// Wallet connection status types
export type WalletStatus = 'disconnected' | 'connected-no-nft' | 'connected-with-nft';

// NFT type constant
const MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`;

interface EntryWindowProps {
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
  walletStatus: WalletStatus;
  setWalletStatus: (status: WalletStatus) => void;
}

export default function EntryWindow({ onDragStart , walletStatus, setWalletStatus}: EntryWindowProps) {
  // Wallet and NFT states
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  // const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  // User input states
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [inputStage, setInputStage] = useState<'username' | 'description' | 'confirm'>('username');

  // Transaction states
  const [digest, setDigest] = useState('');
  const [isMinting, setIsMinting] = useState(false);

  // Terminal animation states
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [typingComplete, setTypingComplete] = useState(false);
  const [hasPlayedTyping, setHasPlayedTyping] = useState(false);
  const [shouldInterruptTyping, setShouldInterruptTyping] = useState(false);

  // Reset all states to initial values
  const resetAllStates = () => {
    setUsername('');
    setDescription('');
    setDigest('');
    setIsMinting(false);
    setInputStage('username');
    setTypingComplete(false);
    setHasPlayedTyping(false);
    setShouldInterruptTyping(false);
  };

  // Reset states when wallet disconnects
  useEffect(() => {
    if (!currentAccount) {
      resetAllStates();
    }
  }, [currentAccount]);

  // Reset states when window is hidden/closed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        resetAllStates();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Check if user owns the membership NFT
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
          StructType: MEMBERSHIP_TYPE
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

  // Initialize (mint NFT)
  const handleInitializeOS = async () => {
    if (!currentAccount?.address || !username.trim()) return;

    try {
      setIsMinting(true);
      const tx = await mintMembership(username, description);

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: async (result) => {
            console.log("Transaction successful:", result);
            setDigest(result.digest);
            
            // Check NFT ownership after transaction
            setTimeout(async () => {
              const hasNFT = await checkNFTOwnership();
              
              // Retry up to 3 times if NFT is not found
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

  // Check NFT ownership on account change
  useEffect(() => {
    if (currentAccount) {
      checkNFTOwnership();
    }
  }, [currentAccount, suiClient]);

  // Typewriter effect
  useEffect(() => {
    if (hasPlayedTyping) return;

    let welcomeText = '';
    if (walletStatus === 'disconnected') {
      welcomeText = '> WELCOME TO ARCHIMETERS \n> PLEASE CONNECT YOUR WALLET TO CONTINUE';
    } else if (walletStatus === 'connected-no-nft') {
      if (inputStage === 'username') {
        welcomeText = '> ACCESS GRANTED\n> INITIATING IDENTITY MINTING PROTOCOL\n> AWAITING DESIGNATION INPUT\n> ENTER YOUR CODENAME (3-20 CHARACTERS)_';
      } else if (inputStage === 'description') {
        welcomeText = `> CODENAME "${username}" ACKNOWLEDGED\n> PERSONAL PROFILE REQUIRED\n> ENTER YOUR BIO (MAX 100 CHARACTERS)_`;
      } else if (inputStage === 'confirm') {
        welcomeText = `> IDENTITY PARAMETERS RECEIVED\n> CODENAME: ${username}\n> BIO: ${description}\n> CONFIRM IDENTITY PARAMETERS [ENTER]_`;
      }
    }

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (shouldInterruptTyping) {
        setTypingText(welcomeText);
        setTypingComplete(true);
        setHasPlayedTyping(true);
        clearInterval(typingInterval);
        return;
      }

      if (currentIndex < welcomeText.length) {
        setTypingText(welcomeText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setTypingComplete(true);
        setHasPlayedTyping(true);
        clearInterval(typingInterval);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [walletStatus, inputStage, username, description, shouldInterruptTyping]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (walletStatus !== 'connected-no-nft') return;
      
      if (!typingComplete) {
        setShouldInterruptTyping(true);
        return;
      }
      
      if (e.key === 'Enter') {
        if (inputStage === 'username' && username.trim()) {
          setInputStage('description');
          setHasPlayedTyping(false);
          setShouldInterruptTyping(false);
          return;
        }
        if (inputStage === 'description') {
          if (!description.trim()) {
            return;
          }
          setInputStage('confirm');
          setHasPlayedTyping(false);
          setShouldInterruptTyping(false);
          return;
        }
        if (inputStage === 'confirm') {
          handleInitializeOS();
          return;
        }
      }
      
      if (e.key === 'Backspace') {
        if (inputStage === 'username') {
          setUsername(prev => prev.slice(0, -1));
        } else if (inputStage === 'description') {
          setDescription(prev => prev.slice(0, -1));
        }
        return;
      }
      
      // Allow only letters, numbers, and basic punctuation
      if (e.key.length === 1 && /^[a-zA-Z0-9\s.,!?-]$/.test(e.key)) {
        if (inputStage === 'username') {
          setUsername(prev => prev + e.key);
        } else if (inputStage === 'description') {
          setDescription(prev => prev + e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [walletStatus, username, description, inputStage, typingComplete]);

  // Reset states when input stage changes
  useEffect(() => {
    setTypingComplete(false);
    setHasPlayedTyping(false);
    setShouldInterruptTyping(false);
  }, [inputStage]);

  // Handle ESC key to cancel minting
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMinting) {
        setIsMinting(false);
        setDigest('');
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isMinting]);

  // Cursor blink effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] bg-opacity-90 backdrop-blur-sm">
      {/* Background Image */}
      <div className={`absolute inset-0 z-0 ${walletStatus === 'connected-with-nft' ? 'opacity-100' : 'opacity-20'}`}>
        <img
          src="/archimeters.png"
          alt="Archimeters Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full p-6">
        {/* Connect Button Area */}
        <div className="flex justify-end mb-8">
          <ConnectButton 
            style={{
              ...retroButtonStyles.button,
              backgroundColor: walletStatus === 'disconnected' ? 'transparent' : '#000000 !important',
              background: walletStatus === 'disconnected' ? 'transparent' : '#000000 !important',
              border: `2px solid ${walletStatus === 'disconnected' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)'}`,
              color: '#ffffff',
              fontWeight: 'bold',
              padding: '8px 16px',
              backdropFilter: walletStatus === 'disconnected' ? 'blur(4px)' : 'none',
              boxShadow: walletStatus === 'disconnected' ? 'none' : '0 0 10px rgba(0, 0, 0, 0.5)',
            }}
            onMouseOver={e => Object.assign(e.currentTarget.style, {
              ...retroButtonStyles.buttonHover,
              backgroundColor: walletStatus === 'disconnected' ? 'rgba(0, 0, 0, 0.3)' : '#1a1a1a !important',
              background: walletStatus === 'disconnected' ? 'rgba(0, 0, 0, 0.3)' : '#1a1a1a !important',
              border: `2px solid ${walletStatus === 'disconnected' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.8)'}`,
              boxShadow: walletStatus === 'disconnected' ? 'none' : '0 0 15px rgba(0, 0, 0, 0.7)',
            })}
            onMouseOut={e => Object.assign(e.currentTarget.style, {
              ...retroButtonStyles.button,
              backgroundColor: walletStatus === 'disconnected' ? 'transparent' : '#000000 !important',
              background: walletStatus === 'disconnected' ? 'transparent' : '#000000 !important',
              border: `2px solid ${walletStatus === 'disconnected' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)'}`,
              color: '#ffffff',
              fontWeight: 'bold',
              padding: '8px 16px',
              backdropFilter: walletStatus === 'disconnected' ? 'blur(4px)' : 'none',
              boxShadow: walletStatus === 'disconnected' ? 'none' : '0 0 10px rgba(0, 0, 0, 0.5)',
            })}
            connectText="CONNECT_WALLET"
            className="retro-button"
          />
        </div>

        {/* Terminal Display Area */}
        <div className="flex-1 font-mono text-sm overflow-hidden">
          {walletStatus !== 'connected-with-nft' && (
            <div className="terminal-text whitespace-pre-wrap">
              {typingText}
              {typingComplete && (walletStatus === 'disconnected' || (walletStatus === 'connected-no-nft' && inputStage === 'confirm')) && (
                <span className={`inline-block w-2 h-5 bg-white ml-1 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}></span>
              )}
              {!typingComplete && <span className="text-white">█</span>}
            </div>
          )}

          {/* Input Area */}
          {walletStatus === 'connected-no-nft' && typingComplete && !isMinting && (
            <div className="mt-4">
              {inputStage !== 'confirm' && (
                <>
                  <div className="text-white mb-2 font-bold">
                    &gt; {inputStage === 'username' ? 'ENTER YOUR CODENAME:' : 'ENTER YOUR BIO:'}
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400">&gt;</span>
                    <span className="text-white ml-2">
                      {inputStage === 'username' ? username : description}
                      <span className={`inline-block w-2 h-5 bg-white ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}></span>
                    </span>
                  </div>
                  {inputStage === 'username' && (
                    <div className="mt-2 text-xs text-white/50">
                      &gt; {username.length === 0 ? 'WAITING FOR INPUT...' : 
                          username.length < 3 ? 'MINIMUM LENGTH NOT MET (3-20 CHARACTERS)' : 
                          username.length > 20 ? 'MAXIMUM LENGTH EXCEEDED (3-20 CHARACTERS)' : 
                          'VALID CODENAME FORMAT'}
                    </div>
                  )}
                  {inputStage === 'description' && (
                    <div className="mt-2 text-xs text-white/50">
                      &gt; {description.length === 0 ? 'WAITING FOR INPUT...' : 
                          description.length > 100 ? 'MAXIMUM LENGTH EXCEEDED (MAX 100 CHARACTERS)' : 
                          'VALID BIO FORMAT'}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Minting Status Display */}
          {isMinting && (
            <div className="mt-4 text-green-400">
              {!digest ? (
                <>
                  <div>&gt; INITIALIZING ARTIST PROFILE...</div>
                  <div className="animate-pulse">&gt; PLEASE WAIT...</div>
                </>
              ) : (
                <>
                  <div>&gt; PROFILE CREATED SUCCESSFULLY</div>
                  <div>&gt; TRANSACTION DIGEST:</div>
                  <div className="text-xs break-all mt-2">{digest}</div>
                  <div className="animate-pulse mt-2">&gt; LOADING ARTSPACE...</div>
                </>
              )}
            </div>
          )}
        </div>

        {/* NFT Verified Status */}
        {walletStatus === 'connected-with-nft' && (
          <div className="flex flex-col items-center justify-between h-full">
            {/* Kiosk Selector - Top */}
            <div className="w-full max-w-md px-4 mt-8">
              <KioskSelector />
            </div>
            
            {/* Welcome Message - Bottom */}
            <div className="text-green-400 text-base mb-8 bg-black px-4 py-2 flex items-center">
              &gt; IDENTITY VERIFIED - WELCOME BACK
              <span className={`inline-block w-2 h-5 bg-green-400 ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}