export type WindowName = 
  | 'entry'
  | 'terminal'
  | 'publisher'
  | 'gallery'
  | 'atelier-viewer'
  | 'vault'
  | 'pavilion';

export interface WindowConfig {
  title: string;
  component: React.ComponentType;
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
  resizable?: boolean;
}

export interface WindowState {
  name: WindowName;
  title: string;
  isOpen: boolean;
  zIndex: number;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
}

export interface WindowProps {
  name: WindowName;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  initialPosition?: {
    x: number;
    y: number;
  };
  initialSize?: {
    width: number;
    height: number;
  };
}

// Artlier 相關類型
export interface Artlier {
  name: string;
  blobId: string;
  objectId: string;
}