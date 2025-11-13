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
  const borderStyle = variant === 'inset' 
    ? {
        borderTop: '2px solid #0a0a0a',
        borderLeft: '2px solid #0a0a0a',
        borderBottom: '2px solid #333333',
        borderRight: '2px solid #333333',
        boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.7), inset -1px -1px 1px rgba(255, 255, 255, 0.03)',
      }
    : {
        borderTop: '2px solid #2a2a2a',
        borderLeft: '2px solid #2a2a2a',
        borderBottom: '2px solid #0a0a0a',
        borderRight: '2px solid #0a0a0a',
        boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.05), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
      };

  return (
    <div
      className={`bg-[#1a1a1a] ${className}`}
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
          className="px-4 py-2 border-b border-white/10 flex items-center justify-between"
          style={{
            background: 'linear-gradient(to bottom, #1f1f1f, #1a1a1a)',
          }}
        >
          <h3 className="text-white/90 text-sm font-mono uppercase tracking-wide">
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

