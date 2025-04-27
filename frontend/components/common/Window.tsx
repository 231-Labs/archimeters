import React, { useState, useRef, useEffect } from 'react';
import type { WindowName } from '@/types';

interface WindowProps {
  name: WindowName;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isActive?: boolean;
  resizable?: boolean;
  zIndex: number;
  onClose: (name: WindowName) => void;
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
  onResize?: (e: React.MouseEvent, name: WindowName) => void;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

const Window: React.FC<WindowProps> = ({
  name,
  title,
  position,
  size,
  isActive,
  resizable = false,
  zIndex,
  onClose,
  onDragStart,
  onResize,
  onClick,
  children,
  className,
}) => {
  const [windowSize, setWindowSize] = useState(size);

  useEffect(() => {
    setWindowSize(size);
  }, [size]);

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!resizable) return;
    if (onResize) {
      onResize(e, name);
    }
  };

  return (
    <div
      className={`absolute flex flex-col window-shadow retro-border bg-[#0a0a0a] ${
        isActive ? 'ring-1 ring-white/20' : ''
      }`}
      style={{
        width: `${windowSize.width}px`,
        height: `${windowSize.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: zIndex,
      }}
      onClick={onClick}
    >
      {/* 標題欄 */}
      <div
        className={`h-6 px-2 flex items-center justify-between border-b border-[rgba(255,255,255,0.2)] ${
          isActive ? 'bg-[#1a1a1a]' : 'bg-[#141414]'
        }`}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onDragStart(e, name);
        }}
      >
        <span className="text-xs font-mono text-white font-bold">{title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(name);
          }}
          className="w-4 h-4 flex items-center justify-center text-xs border border-[rgba(255,255,255,0.2)] hover:bg-white/20 hover:border-white/40 text-white transition-colors"
        >
          ×
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
      {resizable && onResize && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize group"
          onMouseDown={handleResizeStart}
        >
          <div className="absolute bottom-0 right-0 w-4 h-4 border-l border-t border-[rgba(255,255,255,0.3)] group-hover:border-[rgba(255,255,255,0.6)]" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-l border-t border-[rgba(255,255,255,0.3)] group-hover:border-[rgba(255,255,255,0.6)]" />
          <div className="absolute bottom-2 right-2 w-1 h-1 border-l border-t border-[rgba(255,255,255,0.3)] group-hover:border-[rgba(255,255,255,0.6)]" />
        </div>
      )}
    </div>
  );
};

export default Window; 