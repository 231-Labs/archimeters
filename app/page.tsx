'use client';

import { useState, useEffect } from 'react';
import type { WindowName } from '../types/index';
import '@mysten/dapp-kit/dist/index.css';
import Window from '@/components/common/Window';
import Header from '@/components/layout/Header';
import WalrusUpload from '@/components/windows/WalrusUpload';
import WalrusView from '@/components/windows/WalrusView';
import EntryWindow from '@/components/windows/EntryWindow';
import Model3DWindow from '@/components/windows/Model3DWindow';
import TestDesignSeriesWindow from '@/components/windows/TestDesignSeriesWindow';
import ElegantPage from '@/components/windows/ElegantPage';
import MonochromePage from '@/components/windows/MonochromePage';
import WebsiteUpload from '@/components/windows/WebsiteUpload';
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';
import Dock from '@/components/layout/Dock';
import { Terminal } from '@/components/terminal';

const defaultWindowSizes = {
  entry: { width: 500, height: 600 },
  'walrus-upload': { width: 540, height: 400 },
  'walrus-view': { width: 365, height: 446 },
  'model-3d': { width: 800, height: 600 },
  'designer': { width: 800, height: 600 },
  'test-design-series': { width: 500, height: 600 },
  'elegant-page': { width: 900, height: 700 },
  'monochrome-page': { width: 900, height: 700 },
  'website-upload': { width: 800, height: 600 },
};

interface WindowState {
  component: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  minimized: boolean;
}

export default function Home() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const [currentOsId, setCurrentOsId] = useState<string>('');

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
          setCurrentOsId(objects[0].data?.objectId || '');
        }
      } catch (error) {
        console.error('Error fetching OS ID:', error);
      }
    };

    fetchOsId();
  }, [currentAccount, suiClient]);

  // 計算視窗中心位置的函數
  const getCenterPosition = (width: number, height: number) => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }
    
    const x = Math.round((window.innerWidth - width) / 2);
    const y = Math.round((window.innerHeight - height) / 2) - 60;
    
    return { x, y };
  };

  const entrySize = { width: 600, height: 600 };

  const [openWindows, setOpenWindows] = useState<WindowName[]>(['entry']);
  const [activeWindow, setActiveWindow] = useState<WindowName | null>('entry');
  const [draggingWindow, setDraggingWindow] = useState<WindowName | null>(null);
  const [windowPositions, setWindowPositions] = useState<Record<WindowName, { x: number; y: number }>>({
    entry: { x: 0, y: 0 },
    'walrus-upload': { x: 350, y: 350 },
    'walrus-view': { x: 400, y: 400 },
    'model-3d': { x: 100, y: 100 },
    'designer': { x: 200, y: 200 },
    'test-design-series': { x: 150, y: 150 },
    'elegant-page': { x: 100, y: 50 },
    'monochrome-page': { x: 700, y: 70 },
    'website-upload': { x: 300, y: 300 },
  });
  const [windowSizes, setWindowSizes] = useState(defaultWindowSizes);
  const [windows, setWindows] = useState<Record<string, WindowState>>({});

  // 使用 useEffect 來設置 Entry 窗口的初始位置
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const centerPosition = getCenterPosition(entrySize.width, entrySize.height);
    setWindowPositions(prev => ({
      ...prev,
      entry: centerPosition,
    }));
  }, []);

  const handleWindowActivate = (name: WindowName) => {
    setActiveWindow(name);
    setOpenWindows(prev => [...prev.filter(w => w !== name), name]);
  };

  const handleOpenWindow = (name: WindowName) => {
    if (!openWindows.includes(name)) {
      setOpenWindows(current => [...current, name]);
    }

    handleWindowActivate(name);
    
    if (name === 'entry') {
      const centerPosition = getCenterPosition(entrySize.width, entrySize.height);
      setWindowPositions(prev => ({
        ...prev,
        entry: centerPosition,
      }));
    }
  };

  const handleCloseWindow = (name: WindowName) => {
    setOpenWindows(prev => prev.filter(w => w !== name));
    if (activeWindow === name) {
      setActiveWindow(null);
    }
  };

  const handleDragStart = (e: React.MouseEvent<Element>, windowName: WindowName) => {
    e.preventDefault();
    handleWindowActivate(windowName);
    setDraggingWindow(windowName);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = windowSizes[windowName].width;
      const windowHeight = windowSizes[windowName].height;
      
      const maxX = document.documentElement.clientWidth - windowWidth;
      const maxY = document.documentElement.clientHeight - windowHeight - 48;
      
      const newX = Math.max(0, Math.min(e.clientX - offsetX, maxX));
      const newY = Math.max(0, Math.min(e.clientY - offsetY, maxY));
      
      setWindowPositions(prev => ({...prev, [windowName]: { x: newX, y: newY }}));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
      setDraggingWindow(null);
      document.removeEventListener('mousemove', handleMouseMove);
    });
  };

  const handleResize = (e: React.MouseEvent, name: WindowName) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSizes[name].width;
    const startHeight = windowSizes[name].height;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      setWindowSizes(prev => ({
        ...prev,
        [name]: {
          width: Math.max(200, startWidth + (e.clientX - startX)),
          height: Math.max(100, startHeight + (e.clientY - startY)),
        },
      }));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <div className="min-h-screen bg-black overflow-hidden">
        <Header />
        <Dock onOpenWindow={handleOpenWindow} />
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
                      onClose={() => handleCloseWindow(name)}
                      onDragStart={(e) => handleDragStart(e, name)}
                      onClick={() => handleWindowActivate(name)}
                    >
                      <EntryWindow onDragStart={function (e: React.MouseEvent<Element>, name: WindowName): void {
                        throw new Error('Function not implemented.');
                      } } />
                    </Window>
                  );
                case 'walrus-upload':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Walrus Upload"
                      position={windowPositions['walrus-upload']}
                      size={windowSizes['walrus-upload']}
                      isActive={activeWindow === 'walrus-upload'}
                      resizable={true}
                      onClose={() => handleCloseWindow(name)}
                      onDragStart={(e) => handleDragStart(e, name)}
                      onResize={(e) => handleResize(e, name)}
                      onClick={() => handleWindowActivate(name)}
                    >
                      <WalrusUpload />
                    </Window>
                  );
                case 'walrus-view':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Walrus View"
                      position={windowPositions['walrus-view']}
                      size={windowSizes['walrus-view']}
                      isActive={activeWindow === 'walrus-view'}
                      resizable={true}
                      onClose={() => handleCloseWindow(name)}
                      onDragStart={(e) => handleDragStart(e, name)}
                      onResize={(e) => handleResize(e, name)}
                      onClick={() => handleWindowActivate(name)}
                    >
                      <WalrusView />
                    </Window>
                  );
                case 'model-3d':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="3D Model Editor"
                      position={windowPositions['model-3d']}
                      size={windowSizes['model-3d']}
                      isActive={activeWindow === 'model-3d'}
                      resizable={true}
                      onClose={() => handleCloseWindow(name)}
                      onDragStart={(e) => handleDragStart(e, name)}
                      onResize={(e) => handleResize(e, name)}
                      onClick={() => handleWindowActivate(name)}
                    >
                      <Model3DWindow 
                        onClose={() => handleCloseWindow(name)}
                      />
                    </Window>
                  );
                case 'designer':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Parametric Terminal"
                      position={windowPositions['designer']}
                      size={windowSizes['designer']}
                      isActive={activeWindow === 'designer'}
                      resizable={true}
                      onClose={() => handleCloseWindow(name)}
                      onDragStart={(e) => handleDragStart(e, name)}
                      onResize={(e) => handleResize(e, name)}
                      onClick={() => handleWindowActivate(name)}
                    >
                      <Terminal />
                    </Window>
                  );
                case 'test-design-series':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Test Design Series"
                      position={windowPositions['test-design-series']}
                      size={windowSizes['test-design-series']}
                      isActive={activeWindow === 'test-design-series'}
                      resizable={true}
                      onClose={() => handleCloseWindow(name)}
                      onDragStart={(e) => handleDragStart(e, name)}
                      onResize={(e) => handleResize(e, name)}
                      onClick={() => handleWindowActivate(name)}
                    >
                      <TestDesignSeriesWindow 
                        onDragStart={(e) => handleDragStart(e, name)}
                      />
                    </Window>
                  );
                case 'elegant-page':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Elegant Design"
                      position={windowPositions['elegant-page']}
                      size={windowSizes['elegant-page']}
                      isActive={activeWindow === 'elegant-page'}
                      onClose={() => handleCloseWindow(name)}
                      onDragStart={(e) => handleDragStart(e, name)}
                      onClick={() => handleWindowActivate(name)}
                      resizable
                      onResize={(e) => handleResize(e, name)}
                    >
                      <ElegantPage />
                    </Window>
                  );
                case 'monochrome-page':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Monochrome Design"
                      position={windowPositions['monochrome-page']}
                      size={windowSizes['monochrome-page']}
                      isActive={activeWindow === 'monochrome-page'}
                      onClose={() => handleCloseWindow(name)}
                      onDragStart={(e) => handleDragStart(e, name)}
                      onClick={() => handleWindowActivate(name)}
                      resizable
                      onResize={(e) => handleResize(e, name)}
                    >
                      <MonochromePage />
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
                      resizable={true}
                      onClose={() => handleCloseWindow(name)}
                      onDragStart={(e) => handleDragStart(e, name)}
                      onResize={(e) => handleResize(e, name)}
                      onClick={() => handleWindowActivate(name)}
                    >
                      <WebsiteUpload />
                    </Window>
                  );
              }
            })}
          </div>
        </div>
      </div>
    </>
  );
}