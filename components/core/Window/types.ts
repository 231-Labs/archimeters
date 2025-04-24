import type { WindowName } from '@/types';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowProps {
  /**
   * 窗口的唯一標識名稱
   */
  name: WindowName;
  
  /**
   * 窗口標題
   */
  title: string;
  
  /**
   * 窗口位置
   */
  position: Position;
  
  /**
   * 窗口大小
   */
  size: Size;
  
  /**
   * 是否為活動窗口
   */
  isActive?: boolean;
  
  /**
   * 是否可調整大小
   */
  resizable?: boolean;
  
  /**
   * 關閉窗口的回調函數
   */
  onClose: (name: WindowName) => void;
  
  /**
   * 開始拖動窗口的回調函數
   */
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
  
  /**
   * 調整窗口大小的回調函數
   */
  onResize?: (e: React.MouseEvent, name: WindowName) => void;
  
  /**
   * 點擊窗口的回調函數
   */
  onClick?: () => void;
  
  /**
   * 窗口內容
   */
  children: React.ReactNode;
  
  /**
   * 自定義樣式類
   */
  className?: string;
} 