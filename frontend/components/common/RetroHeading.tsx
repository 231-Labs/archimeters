'use client';

import React from 'react';

interface RetroHeadingProps {
  title: string;
  subtitle?: string;
  author?: string;
  className?: string;
}

/**
 * RetroHeading - Retro OS styled heading component
 * Used for page/section titles with optional subtitle
 */
export function RetroHeading({ title, subtitle, author, className = '' }: RetroHeadingProps) {
  return (
    <div className={`relative ${className}`}>
      <div 
        className="px-6 py-2.5"
        style={{
          background: 'linear-gradient(to bottom, #1f1f1f, #1a1a1a)',
          borderTop: '2px solid #2a2a2a',
          borderLeft: '2px solid #2a2a2a',
          borderBottom: '2px solid #0a0a0a',
          borderRight: '2px solid #0a0a0a',
          boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.05), inset -1px -1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
        }}
      >
        <h1 className="text-white/90 text-3xl font-mono uppercase tracking-wider">
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/60 text-sm font-mono tracking-wide mt-1">
            {subtitle}
          </p>
        )}
        {author && (
          <p className="text-white/40 text-xs font-mono uppercase tracking-widest mt-1.5">
            {author}
          </p>
        )}
      </div>
      
      {/* Bottom decorative line */}
      <div 
        className="h-1"
        style={{
          background: 'linear-gradient(to right, #0a0a0a, #2a2a2a, #0a0a0a)',
        }}
      />
    </div>
  );
}

