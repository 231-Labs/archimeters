import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export const buttonStyles = "px-4 py-1.5 bg-[rgba(255,255,255,0.1)] text-white border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

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
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
} 