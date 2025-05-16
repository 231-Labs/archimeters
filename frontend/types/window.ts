import { ReactNode } from 'react';

/**
 * 所有可用的窗口名稱
 */
export type WindowName = 
  | 'entry'           // 入口窗口
  | 'terminal'        // 終端
  | 'publisher'       // 設計發布
  | 'gallery'         // 圖片瀏覽
  | 'atelier-viewer'  // 藝術品查看器
  | 'vault'           // 用戶資產窗口
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