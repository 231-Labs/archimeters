'use client';

import { useEffect, useState, useRef } from 'react';
import '@mysten/dapp-kit/dist/index.css';
import Window from '@/components/common/Window';
import Header from '@/components/layout/Header';
import EntryWindow from '@/components/windows/EntryWindow';
import { WalletStatus } from '@/components/windows/EntryWindow';
import DesignPublisher from '@/components/windows/DesignPublisher';
import BrowseWindow from '@/components/windows/BrowseWindow';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';
import Dock from '@/components/layout/Dock';
import { Terminal } from '@/components/features/terminal';
import { useWindowManager } from '@/hooks/useWindowManager';
import { defaultWindowConfigs } from '@/config/windows';
import Background from '@/components/background_animations/Background';
import AtelierViewerWindow from '@/components/windows/AtelierViewerWindow';
import VaultWindow from '@/components/windows/VaultWindow';

export default function Home() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [zOrder, setZOrder] = useState<string[]>([]);
  const atelierViewerRaised = useRef(false);

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
        <Background walletStatus={walletStatus} />
        <Header />
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
                case 'gallery':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Gallery"
                      position={windowPositions.gallery}
                      size={windowSizes.gallery}
                      isActive={activeWindow === 'gallery'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={zOrder.indexOf(name) + 1}
                    >
                      <BrowseWindow
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
                      resizable
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