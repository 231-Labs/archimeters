import { useState, useCallback, useEffect } from 'react';
import { WindowName } from '../types';

const BASE_Z_INDEX = 100;

/**
 * Manages window focus order and z-index calculation
 * Separates focus management from window state management for better maintainability
 */
export function useWindowFocus(openWindows: WindowName[]) {
  const [focusOrder, setFocusOrder] = useState<WindowName[]>([]);

  // Sync focusOrder with openWindows - remove closed windows, add new ones
  useEffect(() => {
    setFocusOrder(prev => {
      const newWindows = openWindows.filter(w => !prev.includes(w));
      const openWindowsSet = new Set(openWindows);
      const closedWindows = prev.filter(w => !openWindowsSet.has(w));
      return [...prev.filter(w => !closedWindows.includes(w)), ...newWindows];
    });
  }, [openWindows]);

  // Focus window (bring to front)
  const focusWindow = useCallback((name: WindowName) => {
    setFocusOrder(prev => [...prev.filter(n => n !== name), name]);
  }, []);

  // Get z-index for a window based on focus order
  const getZIndex = useCallback((name: WindowName): number => {
    const index = focusOrder.indexOf(name);
    return index === -1 ? BASE_Z_INDEX : BASE_Z_INDEX + index;
  }, [focusOrder]);

  return { focusOrder, focusWindow, getZIndex };
}

