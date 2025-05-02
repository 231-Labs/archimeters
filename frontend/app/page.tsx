'use client';

import { useEffect, useState } from 'react';
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

interface Props {
  walletStatus: 'disconnected' | 'connected-no-nft' | 'connected-with-nft'
}

export default function Home() {
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const {
    openWindows,
    activeWindow,
    windowPositions,
    windowSizes,
    windowZIndexes,
    activateWindow,
    openWindow,
    closeWindow,
    startDragging,
    resizeWindow,
  } = useWindowManager('entry');

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
        <div className="relative h-[calc(100vh-48px)]">
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
                      zIndex={openWindows.indexOf(name) + 1}
                    >
                      <EntryWindow
                        onDragStart={(e, name) => startDragging(e, name)}
                        walletStatus={walletStatus}
                        setWalletStatus={setWalletStatus}
                      />

                    </Window>
                  );
                case 'terminal':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Parametric Terminal"
                      position={windowPositions.terminal}
                      size={windowSizes.terminal}
                      isActive={activeWindow === 'terminal'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={openWindows.indexOf(name) + 1}
                    >
                      <Terminal />
                    </Window>
                  );
                case 'website-upload':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title={defaultWindowConfigs['website-upload'].title}
                      position={windowPositions['website-upload']}
                      size={windowSizes['website-upload']}
                      isActive={activeWindow === 'website-upload'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={openWindows.indexOf(name) + 1}
                    >
                      <DesignPublisher />
                    </Window>
                  );
                case 'browse':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Browse Images"
                      position={windowPositions.browse}
                      size={windowSizes.browse}
                      isActive={activeWindow === 'browse'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={openWindows.indexOf(name) + 1}
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
                      zIndex={name === 'atelier-viewer' && openWindows.indexOf('browse') !== -1 
                        ? Math.max(openWindows.indexOf('browse') + 2, openWindows.indexOf(name) + 1)
                        : openWindows.indexOf(name) + 1}
                    >
                      <AtelierViewerWindow name={name} />
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