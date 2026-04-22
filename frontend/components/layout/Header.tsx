import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

type HeaderProps = {
  paused: boolean;
  onToggle: () => void;
};

const Header = ({ paused, onToggle }: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
      
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      setCurrentDate(`${year}/${month}/${day}`);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 h-7 border-b border-border-subtle flex items-center justify-between px-3"
      style={{
        zIndex: 1000,
        background: 'var(--header-bg)',
        backdropFilter: 'blur(2px)',
      }}
    >
      <button
        type="button"
        className="text-xs font-mono font-bold text-foreground hover:text-foreground/80 transition-colors cursor-pointer"
        onClick={() => {/* TODO: implement */}}
      >
        Archimeters OS
      </button>

      <div className="flex items-center gap-2 sm:gap-3 text-foreground">
        <ThemeToggle />
        <div className="h-3 border-l border-border-subtle" aria-hidden />
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-border-subtle hover:border-border-strong transition-all group"
          title={paused ? "Resume background animation" : "Pause background animation"}
        >
          <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground/80 transition-colors">
            BG
          </span>
          <div className="flex items-center gap-0.5">
            <div
              className={`w-5 h-2.5 rounded-sm transition-all ${
                paused ? 'bg-foreground/15' : 'bg-emerald-500/40'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-[1px] bg-foreground transition-all ${
                  paused ? 'translate-x-0.5' : 'translate-x-2.5'
                }`}
              />
            </div>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground">
            {paused ? '⏸' : '▶'}
          </span>
        </button>
        <div className="h-3 border-l border-border-subtle" aria-hidden />
        <span className="text-xs font-mono font-bold">{currentDate}</span>
        <div className="h-3 border-l border-border-subtle" aria-hidden />
        <span className="text-xs font-mono font-bold">{currentTime}</span>
      </div>
    </div>
  );
};

export default Header; 