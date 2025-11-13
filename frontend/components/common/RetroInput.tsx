'use client';

import React from 'react';

interface RetroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'dark';
}

export const RetroInput = React.forwardRef<HTMLInputElement, RetroInputProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variantStyles = {
      default: {
        bg: '#0a0a0a',
        text: '#cccccc',
        border: '#2a2a2a',
        borderDark: '#000000',
        placeholder: 'rgba(255, 255, 255, 0.3)',
        focus: 'rgba(255, 255, 255, 0.4)',
      },
      dark: {
        bg: '#000000',
        text: '#cccccc',
        border: '#1a1a1a',
        borderDark: '#000000',
        placeholder: 'rgba(255, 255, 255, 0.2)',
        focus: 'rgba(255, 255, 255, 0.3)',
      },
    };

    const currentVariant = variantStyles[variant];

    return (
      <input
        ref={ref}
        className={`
          w-full px-3 py-2 text-sm font-mono
          transition-all duration-150
          outline-none
          ${className}
        `}
        style={{
          backgroundColor: currentVariant.bg,
          color: currentVariant.text,
          borderTop: `2px solid ${currentVariant.borderDark}`,
          borderLeft: `2px solid ${currentVariant.borderDark}`,
          borderBottom: `2px solid ${currentVariant.border}`,
          borderRight: `2px solid ${currentVariant.border}`,
          boxShadow: `
            inset 2px 2px 3px rgba(0, 0, 0, 0.8),
            inset -1px -1px 2px rgba(255, 255, 255, 0.02)
          `,
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderTop = `2px solid ${currentVariant.focus}`;
          e.currentTarget.style.borderLeft = `2px solid ${currentVariant.focus}`;
          e.currentTarget.style.boxShadow = `
            inset 2px 2px 4px rgba(0, 0, 0, 0.9),
            inset -1px -1px 2px rgba(255, 255, 255, 0.05),
            0 0 0 1px ${currentVariant.focus}
          `;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderTop = `2px solid ${currentVariant.borderDark}`;
          e.currentTarget.style.borderLeft = `2px solid ${currentVariant.borderDark}`;
          e.currentTarget.style.boxShadow = `
            inset 2px 2px 3px rgba(0, 0, 0, 0.8),
            inset -1px -1px 2px rgba(255, 255, 255, 0.02)
          `;
        }}
        {...props}
      />
    );
  }
);

RetroInput.displayName = 'RetroInput';

