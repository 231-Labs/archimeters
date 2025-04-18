export type WindowName = 
  | 'entry'
  | 'walrus-upload'
  | 'walrus-view'
  | 'model-3d'
  | 'designer'
  | 'test-design-series'
  | 'elegant-page'
  | 'monochrome-page';

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