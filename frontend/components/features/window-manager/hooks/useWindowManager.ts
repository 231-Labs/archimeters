import { useState, useEffect, useCallback } from 'react';
import { WindowName, WindowPosition, WindowSize, WindowManagerState } from '../types';
import { defaultWindowConfigs } from '@/config/windows';

const BASE_Z_INDEX = 100;  // Base z-index value

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
    windowZIndexes: Object.keys(defaultWindowConfigs).reduce((acc, name) => ({
      ...acc,
      [name]: BASE_Z_INDEX
    }), {} as Record<WindowName, number>),
    maxZIndex: BASE_Z_INDEX,
  });

  // Calculate window center position function
  const getCenterPosition = useCallback((width: number, height: number): WindowPosition => {
    if (typeof window === 'undefined') {
      return { x: 0, y: 0 };
    }
    
    const x = Math.max(0, Math.round((window.innerWidth - width) / 2));
    const y = Math.max(0, Math.round((window.innerHeight - height - 48) / 2));
    
    return { x, y };
  }, []);

  // Initialize window positions
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

  // Activate window
  const activateWindow = useCallback((name: WindowName) => {
    setState(prev => {
      const newMaxZIndex = prev.maxZIndex + 1;
      return {
        ...prev,
        activeWindow: name,
        // Move activated window to the end of the array
        openWindows: [...prev.openWindows.filter(w => w !== name), name],
        maxZIndex: newMaxZIndex,
        windowZIndexes: {
          ...prev.windowZIndexes,
          [name]: newMaxZIndex,
        },
      };
    });
  }, []);

  // Open window
  const openWindow = useCallback((name: WindowName) => {
    setState(prev => {
      const config = defaultWindowConfigs[name];
      const basePosition = getCenterPosition(config.defaultSize.width, config.defaultSize.height);
      
      // Add a small offset to the new window to avoid complete overlap
      const offset = prev.openWindows.length * 20;
      const centerPosition = {
        x: Math.min(basePosition.x + offset, window.innerWidth - config.defaultSize.width - 20),
        y: Math.min(basePosition.y + offset, window.innerHeight - config.defaultSize.height - 68),
      };

      // Set new z-index
      const newMaxZIndex = prev.maxZIndex + 1;

      // If window is already open, keep its position in the list, only update z-index
      const newOpenWindows = prev.openWindows.includes(name)
        ? prev.openWindows
        : [...prev.openWindows, name];

      return {
        ...prev,
        activeWindow: name,
        openWindows: newOpenWindows,
        windowPositions: {
          ...prev.windowPositions,
          [name]: centerPosition,
        },
        maxZIndex: newMaxZIndex,
        windowZIndexes: {
          ...prev.windowZIndexes,
          [name]: newMaxZIndex,
        },
      };
    });
  }, [getCenterPosition]);

  // Close window
  const closeWindow = useCallback((name: WindowName) => {
    setState(prev => ({
      ...prev,
      openWindows: prev.openWindows.filter(w => w !== name),
      activeWindow: prev.activeWindow === name ? null : prev.activeWindow,
    }));
  }, []);

  // Start dragging window
  const startDragging = useCallback((e: React.MouseEvent<Element>, name: WindowName) => {
    e.preventDefault();
    activateWindow(name);
    
    // Get current window position from state using setState callback to avoid stale closure
    let offsetX = 0;
    let offsetY = 0;
    
    setState(prev => {
      const currentPos = prev.windowPositions[name];
      offsetX = e.clientX - currentPos.x;
      offsetY = e.clientY - currentPos.y;
      return { ...prev, draggingWindow: name };
    });

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

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [activateWindow]);

  // Resize window
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

