import React from 'react';

export type RetroButtonVariant = 'primary' | 'secondary' | 'danger';
export type RetroButtonSize = 'sm' | 'md' | 'lg';

interface RetroButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: RetroButtonVariant;
  size?: RetroButtonSize;
  children: React.ReactNode;
  isLoading?: boolean;
}

/**
 * RetroButton - A reusable button component that matches the retro OS aesthetic
 * 
 * Features:
 * - Beveled 3D edges with inset/outset shadows
 * - Press-down effect on active state
 * - Multiple variants: primary, secondary, danger
 * - Consistent with Window component styling
 */
export const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md',
    children, 
    className = '',
    disabled,
    isLoading,
    ...props 
  }, ref) => {
    
    // Size configurations
    const sizeStyles = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-4 py-1.5 text-xs',
      lg: 'px-5 py-2 text-sm',
    };

    // Variant configurations
    const variantStyles = {
      primary: {
        bg: '#1a1a1a',
        hoverBg: '#222222',
        activeBg: '#0f0f0f',
        text: '#ffffff',
        disabledBg: '#0a0a0a',
        disabledText: '#444444',
      },
      secondary: {
        bg: '#2a2a2a',
        hoverBg: '#333333',
        activeBg: '#1f1f1f',
        text: '#cccccc',
        disabledBg: '#1a1a1a',
        disabledText: '#444444',
      },
      danger: {
        bg: '#3a1515',
        hoverBg: '#4a1a1a',
        activeBg: '#2a0f0f',
        text: '#ff6b6b',
        disabledBg: '#1a0a0a',
        disabledText: '#664444',
      },
    };

    const currentVariant = variantStyles[variant];
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={`
          relative font-medium transition-all duration-75
          ${sizeStyles[size]}
          ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
          ${className}
        `}
        style={{
          backgroundColor: isDisabled ? currentVariant.disabledBg : currentVariant.bg,
          color: isDisabled ? currentVariant.disabledText : currentVariant.text,
          
          // 3D beveled edges - raised button effect
          borderTop: isDisabled ? '2px solid #1a1a1a' : '2px solid #444',
          borderLeft: isDisabled ? '2px solid #1a1a1a' : '2px solid #444',
          borderBottom: isDisabled ? '2px solid #0a0a0a' : '2px solid #000',
          borderRight: isDisabled ? '2px solid #0a0a0a' : '2px solid #000',
          
          // Inner shadows for depth
          boxShadow: isDisabled
            ? 'inset 0 0 0 1px #0a0a0a'
            : `
                inset 1px 1px 2px rgba(255, 255, 255, 0.08),
                inset -1px -1px 2px rgba(0, 0, 0, 0.5),
                0 2px 4px rgba(0, 0, 0, 0.3)
              `,
        }}
        disabled={isDisabled}
        onMouseDown={(e) => {
          if (!isDisabled) {
            // Press-down effect
            e.currentTarget.style.transform = 'translateY(1px)';
            e.currentTarget.style.boxShadow = `
              inset 1px 1px 3px rgba(0, 0, 0, 0.8),
              inset -1px -1px 1px rgba(255, 255, 255, 0.05)
            `;
            e.currentTarget.style.borderTop = '2px solid #000';
            e.currentTarget.style.borderLeft = '2px solid #000';
            e.currentTarget.style.borderBottom = '2px solid #444';
            e.currentTarget.style.borderRight = '2px solid #444';
          }
        }}
        onMouseUp={(e) => {
          if (!isDisabled) {
            // Reset to raised state
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `
              inset 1px 1px 2px rgba(255, 255, 255, 0.08),
              inset -1px -1px 2px rgba(0, 0, 0, 0.5),
              0 2px 4px rgba(0, 0, 0, 0.3)
            `;
            e.currentTarget.style.borderTop = '2px solid #444';
            e.currentTarget.style.borderLeft = '2px solid #444';
            e.currentTarget.style.borderBottom = '2px solid #000';
            e.currentTarget.style.borderRight = '2px solid #000';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            // Reset on mouse leave
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `
              inset 1px 1px 2px rgba(255, 255, 255, 0.08),
              inset -1px -1px 2px rgba(0, 0, 0, 0.5),
              0 2px 4px rgba(0, 0, 0, 0.3)
            `;
            e.currentTarget.style.borderTop = '2px solid #444';
            e.currentTarget.style.borderLeft = '2px solid #444';
            e.currentTarget.style.borderBottom = '2px solid #000';
            e.currentTarget.style.borderRight = '2px solid #000';
          }
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = currentVariant.hoverBg;
          }
        }}
        onMouseOut={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = currentVariant.bg;
          }
        }}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg 
              className="animate-spin h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

RetroButton.displayName = 'RetroButton';

