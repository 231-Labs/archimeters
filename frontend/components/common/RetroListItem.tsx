'use client';

import React from 'react';

interface RetroListItemProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function RetroListItem({ onClick, children, className = '' }: RetroListItemProps) {
  return (
    <div
      onClick={onClick}
      className={`retro-list-item-row group flex items-center gap-4 p-3 cursor-pointer transition-colors font-mono text-foreground ${className}`}
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
    <div className="w-24 h-16 flex-shrink-0 publisher-inset-well overflow-hidden bg-background">
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : fallback ? (
        fallback
      ) : (
        <div className="w-full h-full bg-panel-deep animate-pulse" />
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
      <h3 className="text-foreground/90 text-sm font-medium font-mono truncate uppercase tracking-wide">
        {title}
      </h3>
      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground font-mono">{metadata}</div>
    </div>
  );
}

export function RetroListArrow() {
  return (
    <svg
      className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-foreground/70 transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
    >
      <path strokeLinecap="square" strokeLinejoin="miter" d="M9 5l7 7-7 7" />
    </svg>
  );
}
