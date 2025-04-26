'use client';

import { useEffect } from 'react';
import '@mysten/dapp-kit/dist/index.css';
import Window from '@/components/common/Window';
import Header from '@/components/layout/Header';
import EntryWindow from '@/components/windows/EntryWindow';
import WebsiteUpload from '@/components/windows/WebsiteUpload';
import BrowseWindow from '@/components/windows/BrowseWindow';
import ArtlierViewerWindow from '@/components/windows/ArtlierViewerWindow';
import ParameterTestWindow from '@/components/windows/ParameterTestWindow';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';
import Dock from '@/components/layout/Dock';
import { Terminal } from '@/components/features/terminal';
import { useWindowManager } from '@/hooks/useWindowManager';

export default function Home() {
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

  // 獲取用戶的 OS ID
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

  return (
    <>
      <div className="min-h-screen bg-black overflow-hidden">
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
                      <EntryWindow onDragStart={(e, name) => startDragging(e, name)} />
                    </Window>
                  );
                case 'designer':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Parametric Terminal"
                      position={windowPositions.designer}
                      size={windowSizes.designer}
                      isActive={activeWindow === 'designer'}
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
                      title="Website Upload"
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
                      <WebsiteUpload />
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
                case 'artlier-viewer':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Artlier Viewer"
                      position={windowPositions['artlier-viewer']}
                      size={windowSizes['artlier-viewer']}
                      isActive={activeWindow === 'artlier-viewer'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={name === 'artlier-viewer' && openWindows.indexOf('browse') !== -1 
                        ? Math.max(openWindows.indexOf('browse') + 2, openWindows.indexOf(name) + 1)
                        : openWindows.indexOf(name) + 1}
                    >
                      <ArtlierViewerWindow name={name} />
                    </Window>
                  );
                case 'parameter-test':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="參數測試"
                      position={windowPositions['parameter-test']}
                      size={windowSizes['parameter-test']}
                      isActive={activeWindow === 'parameter-test'}
                      onClose={() => closeWindow(name)}
                      onDragStart={(e) => startDragging(e, name)}
                      onClick={() => activateWindow(name)}
                      resizable
                      onResize={(e) => resizeWindow(e, name)}
                      zIndex={openWindows.indexOf(name) + 1}
                    >
                      <ParameterTestWindow />
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