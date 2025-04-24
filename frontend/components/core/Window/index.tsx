import React, { useState, useEffect } from 'react';
import type { WindowProps } from './types';
import { windowStyles } from './styles';

/**
 * 可拖動和調整大小的窗口組件
 */
const Window: React.FC<WindowProps> = ({
  name,
  title,
  position,
  size,
  isActive,
  resizable = false,
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
    if (!resizable || !onResize) return;
    onResize(e, name);
  };

  return (
    <div
      className={`${windowStyles.container} ${
        isActive ? windowStyles.active : windowStyles.inactive
      } ${className || ''}`}
      style={{
        width: `${windowSize.width}px`,
        height: `${windowSize.height}px`,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
      onClick={onClick}
    >
      {/* 標題欄 */}
      <div
        className={windowStyles.titleBar}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          onDragStart(e, name);
        }}
      >
        <span className={windowStyles.title}>{title}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(name);
          }}
          className={windowStyles.closeButton}
        >
          ×
        </button>
      </div>
      
      <div className={windowStyles.content}>
        {children}
      </div>
      
      {resizable && onResize && (
        <div
          className={windowStyles.resizeHandle.container}
          onMouseDown={handleResizeStart}
        >
          <div className={windowStyles.resizeHandle.line1} />
          <div className={windowStyles.resizeHandle.line2} />
          <div className={windowStyles.resizeHandle.line3} />
        </div>
      )}
    </div>
  );
};

export default Window; 