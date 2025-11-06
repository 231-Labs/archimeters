import { WindowName, WindowConfig } from '@/types/window';

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
    defaultSize: { width: 1140, height: 600 },
    resizable: true,
  },
  'gallery': {
    title: 'Gallery',
    defaultSize: { width: 700, height: 650 },
    resizable: true,
  },
  'atelier-viewer': {
    title: 'Atelier Viewer',
    defaultSize: { width: 900, height: 650 },
    resizable: true,
  },
  'vault': {
    title: 'Vault',
    defaultSize: { width: 800, height: 600 },
    resizable: true,
  },
  'pavilion': {
    title: 'Pavilion',
    defaultSize: { width: 1000, height: 700 },
    resizable: true,
  },
}; 