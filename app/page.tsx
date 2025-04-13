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
import { useSuiClient, useCurrentAccount } from '@mysten/dapp-kit';
import { PACKAGE_ID } from '@/utils/transactions';
import Dock from '@/components/layout/Dock';

const defaultWindowSizes = {
  artlier: { width: 500, height: 600 },
  'walrus-upload': { width: 540, height: 400 },
  'walrus-view': { width: 365, height: 446 },
  'model3d': { width: 800, height: 600 },
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
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    
    return {
      x: Math.round((window.innerWidth - width) / 2),
      y: Math.round((window.innerHeight - height) / 2) - 60,
    };
  };

  const artlierSize = { width: 600, height: 600 };

  const [openWindows, setOpenWindows] = useState<WindowName[]>(['artlier']);
  const [activeWindow, setActiveWindow] = useState<WindowName | null>('artlier');
  const [draggingWindow, setDraggingWindow] = useState<WindowName | null>(null);
  const [windowPositions, setWindowPositions] = useState({
    artlier: { x: 0, y: 0 },
    'walrus-upload': { x: 350, y: 350 },
    'walrus-view': { x: 400, y: 400 },
    'model3d': { x: 100, y: 100 },
  });
  const [windowSizes, setWindowSizes] = useState(defaultWindowSizes);
  const [windows, setWindows] = useState<Record<string, WindowState>>({});

  // 使用 useEffect 來設置 Artlier 窗口的初始位置
  useEffect(() => {
    const centerPosition = getCenterPosition(artlierSize.width, artlierSize.height);
    setWindowPositions(prev => ({
      ...prev,
      artlier: centerPosition,
    }));
  }, []); // 只在組件掛載時執行一次

  // 新增：處理窗口激活的函數
  const handleWindowActivate = (name: WindowName) => {
    setActiveWindow(name);
    setOpenWindows(prev => [...prev.filter(w => w !== name), name]);
  };

  // 修改打開窗口的處理函數
  const handleOpenWindow = (name: WindowName) => {
    // 先添加到打開列表中（如果還沒打開）
    if (!openWindows.includes(name)) {
      setOpenWindows(current => [...current, name]);
    }

    // 無論如何都要激活窗口
    handleWindowActivate(name);
    
    // 如果是 Artlier 窗口，設置中心位置
    if (name === 'artlier') {
      const centerPosition = getCenterPosition(artlierSize.width, artlierSize.height);
      setWindowPositions(prev => ({
        ...prev,
        artlier: centerPosition,
      }));
    }
  };

  // 修改關閉窗口的處理函數
  const handleCloseWindow = (name: WindowName) => {
    setOpenWindows(prev => prev.filter(w => w !== name));
    if (activeWindow === name) {
      setActiveWindow(null);
    }
  };

  // 簡單的 Connect Wallet 功能
  const connectWallet = () => {
    console.log("Wallet connected!"); 
    alert("Wallet connected!");
  };

  // 修改拖動開始的處理函數
  const handleDragStart = (e: React.MouseEvent<Element>, windowName: string) => {
    e.preventDefault();
    handleWindowActivate(windowName as WindowName);
    setDraggingWindow(windowName as WindowName);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = windowSizes[windowName as WindowName].width;
      const windowHeight = windowSizes[windowName as WindowName].height;
      
      // 修改這裡：使用 document.documentElement.clientWidth 而不是 window.innerWidth
      const maxX = document.documentElement.clientWidth - windowWidth;
      const maxY = document.documentElement.clientHeight - windowHeight - 48; // 減去 header 高度
      
      const newX = Math.max(0, Math.min(e.clientX - offsetX, maxX));
      const newY = Math.max(0, Math.min(e.clientY - offsetY, maxY));
      
      setWindowPositions(prev => ({...prev, [windowName as WindowName]: { x: newX, y: newY }}));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', () => {
      setDraggingWindow(null);
      document.removeEventListener('mousemove', handleMouseMove);
    });
  };

  // 處理窗口縮放
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
                case 'artlier':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="Artlier"
                      position={windowPositions.artlier}
                      size={windowSizes.artlier}
                      isActive={activeWindow === 'artlier'}
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onClick={() => handleWindowActivate('artlier')}
                    >
                      <EntryWindow 
                        onDragStart={handleDragStart}
                      />
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
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('walrus-upload')}
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
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('walrus-view')}
                    >
                      <WalrusView />
                    </Window>
                  );
                case 'model3d':
                  return (
                    <Window
                      key={name}
                      name={name}
                      title="3D Model Editor"
                      position={windowPositions['model3d']}
                      size={windowSizes['model3d']}
                      isActive={activeWindow === 'model3d'}
                      resizable={true}
                      onClose={handleCloseWindow}
                      onDragStart={handleDragStart}
                      onResize={handleResize}
                      onClick={() => handleWindowActivate('model3d')}
                    >
                      <Model3DWindow 
                        name={name}
                        onClose={() => handleCloseWindow(name)}
                      />
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