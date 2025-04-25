import { WindowName, WindowConfig } from '@/types/window';

export const defaultWindowConfigs: Record<WindowName, WindowConfig> = {
  entry: {
    title: 'Entry',
    defaultSize: { width: 400, height: 500 },
  },
  designer: {
    title: 'Parametric Terminal',
    defaultSize: { width: 640, height: 660 },
    resizable: true,
  },
  'website-upload': {
    title: 'Website Upload',
    defaultSize: { width: 1140, height: 600 },
    resizable: true,
  },
  browse: {
    title: 'Browse Images',
    defaultSize: { width: 900, height: 600 },
    resizable: true,
  },
}; 