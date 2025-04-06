import React from 'react';

interface DesktopIconProps {
  label: string;
  onClick: () => void;
  icon: string;
  className?: string;
}

export default function DesktopIcon({ label, onClick, icon, className = '' }: DesktopIconProps) {
  const handleClick = (e: React.MouseEvent) => {
    console.log('DesktopIcon clicked:', label);
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center ${className}`}
      title={label}
    >
      <span className="text-2xl">{icon}</span>
    </button>
  );
}