import React from 'react';

interface RetroPanelProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'inset' | 'outset';
}

export const RetroPanel = React.forwardRef<HTMLDivElement, RetroPanelProps>(
  ({ children, className = '', variant = 'inset' }, ref) => {
    
    const styles = variant === 'inset' ? {
      borderTop: '2px solid #000000',
      borderLeft: '2px solid #000000',
      borderBottom: '2px solid #2a2a2a',
      borderRight: '2px solid #2a2a2a',
      boxShadow: `
        inset 2px 2px 4px rgba(0, 0, 0, 0.8),
        inset -1px -1px 2px rgba(255, 255, 255, 0.03),
        0 1px 0 rgba(255, 255, 255, 0.05)
      `,
    } : {
      // Outset (raised) panel - looks raised from the surface
      borderTop: '2px solid #444',
      borderLeft: '2px solid #444',
      borderBottom: '2px solid #000',
      borderRight: '2px solid #000',
      boxShadow: `
        inset 1px 1px 2px rgba(255, 255, 255, 0.08),
        inset -1px -1px 2px rgba(0, 0, 0, 0.5),
        0 2px 4px rgba(0, 0, 0, 0.3)
      `,
    };

    return (
      <div
        ref={ref}
        className={className}
        style={{
          backgroundColor: '#0a0a0a',
          ...styles,
        }}
      >
        {children}
      </div>
    );
  }
);

RetroPanel.displayName = 'RetroPanel';

