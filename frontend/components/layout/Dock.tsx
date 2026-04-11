import { WindowName } from '@/components/features/window-manager';

export interface DockProps {
  onOpenWindow: (name: WindowName) => void;
  onActivateWindow: (name: WindowName) => void;
}

const DOCK_ITEMS: {
  name: WindowName;
  label: string;
  src: string;
  imgClass: string;
}[] = [
  { name: 'entry', label: 'Entry', src: '/entry.png', imgClass: 'w-10 h-10' },
  { name: 'publisher', label: 'Publisher', src: '/designPublisher.png', imgClass: 'w-14 h-14' },
  { name: 'marketplace', label: 'Marketplace', src: '/gallery.png', imgClass: 'w-11 h-11' },
  { name: 'vault', label: 'Vault', src: '/vault.png', imgClass: 'w-9 h-9' },
  { name: 'terminal', label: 'Terminal', src: '/terminal.png', imgClass: 'w-11 h-11' },
];

export default function Dock({ onOpenWindow, onActivateWindow }: DockProps) {
  const handleIconClick = (name: WindowName) => {
    onOpenWindow(name);
    onActivateWindow(name);
  };

  return (
    <div className="dock-tray fixed left-1/2 -translate-x-1/2 bottom-4 z-50 pointer-events-none max-w-[calc(100vw-1.5rem)]">
      <div className="flex items-center justify-center pointer-events-auto gap-2 sm:gap-3">
        {DOCK_ITEMS.map(({ name, label, src, imgClass }) => (
          <div key={name} className="group relative">
            <div
              className="dock-tooltip absolute -top-[2.15rem] left-1/2 -translate-x-1/2 px-2.5 py-1 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10"
              role="tooltip"
            >
              <span className="text-xs font-mono tracking-wide">{label}</span>
            </div>
            <button
              type="button"
              onClick={() => handleIconClick(name)}
              aria-label={label}
              className="dock-icon-hit flex items-center justify-center p-1.5 sm:p-2 hover:scale-110 active:scale-105"
            >
              <img src={src} alt="" className={`${imgClass} object-contain select-none`} draggable={false} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
