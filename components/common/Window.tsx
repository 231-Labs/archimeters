import React from 'react';
import type { WindowName } from '../types/index';

interface WindowProps {
  name: WindowName;
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isActive?: boolean;
  resizable?: boolean;  // 新增縮放配置
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
  resizable = false,  // 默認不可縮放
  onClose,
  onDragStart,
  onResize,
  onClick,
  children,
  className,
}) => {
  const bgStyle = {
    backgroundColor: '#FFF5F5',
  };

  return (
    <div
      className={`absolute flex flex-col ${
        isActive ? 'z-50' : 'z-0'
      } window-shadow retro-border bg-[#0a0a0a]`}
      style={{
        width: `${size.width}px`,
        height: `${size.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onClick={onClick}
    >
      {/* 標題欄 */}
      <div
        className="h-6 px-2 flex items-center justify-between border-b border-[rgba(255,255,255,0.2)] bg-[#141414]"
        onMouseDown={(e) => {
          // 如果點擊的是關閉按鈕，不觸發拖動
          if ((e.target as HTMLElement).closest('button')) {
            return;
          }
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

      {/* 內容區域 */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>

      {/* 調整大小的手柄 */}
      {resizable && onResize && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize border-l border-t border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)]"
          onMouseDown={(e) => onResize(e, name)}
        />
      )}
    </div>
  );
};

export default Window; 