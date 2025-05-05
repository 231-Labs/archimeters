import { WindowName } from '@/types';
import DesktopIcon from '../desktop/DesktopIcon';

export interface DockProps {
  onOpenWindow: (name: WindowName) => void;
  onActivateWindow: (name: WindowName) => void;
}

export default function Dock({ onOpenWindow, onActivateWindow }: DockProps) {
  const handleIconClick = (name: WindowName) => {
    onOpenWindow(name);
    onActivateWindow(name);
  };

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
            onClick={() => handleIconClick('entry')}
            icon="🎨"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Parametric Terminal</span>
          </div>
          <DesktopIcon
            label="Parametric Terminal"
            onClick={() => handleIconClick('terminal')}
            icon="💻"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Website Upload</span>
          </div>
          <DesktopIcon
            label="Website Upload"
            onClick={() => handleIconClick('website-upload')}
            icon="🌐"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Browse Images</span>
          </div>
          <DesktopIcon
            label="Browse Images"
            onClick={() => handleIconClick('browse')}
            icon="🖼️"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Vault</span>
          </div>
          <DesktopIcon
            label="Vault"
            onClick={() => handleIconClick('vault')}
            icon="🖼️"
            className="w-12 h-12 flex items-center justify-center transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
} 