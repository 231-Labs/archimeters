import React, { useState, useEffect } from 'react';
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
    <>
    <div
      className={`absolute flex flex-col bg-[#0a0a0a] ${isActive ? 'ring-1 ring-white/20' : ''} ${className || ''}`}
      style={{
        width: `${windowSize.width}px`,
        height: `${windowSize.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: zIndex,
  
        // Outer frame - raised 3D effect
        borderTop: '2px solid #666',
        borderLeft: '2px solid #666',
        borderBottom: '2px solid #0a0a0a',
        borderRight: '2px solid #0a0a0a',
  
        boxShadow: `
          inset 0 1px 0 rgba(255, 255, 255, 0.08),
          inset 1px 0 0 rgba(255, 255, 255, 0.08),
          inset -1px 0 0 rgba(0, 0, 0, 0.6),
          inset 0 -1px 0 rgba(0, 0, 0, 0.6),
          0 4px 12px rgba(0, 0, 0, 0.6),
          0 0 0 1px #333
        `
      }}
      onClick={onClick}
    >
      <div
        className={`h-8 px-2 flex items-center justify-between ${
          isActive ? 'bg-[#0c0c0c]' : 'bg-[#141414]'
        }`}
        style={{
          // Title bar inset effect
          borderTop: '2px solid #0a0a0a',
          borderLeft: '2px solid #0a0a0a',
          borderBottom: '2px solid #333',
          borderRight: '2px solid #2a2a2a',
          background: 'linear-gradient(to bottom, #0f0f0f, #1a1a1a)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.6), inset -1px -1px 1px rgba(255, 255, 255, 0.03)'
        }}
        onClick={(e) => {
          // Activate window on header click
          if (!(e.target as HTMLElement).closest('button')) {
            onClick?.();
          }
        }}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          
          // Pass the event directly - startDragging now uses state position
          onDragStart(e, name);
        }}
      >
        <span className="text-xs font-mono text-white font-bold">{title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(name);
          }}
          className="w-5 h-5 flex items-center justify-center text-xs font-bold text-white
             border border-[#555] bg-[#1a1a1a]
             shadow-[inset_-1px_-1px_0_#000,inset_1px_1px_0_#555]
             hover:shadow-[inset_1px_1px_0_#000,inset_-1px_-1px_0_#777]
             transition-shadow"
        >
          ×
        </button>
      </div>
      {/* 內容區 */}
      <div
          className="flex-1 overflow-hidden bg-[#1a1a1a]"
          style={{
            borderTop: '4px solid #000',
            borderLeft: '4px solid #000',
            borderBottom: '4px solid #444',
            borderRight: '4px solid #333',
          }}
        >
          {children}
      </div>

      {/* Resize Handle */}
      {resizable && onResize && (
        <div
          className="absolute"
          style={{
            bottom: '4px',
            right: '4px',

          }}
          onMouseDown={handleResizeStart}
        >
        <div className="w-full h-full relative">
            <div className="absolute bottom-0 right-0 w-[16px] h-[16px] border-l border-t border-[#777] group-hover:border-[#999]" />
            <div className="absolute bottom-1 right-1 w-[8px] h-[8px] border-l border-t border-[#777] group-hover:border-[#999]" />
            <div className="absolute bottom-2 right-2 w-[2px] h-[2px] border-l border-t border-[#777] group-hover:border-[#999]" />
          </div>  
        </div>
      )}
    </div>
    </>
  );
};

export default Window; 