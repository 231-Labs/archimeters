import type { MouseEvent } from 'react';
import type { WindowName } from '@/types';

/**
 * Props for the terminal window component
 */
export interface TerminalWindowProps {
  name: WindowName;
  position: { x: number; y: number };
  size?: { x: number; y: number };
  isActive: boolean;
  onClose: (name: WindowName) => void;
  onDragStart: (e: MouseEvent, name: WindowName) => void;
  onResize?: (e: MouseEvent, name: WindowName) => void;
  onClick: () => void;
}

/**
 * Interface for terminal commands
 */
export interface TerminalCommand {
  name: string;
  description: string;
  usage: string;
  execute: (args: string[]) => void;
}

/**
 * Interface for terminal theme configuration
 */
export interface TerminalTheme {
  background: string;
  foreground: string;
  cursor: string;
}

/**
 * Props for the terminal component
 */
export interface TerminalProps {
  // Terminal specific props can be added here if needed
} 