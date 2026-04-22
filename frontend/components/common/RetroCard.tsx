'use client';

import React from 'react';

interface RetroCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'inset';
}

/**
 * RetroCard - Retro OS styled card component with 3D border effects
 * Used for content sections in the Atelier Viewer
 */
export function RetroCard({ children, className = '', variant = 'default' }: RetroCardProps) {
  const borderStyle =
    variant === 'inset'
      ? {
          borderTop: '2px solid var(--retro-inset-t)',
          borderLeft: '2px solid var(--retro-inset-l)',
          borderBottom: '2px solid var(--retro-inset-b)',
          borderRight: '2px solid var(--retro-inset-r)',
          boxShadow:
            'inset 1px 1px 3px rgba(0, 0, 0, 0.18), inset -1px -1px 1px rgba(255, 255, 255, 0.06)',
        }
      : {
          borderTop: '2px solid var(--retro-raised-t)',
          borderLeft: '2px solid var(--retro-raised-l)',
          borderBottom: '2px solid var(--retro-raised-b)',
          borderRight: '2px solid var(--retro-raised-r)',
          boxShadow:
            'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.22)',
        };

  return (
    <div
      className={`bg-panel ${className}`}
      style={borderStyle}
    >
      {children}
    </div>
  );
}

interface RetroSectionProps {
  title?: string;
  titleRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'inset';
}

/**
 * RetroSection - RetroCard with optional title and title-right content
 */
export function RetroSection({ title, titleRight, children, className = '', variant = 'default' }: RetroSectionProps) {
  return (
    <RetroCard variant={variant} className={className}>
      {title && (
        <div
          className="px-4 py-2 border-b border-border flex items-center justify-between"
          style={{
            background: 'linear-gradient(to bottom, var(--panel-header-t), var(--panel-header-b))',
          }}
        >
          <h3 className="text-foreground/90 text-sm font-mono uppercase tracking-wide">
            {title}
          </h3>
          {titleRight && <div>{titleRight}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </RetroCard>
  );
}

