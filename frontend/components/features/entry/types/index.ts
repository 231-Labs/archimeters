import { WindowName } from '@/types';

export type WalletStatus = 'disconnected' | 'connected-no-nft' | 'connected-with-nft';

export interface EntryWindowProps {
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
}

export interface ArtlierData {
  name: string;
  description: string;
  traits: string[];
} 