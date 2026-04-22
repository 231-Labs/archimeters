import React from 'react';

interface RetroPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'inset' | 'outset';
}

export const RetroPanel = React.forwardRef<HTMLDivElement, RetroPanelProps>(
  ({ children, className = '', variant = 'inset' }, ref) => {
    const styles =
      variant === 'inset'
        ? {
            borderTop: '2px solid var(--retro-inset-t)',
            borderLeft: '2px solid var(--retro-inset-l)',
            borderBottom: '2px solid var(--retro-inset-b)',
            borderRight: '2px solid var(--retro-inset-r)',
            boxShadow: `
        inset 2px 2px 4px rgba(0, 0, 0, 0.14),
        inset -1px -1px 2px color-mix(in srgb, var(--foreground) 5%, transparent),
        0 1px 0 color-mix(in srgb, var(--foreground) 6%, transparent)
      `,
            backgroundColor: 'var(--panel-deep)',
          }
        : {
            borderTop: '2px solid var(--retro-raised-t)',
            borderLeft: '2px solid var(--retro-raised-l)',
            borderBottom: '2px solid var(--retro-raised-b)',
            borderRight: '2px solid var(--retro-raised-r)',
            boxShadow: `
        inset 1px 1px 2px color-mix(in srgb, var(--foreground) 7%, transparent),
        inset -1px -1px 2px rgba(0, 0, 0, 0.18),
        0 2px 4px rgba(0, 0, 0, 0.12)
      `,
            backgroundColor: 'var(--panel)',
          };

    return (
      <div ref={ref} className={`text-foreground ${className}`} style={styles}>
        {children}
      </div>
    );
  }
);

RetroPanel.displayName = 'RetroPanel';
