import { ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 是否處於加載狀態
   */
  loading?: boolean;
  
  /**
   * 加載狀態顯示的文字
   */
  loadingText?: string;
} 