import { WindowName, WindowConfig } from '@/types/window';

export const defaultWindowConfigs: Record<WindowName, WindowConfig> = {
  entry: {
    title: 'Entry',
    defaultSize: { width: 500, height: 500 },
  },
  terminal: {
    title: 'Terminal',
    defaultSize: { width: 600, height: 600 },
    resizable: true,
  },
  'website-upload': {
    title: 'Design Publisher',
    defaultSize: { width: 1140, height: 600 },
    resizable: true,
  },
  browse: {
    title: 'Browse Images',
    defaultSize: { width: 520, height: 660 },
    resizable: true,
  },
  'atelier-viewer': {
    title: 'Atelier Viewer',
    defaultSize: { width: 800, height: 600 },
    resizable: true,
  },
}; 