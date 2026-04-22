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
      <div className="publisher-panel-out px-6 py-2.5">
        <h1 className="text-foreground/90 text-3xl font-mono uppercase tracking-wider">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground text-sm font-mono tracking-wide mt-1">{subtitle}</p>
        )}
        {author && (
          <p className="text-muted-foreground/80 text-xs font-mono uppercase tracking-widest mt-1">{author}</p>
        )}
      </div>

      <div className="h-1 bg-gradient-to-r from-border via-muted to-border" />
    </div>
  );
}
