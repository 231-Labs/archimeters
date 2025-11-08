'use client';

import { useEffect, useState } from 'react';
import '@mysten/dapp-kit/dist/index.css';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import Background from '@/components/background_animations/Background';
import { Terminal } from '@/components/features/terminal';
import { Window, useWindowManager, useWindowFocus } from '@/components/features/window-manager';
import Dock from '@/components/layout/Dock';
import Header from '@/components/layout/Header';
import AtelierViewerWindow from '@/components/windows/AtelierViewerWindow';
import MarketplaceWindow from '@/components/windows/MarketplaceWindow';
import DesignPublisher from '@/components/windows/DesignPublisher';
import EntryWindow, { WalletStatus } from '@/components/windows/EntryWindow';
import VaultWindow from '@/components/windows/VaultWindow';
import PavilionWindow from '@/components/windows/PavilionWindow';
import { defaultWindowConfigs } from '@/config/windows';
import { PACKAGE_ID } from '@/utils/transactions';

export default function Home() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [paused, setPaused] = useState(false);

  const {
    openWindows,
    activeWindow,
    windowPositions,
    windowSizes,
    openWindow,
    closeWindow,
    startDragging,
    resizeWindow,
  } = useWindowManager('entry');

  // Use unified focus management hook
  const { focusWindow, getZIndex } = useWindowFocus(openWindows);

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
        <Dock onOpenWindow={openWindow} onActivateWindow={focusWindow} />
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
                      onDragStart={(e) => {
                        focusWindow(name);
                        startDragging(e, name);
                      }}
                      onClick={() => focusWindow(name)}
                      zIndex={getZIndex(name)}
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
                      onDragStart={(e) => {
                        focusWindow(name);
                        startDragging(e, name);
                      }}
                      onClick={() => focusWindow(name)}
                      resizable={defaultWindowConfigs['publisher'].resizable}
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={getZIndex(name)}
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
                      onDragStart={(e) => {
                        focusWindow(name);
                        startDragging(e, name);
                      }}
                      onClick={() => focusWindow(name)}
                      resizable={defaultWindowConfigs['marketplace'].resizable}
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={getZIndex(name)}
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
                      onDragStart={(e) => {
                        focusWindow(name);
                        startDragging(e, name);
                      }}
                      onClick={() => focusWindow(name)}
                      resizable
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={getZIndex(name)}
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
                      onDragStart={(e) => {
                        focusWindow(name);
                        startDragging(e, name);
                      }}
                      onClick={() => focusWindow(name)}
                      resizable={defaultWindowConfigs['vault'].resizable}
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={getZIndex(name)}
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
                        onDragStart={(e) => {
                        focusWindow(name);
                        startDragging(e, name);
                      }}
                        onClick={() => focusWindow(name)}
                        // resizable
                        onResize={(e) => resizeWindow(e, name)}
                        zIndex={getZIndex(name)}
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
                        onDragStart={(e) => {
                        focusWindow(name);
                        startDragging(e, name);
                      }}
                        onClick={() => focusWindow(name)}
                        resizable
                        onResize={(e) => resizeWindow(e, name)}
                        zIndex={getZIndex(name)}
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