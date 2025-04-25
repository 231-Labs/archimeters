import { WindowName, WindowConfig } from '@/types/window';

export const defaultWindowConfigs: Record<WindowName, WindowConfig> = {
  entry: {
    title: 'Entry',
    defaultSize: { width: 500, height: 600 },
  },
  designer: {
    title: 'Parametric Terminal',
    defaultSize: { width: 800, height: 600 },
    resizable: true,
  },
  'website-upload': {
    title: 'Website Upload',
    defaultSize: { width: 1280, height: 800 },
    resizable: true,
  },
  browse: {
    title: 'Browse Images',
    defaultSize: { width: 1280, height: 800 },
    resizable: true,
  },
}; 