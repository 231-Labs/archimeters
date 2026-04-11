import React, { useState, useEffect } from 'react';
import type { WindowName } from '../types';

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

  const frameShadow = `
    inset 0 1px 0 color-mix(in srgb, var(--foreground) 10%, transparent),
    inset 1px 0 0 color-mix(in srgb, var(--foreground) 8%, transparent),
    inset -1px 0 0 rgba(0, 0, 0, 0.45),
    inset 0 -1px 0 rgba(0, 0, 0, 0.45),
    0 4px 14px rgba(0, 0, 0, 0.35),
    0 0 0 1px color-mix(in srgb, var(--foreground) 12%, transparent)
  `;

  return (
    <div
      className={`absolute flex flex-col text-foreground ${className || ''}`}
      style={{
        width: `${windowSize.width}px`,
        height: `${windowSize.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex,
        background: 'var(--window-body)',
        borderTop: '2px solid var(--window-frame-hi)',
        borderLeft: '2px solid var(--window-frame-hi)',
        borderBottom: '2px solid var(--window-frame-lo)',
        borderRight: '2px solid var(--window-frame-lo)',
        boxShadow: isActive ? `0 0 0 1px var(--window-active-ring), ${frameShadow}` : frameShadow,
      }}
      onClick={onClick}
    >
      <div
        className="h-8 px-2 flex items-center justify-between"
        style={{
          borderTop: '2px solid var(--window-title-border-tl)',
          borderLeft: '2px solid var(--window-title-border-tl)',
          borderBottom: '2px solid var(--window-title-border-br)',
          borderRight: '2px solid var(--window-title-border-br)',
          background: isActive
            ? `linear-gradient(to bottom, var(--window-title-start), var(--window-title-end))`
            : `linear-gradient(to bottom, var(--window-inactive-title-start), var(--window-inactive-title-end))`,
          boxShadow:
            'inset 1px 1px 2px rgba(0, 0, 0, 0.35), inset -1px -1px 1px color-mix(in srgb, var(--foreground) 6%, transparent)',
        }}
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) {
            onClick?.();
          }
        }}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onDragStart(e, name);
        }}
      >
        <span className="text-xs font-mono font-bold text-foreground truncate pr-2">{title}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose(name);
          }}
          className="w-5 h-5 flex items-center justify-center text-xs font-bold text-foreground shrink-0 transition-shadow"
          style={{
            border: '1px solid var(--window-close-border)',
            backgroundColor: 'var(--window-close-bg)',
            boxShadow: 'inset -1px -1px 0 rgba(0,0,0,0.45), inset 1px 1px 0 color-mix(in srgb, var(--foreground) 15%, transparent)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = 'var(--window-close-hover-shadow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              'inset -1px -1px 0 rgba(0,0,0,0.45), inset 1px 1px 0 color-mix(in srgb, var(--foreground) 15%, transparent)';
          }}
          aria-label="Close window"
        >
          ×
        </button>
      </div>
      <div
        className="flex-1 overflow-hidden bg-[var(--window-content-bg)]"
        style={{
          borderTop: '4px solid var(--window-content-bevel-tl)',
          borderLeft: '4px solid var(--window-content-bevel-tl)',
          borderBottom: '4px solid var(--window-content-bevel-br)',
          borderRight: '4px solid var(--window-content-bevel-br)',
        }}
      >
        {children}
      </div>

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
            <div
              className="absolute bottom-0 right-0 w-[16px] h-[16px] border-l border-t"
              style={{ borderColor: 'var(--window-resize-grip)' }}
            />
            <div
              className="absolute bottom-1 right-1 w-[8px] h-[8px] border-l border-t"
              style={{ borderColor: 'var(--window-resize-grip)' }}
            />
            <div
              className="absolute bottom-2 right-2 w-[2px] h-[2px] border-l border-t"
              style={{ borderColor: 'var(--window-resize-grip)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Window;
