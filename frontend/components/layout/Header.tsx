import { useEffect, useState } from 'react';

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
      className="fixed top-0 left-0 right-0 h-7 border-b border-[rgba(255,255,255,0.2)] flex items-center justify-between px-3"
      style={{ 
        zIndex: 1000,
        background: 'linear-gradient(to right, rgba(79, 79, 79, 0.6), rgba(49, 49, 49, 0.6), rgba(19, 19, 19, 0.6), rgba(11, 11, 11, 0.6))',
        backdropFilter: 'blur(2px)',
      }}
    >
      <button 
        className="text-xs font-mono font-bold text-white hover:text-white/80 transition-colors cursor-pointer"
        onClick={() => {/* 待實現 */}}
      >
        Archimeters OS
      </button>

      <div className="flex items-center gap-2 text-white">
        <button onClick={onToggle}>
          Background {paused ? 'Resume' : 'Pause'}
        </button>
        <span className="text-xs font-mono font-bold">{currentDate}</span>
        <div className="h-3 border-l border-[rgba(255,255,255,0.2)]"></div>
        <span className="text-xs font-mono font-bold">{currentTime}</span>
      </div>
    </div>
  );
};

export default Header; 