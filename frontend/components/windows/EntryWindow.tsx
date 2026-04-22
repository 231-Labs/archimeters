import { ConnectButton } from '@mysten/dapp-kit-react/ui';
import { useCurrentAccount, useCurrentClient, useDAppKit } from '@mysten/dapp-kit-react';
import { useState, useEffect } from 'react';
import { mintMembership, PACKAGE_ID } from '@/utils/transactions';
import { dAppKit } from '@/lib/dapp-kit';
import { getExecutedTransactionDigest } from '@/lib/transaction-result';
import { WindowName } from '@/components/features/window-manager';
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
  const suiClient = useCurrentClient();
  const dKit = useDAppKit();

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
      const { objects } = await suiClient.listOwnedObjects({
        owner: currentAccount.address,
        type: MEMBERSHIP_TYPE,
        limit: 1,
      });

      if (objects.length > 0) {
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
      const tx = mintMembership(username, description);

      const result = await dKit.signAndExecuteTransaction({ transaction: tx });
      setDigest(getExecutedTransactionDigest(result));

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
              if (!found) setIsMinting(false);
            }
          }, 2000);
        } else {
          setIsMinting(false);
        }
      }, 2000);
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
      welcomeText = '> WELCOME TO ARCHIMETERS \n> 3D ASSETS ALGORITHM MARKETPLACE\n> CONNECT YOUR WALLET TO CONTINUE';
    } else if (walletStatus === 'connected-no-nft') {
      if (inputStage === 'username') {
        welcomeText = '> ARCHIMETERS: PARAMETRIC DESIGN PLATFORM\n> CREATE, TRADE & MINT ALGORITHMIC 3D ASSETS\n> REGISTER AS DESIGNER OR COLLECTOR\n> ENTER YOUR USERNAME (3-20 CHARACTERS)_';
      } else if (inputStage === 'description') {
        welcomeText = `> USERNAME "${username}" CONFIRMED\n> DESCRIBE YOUR ROLE\n> (DESIGNER, COLLECTOR, OR 3D ENTHUSIAST)\n> ENTER YOUR DESCRIPTION (MAX 100 CHARACTERS)_`;
      } else if (inputStage === 'confirm') {
        welcomeText = `> MEMBERSHIP DETAILS\n> USERNAME: ${username}\n> DESCRIPTION: ${description}\n> MINT YOUR MEMBERSHIP NFT [PRESS ENTER]_`;
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
    <div className="flex flex-col h-full bg-panel/95 backdrop-blur-sm text-foreground">
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
          <span className="retro-connect-host">
            <ConnectButton instance={dAppKit} />
          </span>
        </div>

        {/* Terminal Display Area */}
        <div className="flex-1 font-mono text-sm overflow-hidden">
          {walletStatus !== 'connected-with-nft' && (
            <div className="terminal-text whitespace-pre-wrap">
              {typingText}
              {typingComplete && (walletStatus === 'disconnected' || (walletStatus === 'connected-no-nft' && inputStage === 'confirm')) && (
                <span className={`inline-block w-2 h-5 bg-foreground ml-1 align-middle ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}></span>
              )}
              {!typingComplete && <span className="text-foreground">█</span>}
            </div>
          )}

          {/* Input Area */}
          {walletStatus === 'connected-no-nft' && typingComplete && !isMinting && (
            <div className="mt-4">
              {inputStage !== 'confirm' && (
                <>
                  <div className="text-foreground mb-2 font-bold">
                    &gt; {inputStage === 'username' ? 'ENTER YOUR CODENAME:' : 'ENTER YOUR BIO:'}
                  </div>
                  <div className="flex items-center">
                    <span className="text-green-400">&gt;</span>
                    <span className="text-foreground ml-2">
                      {inputStage === 'username' ? username : description}
                      <span className={`inline-block w-2 h-5 bg-foreground ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}></span>
                    </span>
                  </div>
                  {inputStage === 'username' && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      &gt; {username.length === 0 ? 'WAITING FOR INPUT...' : 
                          username.length < 3 ? 'MINIMUM LENGTH NOT MET (3-20 CHARACTERS)' : 
                          username.length > 20 ? 'MAXIMUM LENGTH EXCEEDED (3-20 CHARACTERS)' : 
                          'VALID CODENAME FORMAT'}
                    </div>
                  )}
                  {inputStage === 'description' && (
                    <div className="mt-2 text-xs text-muted-foreground">
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
            <div className="text-green-400 text-base mb-8 bg-panel-deep px-4 py-2 flex items-center">
              &gt; IDENTITY VERIFIED - WELCOME BACK
              <span className={`inline-block w-2 h-5 bg-green-400 ml-2 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}