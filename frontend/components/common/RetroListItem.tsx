'use client';

import React from 'react';

interface RetroListItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * RetroListItem - Retro OS styled list item component
 * Used for displaying items in list view mode
 */
export function RetroListItem({ onClick, children, className = '' }: RetroListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`group flex items-center gap-4 p-3 bg-[#1a1a1a] cursor-pointer transition-all font-mono ${className}`}
      style={{
        borderTop: '2px solid #0a0a0a',
        borderLeft: '2px solid #0a0a0a',
        borderBottom: '2px solid #2a2a2a',
        borderRight: '2px solid #2a2a2a',
        boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.6), inset -1px -1px 1px rgba(255, 255, 255, 0.03)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#252525';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1a1a1a';
      }}
    >
      {children}
    </div>
  );
}

interface RetroListThumbnailProps {
  src?: string;
  alt: string;
  fallback?: React.ReactNode;
}

export function RetroListThumbnail({ src, alt, fallback }: RetroListThumbnailProps) {
  return (
    <div 
      className="w-24 h-16 flex-shrink-0 bg-[#0a0a0a] overflow-hidden"
      style={{
        borderTop: '2px solid #0a0a0a',
        borderLeft: '2px solid #0a0a0a',
        borderBottom: '2px solid #1a1a1a',
        borderRight: '2px solid #1a1a1a',
        boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.8)',
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : fallback ? (
        fallback
      ) : (
        <div className="w-full h-full bg-[#0f0f0f] animate-pulse" />
      )}
    </div>
  );
}

interface RetroListInfoProps {
  title: string;
  metadata: React.ReactNode;
}

export function RetroListInfo({ title, metadata }: RetroListInfoProps) {
  return (
    <div className="flex-1 min-w-0">
      <h3 className="text-white/90 text-sm font-medium font-mono truncate uppercase tracking-wide">
        {title}
      </h3>
      <div className="flex items-center gap-4 mt-1.5 text-xs text-white/50 font-mono">
        {metadata}
      </div>
    </div>
  );
}

export function RetroListArrow() {
  return (
    <svg 
      className="w-4 h-4 text-white/30 flex-shrink-0 group-hover:text-white/50 transition-colors" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      strokeWidth={2.5}
    >
      <path strokeLinecap="square" strokeLinejoin="miter" d="M9 5l7 7-7 7" />
    </svg>
  );
}

