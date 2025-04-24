import { useState, useEffect, useCallback } from 'react';
import { WindowName, WindowPosition, WindowSize, WindowManagerState } from '@/types/window';
import { defaultWindowConfigs } from '@/config/windows';

export function useWindowManager(initialOpenWindow: WindowName = 'entry') {
  const [state, setState] = useState<WindowManagerState>({
    openWindows: [initialOpenWindow],
    activeWindow: initialOpenWindow,
    draggingWindow: null,
    windowPositions: Object.keys(defaultWindowConfigs).reduce((acc, name) => ({
      ...acc,
      [name]: { x: 0, y: 0 }
    }), {} as Record<WindowName, WindowPosition>),
    windowSizes: Object.entries(defaultWindowConfigs).reduce((acc, [name, config]) => ({
      ...acc,
      [name]: config.defaultSize
    }), {} as Record<WindowName, WindowSize>),
  });

  // 計算視窗中心位置的函數
  const getCenterPosition = useCallback((width: number, height: number): WindowPosition => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }
    
    const x = Math.max(0, Math.round((window.innerWidth - width) / 2));
    const y = Math.max(0, Math.round((window.innerHeight - height - 48) / 2));
    
    return { x, y };
  }, []);

  // 初始化窗口位置
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setState(prev => {
      const newPositions = { ...prev.windowPositions };
      
      Object.entries(defaultWindowConfigs).forEach(([name, config]) => {
        const centerPos = getCenterPosition(config.defaultSize.width, config.defaultSize.height);
        newPositions[name as WindowName] = centerPos;
      });

      return {
        ...prev,
        windowPositions: newPositions,
      };
    });
  }, [getCenterPosition]);

  // 激活窗口
  const activateWindow = useCallback((name: WindowName) => {
    setState(prev => ({
      ...prev,
      activeWindow: name,
      openWindows: [...prev.openWindows.filter(w => w !== name), name],
    }));
  }, []);

  // 打開窗口
  const openWindow = useCallback((name: WindowName) => {
    setState(prev => {
      if (prev.openWindows.includes(name)) {
        return {
          ...prev,
          activeWindow: name,
          openWindows: [...prev.openWindows.filter(w => w !== name), name],
        };
      }

      const config = defaultWindowConfigs[name];
      const centerPosition = getCenterPosition(config.defaultSize.width, config.defaultSize.height);

      return {
        ...prev,
        activeWindow: name,
        openWindows: [...prev.openWindows, name],
        windowPositions: {
          ...prev.windowPositions,
          [name]: centerPosition,
        },
      };
    });
  }, [getCenterPosition]);

  // 關閉窗口
  const closeWindow = useCallback((name: WindowName) => {
    setState(prev => ({
      ...prev,
      openWindows: prev.openWindows.filter(w => w !== name),
      activeWindow: prev.activeWindow === name ? null : prev.activeWindow,
    }));
  }, []);

  // 開始拖動窗口
  const startDragging = useCallback((e: React.MouseEvent<Element>, name: WindowName) => {
    e.preventDefault();
    activateWindow(name);
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    const handleMouseMove = (e: MouseEvent) => {
      setState(prev => {
        const windowWidth = prev.windowSizes[name].width;
        const windowHeight = prev.windowSizes[name].height;
        
        const maxX = document.documentElement.clientWidth - windowWidth;
        const maxY = document.documentElement.clientHeight - windowHeight - 48;
        
        const newX = Math.max(0, Math.min(e.clientX - offsetX, maxX));
        const newY = Math.max(0, Math.min(e.clientY - offsetY, maxY));
        
        return {
          ...prev,
          windowPositions: {
            ...prev.windowPositions,
            [name]: { x: newX, y: newY }
          }
        };
      });
    };

    const handleMouseUp = () => {
      setState(prev => ({ ...prev, draggingWindow: null }));
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    setState(prev => ({ ...prev, draggingWindow: name }));
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [activateWindow]);

  // 調整窗口大小
  const resizeWindow = useCallback((e: React.MouseEvent, name: WindowName) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;

    setState(prev => {
      const startWidth = prev.windowSizes[name].width;
      const startHeight = prev.windowSizes[name].height;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        setState(current => ({
          ...current,
          windowSizes: {
            ...current.windowSizes,
            [name]: {
              width: Math.max(200, startWidth + (e.clientX - startX)),
              height: Math.max(100, startHeight + (e.clientY - startY)),
            },
          },
        }));
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return prev;
    });
  }, []);

  return {
    ...state,
    activateWindow,
    openWindow,
    closeWindow,
    startDragging,
    resizeWindow,
  };
} 