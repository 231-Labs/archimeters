import { WindowName } from '@/types/index';
import DesktopIcon from '../desktop/DesktopIcon';

interface DockProps {
  onOpenWindow: (name: WindowName) => void;
}

export default function Dock({ onOpenWindow }: DockProps) {
  return (
    <div 
      className="fixed left-1/2 -translate-x-1/2 bottom-4 bg-[rgba(10,10,10,0.4)] backdrop-blur-xl border border-white/10 z-50 pointer-events-none"
    >
      <div className="flex items-center pointer-events-auto">
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Entry</span>
          </div>
          <DesktopIcon
            label="Entry"
            onClick={() => onOpenWindow('entry')}
            icon="🎨"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Upload</span>
          </div>
          <DesktopIcon
            label="Upload"
            onClick={() => onOpenWindow('walrus-upload')}
            icon="📤"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">View</span>
          </div>
          <DesktopIcon
            label="View"
            onClick={() => onOpenWindow('walrus-view')}
            icon="📥"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">3D Model</span>
          </div>
          <DesktopIcon
            label="3D Model"
            onClick={() => onOpenWindow('model-3d')}
            icon="📦"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Designer Terminal</span>
          </div>
          <DesktopIcon
            label="Designer Terminal"
            onClick={() => onOpenWindow('designer')}
            icon="💻"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Test Design Series</span>
          </div>
          <DesktopIcon
            label="Test Design Series"
            onClick={() => onOpenWindow('test-design-series')}
            icon="🧪"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
} 