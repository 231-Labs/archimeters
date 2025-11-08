'use client';

import { useEffect, useRef, useState } from 'react';
import '@mysten/dapp-kit/dist/index.css';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import Background from '@/components/background_animations/Background';
import Window from '@/components/common/Window';
import { Terminal } from '@/components/features/terminal';
import Dock from '@/components/layout/Dock';
import Header from '@/components/layout/Header';
import AtelierViewerWindow from '@/components/windows/AtelierViewerWindow';
import MarketplaceWindow from '@/components/windows/MarketplaceWindow';
import DesignPublisher from '@/components/windows/DesignPublisher';
import EntryWindow, { WalletStatus } from '@/components/windows/EntryWindow';
import VaultWindow from '@/components/windows/VaultWindow';
import PavilionWindow from '@/components/windows/PavilionWindow';
import { useWindowManager } from '@/hooks/useWindowManager';
import { defaultWindowConfigs } from '@/config/windows';
import { PACKAGE_ID } from '@/utils/transactions';

export default function Home() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [zOrder, setZOrder] = useState<string[]>([]);
  const atelierViewerRaised = useRef(false);
  const [paused, setPaused] = useState(false);

  const {
    openWindows,
    activeWindow,
    windowPositions,
    windowSizes,
    // windowZIndexes,
    // activateWindow,
    openWindow,
    closeWindow,
    startDragging,
    resizeWindow,
  } = useWindowManager('entry');

  const activateWindow = (name: string) => {
    setZOrder(prev => [...prev.filter(n => n !== name), name]);
  };

  // Sync zOrder with openWindows - ensure all open windows are in zOrder
  useEffect(() => {
    setZOrder(prev => {
      // Get windows that are open but not in zOrder
      const newWindows = openWindows.filter(w => !prev.includes(w));
      // Get windows that are in zOrder but not open anymore
      const closedWindows = prev.filter(w => !openWindows.includes(w));
      // Remove closed windows and add new windows
      return [...prev.filter(w => !closedWindows.includes(w)), ...newWindows];
    });
  }, [openWindows]);

  useEffect(() => {
    const isAtelierViewerOpen = openWindows.includes('atelier-viewer');
  
    if (isAtelierViewerOpen && !atelierViewerRaised.current) {
      setZOrder((prev) => [...prev.filter(n => n !== 'atelier-viewer'), 'atelier-viewer']);
      atelierViewerRaised.current = true;
    }
  
    if (!isAtelierViewerOpen) {
      atelierViewerRaised.current = false;
    }
  }, [openWindows]);

  useEffect(() => {
    const fetchOsId = async () => {
      if (!currentAccount) return;
      try {
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          options: { showType: true },
          filter: { StructType: `${PACKAGE_ID}::artlier::OS` }
        });
        
        if (objects && objects[0]) {
          // setCurrentOsId(objects[0].data?.objectId || '');
        }
      } catch (error) {
        console.error('Error fetching OS ID:', error);
      }
    };

    fetchOsId();
  }, [currentAccount, suiClient]);

  // Track wallet status changes in development only
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Wallet status changed:', walletStatus);
    }
  }, [walletStatus]);

  return (
    <>
      <div className="min-h-screen bg-black overflow-hidden relative">
        <Header paused={paused} onToggle={() => setPaused(p => !p)}/>
        <Background walletStatus={walletStatus} paused={paused}/>
        <Dock onOpenWindow={openWindow} onActivateWindow={activateWindow} />
        <div className="fixed top-[27px]">
          <div className="h-full relative">
            {openWindows.map(name => {
              switch(name) {
                case 'entry':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Entry"
                      position={windowPositions.entry}
                      size={windowSizes.entry}
                      isActive={activeWindow === 'entry'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      zIndex={zOrder.indexOf(name) + 1}
                    >
                      <EntryWindow
                        onDragStart={(e, name) => startDragging(e, name)}
                        walletStatus={walletStatus}
                        setWalletStatus={setWalletStatus}
                      />

                    </Window>
                  );
                
                case 'publisher':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title={defaultWindowConfigs['publisher'].title}
                      position={windowPositions['publisher']}
                      size={windowSizes['publisher']}
                      isActive={activeWindow === 'publisher'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={zOrder.indexOf(name) + 1}
                    >
                      <DesignPublisher />
                    </Window>
                  );
                case 'marketplace':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title={defaultWindowConfigs['marketplace'].title}
                      position={windowPositions.marketplace}
                      size={windowSizes.marketplace}
                      isActive={activeWindow === 'marketplace'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable={defaultWindowConfigs['marketplace'].resizable}
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={zOrder.indexOf(name) + 1}
                    >
                      <MarketplaceWindow
                        name={name}
                        onOpenWindow={openWindow}
                      />
                    </Window>
                  );
                case 'atelier-viewer':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Atelier Viewer"
                      position={windowPositions['atelier-viewer']}
                      size={windowSizes['atelier-viewer']}
                      isActive={activeWindow === 'atelier-viewer'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={zOrder.indexOf(name) + 1}
                    >
                      <AtelierViewerWindow name={name} />
                    </Window>
                  );
                  case 'vault':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Vault"
                      position={windowPositions['vault']}
                      size={windowSizes['vault']}
                      isActive={activeWindow === 'vault'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable={defaultWindowConfigs['vault'].resizable}
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={zOrder.indexOf(name) + 1}
                    >
                      <VaultWindow name={name} />
                    </Window>
                  );
                  case 'terminal':
                    return (
                      <Window
                        key={name}
                        name={name}
                        title="Docs Terminal"
                        position={windowPositions.terminal}
                        size={windowSizes.terminal}
                        isActive={activeWindow === 'terminal'}
                        onClose={() => closeWindow(name)}
                        onDragStart={(e) => startDragging(e, name)}
                        onClick={() => activateWindow(name)}
                        // resizable
                        onResize={(e) => resizeWindow(e, name)}
                        zIndex={zOrder.indexOf(name) + 1}
                      >
                        <Terminal />
                      </Window>
                    );
                  case 'pavilion':
                    return (
                      <Window
                        key={name}
                        name={name}
                        title={defaultWindowConfigs['pavilion'].title}
                        position={windowPositions['pavilion']}
                        size={windowSizes['pavilion']}
                        isActive={activeWindow === 'pavilion'}
                        onClose={() => closeWindow(name)}
                        onDragStart={(e) => startDragging(e, name)}
                        onClick={() => activateWindow(name)}
                        resizable
                        onResize={(e) => resizeWindow(e, name)}
                        zIndex={zOrder.indexOf(name) + 1}
                      >
                        <PavilionWindow name={name} />
                      </Window>
                    );
                  default:
                  return null;
              }
            })}
          </div>
        </div>
      </div>
    </>
  );
}