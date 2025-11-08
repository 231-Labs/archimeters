'use client';

import React from 'react';
import { RetroCard } from './RetroCard';

interface RetroPreviewProps {
  children: React.ReactNode;
  height?: string;
  className?: string;
}

/**
 * RetroPreview - Retro OS styled preview container for 3D/2D content
 * Features inset border effect to simulate a screen/viewport
 */
export function RetroPreview({ children, height = '500px', className = '' }: RetroPreviewProps) {
  return (
    <RetroCard variant="inset" className={className}>
      <div 
        className="relative bg-[#0a0a0a] flex items-center justify-center"
        style={{ height }}
      >
        {children}
      </div>
    </RetroCard>
  );
}

interface RetroImageProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * RetroImage - Retro styled image container with inset effect
 */
export function RetroImage({ src, alt, className = '' }: RetroImageProps) {
  return (
    <RetroCard variant="inset" className={className}>
      <div className="relative aspect-square bg-[#0a0a0a] overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-contain"
        />
      </div>
    </RetroCard>
  );
}

