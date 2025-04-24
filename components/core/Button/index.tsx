import { buttonStyles } from './styles';
import type { ButtonProps } from './types';

/**
 * 基礎按鈕組件
 * @param loading - 是否顯示加載狀態
 * @param loadingText - 加載狀態顯示的文字
 * @param className - 自定義樣式類
 */
export default function Button({ 
  children, 
  loading, 
  loadingText = 'Loading...', 
  className = '',
  ...props 
}: ButtonProps) {
  return (
    <button 
      className={`${buttonStyles} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
} 