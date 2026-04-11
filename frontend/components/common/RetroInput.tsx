'use client';

import React from 'react';

interface RetroInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'dark';
}

export const RetroInput = React.forwardRef<HTMLInputElement, RetroInputProps>(
  ({ className = '', variant: _variant = 'default', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          publisher-input-embed
          w-full px-3 py-2 text-sm font-mono
          transition-all duration-150
          outline-none
          placeholder:text-muted-foreground
          ${className}
        `}
        {...props}
      />
    );
  }
);

RetroInput.displayName = 'RetroInput';
