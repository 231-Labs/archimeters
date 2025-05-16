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
  
        borderTop: '3px solid #888',
        borderLeft: '3px solid #777',
        borderBottom: '3px solid #0a0a0a',
        borderRight: '3px solid #111',
  
        boxShadow: `
          inset 0 1px 1px #1c1c1c,  
          inset 1px 0 1px #1c1c1c, 
          inset -1px 0 1px #000000, 
          inset 0 -1px 1px #000000,
          0 0 0 0.5px #999    
        `
      }}
      onClick={onClick}
    >
      {/* 標題欄 */}
      <div
        className={`h-8 px-2 flex items-center justify-between ${
          isActive ? 'bg-[#0c0c0c]' : 'bg-[#141414]'
        }`}
        style={{
          // 內層壓紋（左上暗，右下亮，形成內凹）
          borderTop: '4px solid #1a1a1a',
          borderLeft: '4px solid #111',
          borderBottom: '4px solid #555',
          borderRight: '4px solid #444',
          background: 'linear-gradient(to right,rgb(50, 50, 50), rgb(29, 29, 29), rgb(19, 19, 19),rgb(11, 11, 11))'
        }}
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
          className="flex-1 overflow-hidden bg-[#FFF]"
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
            bottom: '4px',  // 原本是 0，往內推 4px，避免蓋住下方邊框
            right: '4px',   // 原本是 0，往內推 4px，避免蓋住右方邊框
            // cursor: 'se-resize',
            // zIndex: 10, // 確保浮在最上面
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