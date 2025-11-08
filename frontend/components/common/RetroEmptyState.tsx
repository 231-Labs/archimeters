'use client';

import React from 'react';

interface RetroEmptyStateProps {
  title: string;
  message: string;
  icon?: 'box' | 'file' | 'image' | 'globe';
  className?: string;
}

/**
 * RetroEmptyState - Retro OS styled empty state component
 * Used to display when there are no items to show
 */
export function RetroEmptyState({ 
  title, 
  message, 
  icon = 'box',
  className = '' 
}: RetroEmptyStateProps) {
  const getIcon = () => {
    switch (icon) {
      case 'file':
        return (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'globe':
        return (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default: // box
        return (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
      <div 
        className="mb-6 p-6 bg-[#1a1a1a]"
        style={{
          borderTop: '2px solid #0a0a0a',
          borderLeft: '2px solid #0a0a0a',
          borderBottom: '2px solid #333',
          borderRight: '2px solid #333',
          boxShadow: 'inset 1px 1px 3px rgba(0, 0, 0, 0.7), inset -1px -1px 1px rgba(255, 255, 255, 0.03)',
        }}
      >
        <div className="text-white/30">
          {getIcon()}
        </div>
      </div>
      
      <h3 className="text-white/70 text-base font-mono uppercase tracking-widest mb-2">
        {title}
      </h3>
      
      <p className="text-white/40 text-sm font-mono text-center max-w-md">
        {message}
      </p>
    </div>
  );
}

