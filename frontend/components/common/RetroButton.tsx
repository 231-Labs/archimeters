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
 * RetroButton — beveled 3D buttons; colors from globals.css (--retro-btn-*)
 * so primary/disabled states match light and dark themes.
 */
export const RetroButton = React.forwardRef<HTMLButtonElement, RetroButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      className = '',
      disabled,
      isLoading,
      onMouseDown,
      onMouseUp,
      onMouseLeave,
      onMouseEnter,
      onMouseOut,
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'px-3 py-1 text-xs',
      md: 'px-4 py-1.5 text-xs',
      lg: 'px-5 py-2 text-sm',
    };

    const v = variant;
    const isDisabled = disabled || isLoading;

    const raisedStyle = (): React.CSSProperties =>
      isDisabled
        ? {
            borderTop: `2px solid var(--retro-btn-${v}-disabled-border-tl)`,
            borderLeft: `2px solid var(--retro-btn-${v}-disabled-border-tl)`,
            borderBottom: `2px solid var(--retro-btn-${v}-disabled-border-br)`,
            borderRight: `2px solid var(--retro-btn-${v}-disabled-border-br)`,
            boxShadow: `inset 0 0 0 1px var(--retro-btn-${v}-disabled-border-br)`,
          }
        : {
            borderTop: `2px solid var(--retro-btn-${v}-raised-tl)`,
            borderLeft: `2px solid var(--retro-btn-${v}-raised-tl)`,
            borderBottom: `2px solid var(--retro-btn-${v}-raised-br)`,
            borderRight: `2px solid var(--retro-btn-${v}-raised-br)`,
            boxShadow: `var(--retro-btn-${v}-shadow)`,
          };

    const baseStyle: React.CSSProperties = {
      backgroundColor: isDisabled ? `var(--retro-btn-${v}-disabled-bg)` : `var(--retro-btn-${v}-bg)`,
      color: isDisabled ? `var(--retro-btn-${v}-disabled-fg)` : `var(--retro-btn-${v}-fg)`,
      ...raisedStyle(),
    };

    const applyRaised = (el: HTMLButtonElement) => {
      if (isDisabled) return;
      el.style.boxShadow = `var(--retro-btn-${v}-shadow)`;
      el.style.borderTop = `2px solid var(--retro-btn-${v}-raised-tl)`;
      el.style.borderLeft = `2px solid var(--retro-btn-${v}-raised-tl)`;
      el.style.borderBottom = `2px solid var(--retro-btn-${v}-raised-br)`;
      el.style.borderRight = `2px solid var(--retro-btn-${v}-raised-br)`;
    };

    const applyPressed = (el: HTMLButtonElement) => {
      if (isDisabled) return;
      el.style.boxShadow = `var(--retro-btn-${v}-shadow-pressed)`;
      el.style.borderTop = `2px solid var(--retro-btn-${v}-pressed-tl)`;
      el.style.borderLeft = `2px solid var(--retro-btn-${v}-pressed-tl)`;
      el.style.borderBottom = `2px solid var(--retro-btn-${v}-pressed-br)`;
      el.style.borderRight = `2px solid var(--retro-btn-${v}-pressed-br)`;
    };

    return (
      <button
        ref={ref}
        className={`
          relative font-medium transition-[transform,opacity] duration-75
          ${sizeStyles[size]}
          ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        style={baseStyle}
        disabled={isDisabled}
        onMouseDown={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = 'translateY(1px)';
            applyPressed(e.currentTarget);
          }
          onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = 'translateY(0)';
            applyRaised(e.currentTarget);
          }
          onMouseUp?.(e);
        }}
        onMouseLeave={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.transform = 'translateY(0)';
            applyRaised(e.currentTarget);
            e.currentTarget.style.backgroundColor = `var(--retro-btn-${v}-bg)`;
          }
          onMouseLeave?.(e);
        }}
        onMouseEnter={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = `var(--retro-btn-${v}-hover-bg)`;
          }
          onMouseEnter?.(e);
        }}
        onMouseOut={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = `var(--retro-btn-${v}-bg)`;
          }
          onMouseOut?.(e);
        }}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
