import { ReactNode } from 'react';

export type WindowName = 
  | 'entry'
  | 'designer'
  | 'website-upload';

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
}

export interface WindowConfig {
  title: string;
  defaultSize: WindowSize;
  defaultPosition?: WindowPosition;
  resizable?: boolean;
} 