import { WindowName, WindowConfig } from '@/components/features/window-manager';

export const defaultWindowConfigs: Record<WindowName, WindowConfig> = {
  entry: {
    title: 'Entry',
    defaultSize: { width: 500, height: 500 },
  },
  terminal: {
    title: 'Terminal',
    defaultSize: { width: 600, height: 600 },
    // resizable: false,
  },
  'publisher': {
    title: 'Publisher',
    defaultSize: { width: 1200, height: 760 },
    resizable: false,
  },
  'marketplace': {
    title: 'Marketplace',
    defaultSize: { width: 1100, height: 700 },
    resizable: false,
  },
  'atelier-viewer': {
    title: 'Atelier Viewer',
    defaultSize: { width: 900, height: 650 },
    resizable: true,
  },
  'vault': {
    title: 'Vault',
    defaultSize: { width: 1100, height: 700 },
    resizable: false,
  },
}; 