import type { MouseEvent } from 'react';
import type { WindowName } from '@/types';

export interface TerminalWindowProps {
  name: WindowName;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  isActive: boolean;
  onClose: (name: WindowName) => void;
  onDragStart: (e: MouseEvent, name: WindowName) => void;
  onResize?: (e: MouseEvent, name: WindowName) => void;
  onClick: () => void;
}

export interface TerminalCommand {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[]) => void;
}

export interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
}

export interface TerminalProps {
  // Terminal specific props can be added here if needed
} 