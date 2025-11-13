import { WindowName } from '@/components/features/window-manager';

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
      className="fixed left-1/2 -translate-x-1/2 bottom-4 bg-[rgba(10,10,10,0.4)] backdrop-blur-xl border border-white/10 z-50 pointer-events-none gap-12 shadow-[inset_-2px_-2px_0_#000,inset_2px_2px_0_#555]"
      style={{ 
        background: 'linear-gradient(to right, rgba(49, 49, 49, 0.2), rgba(29, 29, 29, 0.2), rgba(19, 19, 19, 0.2), rgba(11, 11, 11, 0.2))',
        backdropFilter: 'blur(2px)',
      }}
    >
      <div className="flex items-center pointer-events-auto gap-4">
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Entry</span>
          </div>
          <img
            onClick={() => handleIconClick('entry')}
            src="/entry.png"
            className="w-10 h-10 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Publisher</span>
          </div>
          <img
            onClick={() => handleIconClick('publisher')}
            src="/designPublisher.png"
            className="w-14 h-14 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Marketplace</span>
          </div>
          <img
            onClick={() => handleIconClick('marketplace')}
            src="/gallery.png"
            className="w-11 h-11 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Vault</span>
          </div>
          <img
            onClick={() => handleIconClick('vault')}
            src="/vault.png"
            className="w-9 h-9 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Terminal</span>
          </div>
          <img
            onClick={() => handleIconClick('terminal')}
            src="/terminal.png"
            className="w-11 h-11 flex items-center justify-center transition-all duration-200"
          />
        </div>
        <div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
            <span className="text-white/90 text-xs">Pavilion</span>
          </div>
          <div
            onClick={() => handleIconClick('pavilion')}
            className="w-11 h-11 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            {/* Pavilion SVG Icon - Walrus Sites Browser */}
            <svg
              className="w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" className="text-white/80" />
              <path
                d="M12 2a10 10 0 0 1 0 20M12 2a10 10 0 0 0 0 20M2 12h20"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-white/80"
              />
              <path
                d="M12 8v8M8 12h8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="text-white/60"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
} 