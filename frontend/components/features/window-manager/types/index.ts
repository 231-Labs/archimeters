import { ReactNode } from 'react';

/**
 * All available window names
 */
export type WindowName = 
  | 'entry'           // Entry window
  | 'terminal'        // Terminal
  | 'publisher'       // Design Publisher
  | 'marketplace'     // Marketplace (formerly Gallery)
  | 'atelier-viewer'  // Atelier Viewer
  | 'vault'           // User Assets Vault
  | 'pavilion'        // Pavilion Browser
  ; 

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowState {
  name: WindowName;
  title: string;
  isOpen: boolean;
  zIndex: number;
  position: WindowPosition;
  size: WindowSize;
}

export interface WindowProps {
  name: WindowName;
  title: string;
  children: ReactNode;
  position: WindowPosition;
  size: WindowSize;
  isActive: boolean;
  resizable?: boolean;
  onClose?: () => void;
  onDragStart?: (e: React.MouseEvent<Element>) => void;
  onResize?: (e: React.MouseEvent) => void;
  onClick?: () => void;
}

export interface WindowManagerState {
  openWindows: WindowName[];
  activeWindow: WindowName | null;
  draggingWindow: WindowName | null;
  windowPositions: Record<WindowName, WindowPosition>;
  windowSizes: Record<WindowName, WindowSize>;
  windowZIndexes: Record<WindowName, number>;
  maxZIndex: number;
}

export interface WindowConfig {
  title: string;
  defaultSize: WindowSize;
  defaultPosition?: WindowPosition;
  resizable?: boolean;
}

