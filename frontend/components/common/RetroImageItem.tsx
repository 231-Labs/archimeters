'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import { ReactNode } from 'react';

interface RetroImageItemProps {
  /** Image source - can be a URL or blobId (will use image-proxy) */
  imageSrc: string;
  /** Image alt text */
  alt: string;
  /** Click handler */
  onClick: () => void;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Bottom info bar content */
  infoContent?: ReactNode;
  /** Show info bar on hover only (default: false, always visible) */
  infoOnHover?: boolean;
  /** Enable lazy loading with intersection observer (default: true) */
  lazyLoad?: boolean;
  /** Custom image URL getter (for caching, etc.) */
  getImageUrl?: (url: string) => string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className for the container */
  className?: string;
}

export function RetroImageItem({
  imageSrc,
  alt,
  onClick,
  isLoading = false,
  error = null,
  infoContent,
  infoOnHover = false,
  lazyLoad = true,
  getImageUrl,
  disabled = false,
  className = '',
}: RetroImageItemProps) {
  const { ref, inView } = useInView({ 
    triggerOnce: true, 
    rootMargin: '100px',
    skip: !lazyLoad 
  });
  const [loaded, setLoaded] = useState(false);

  if (isLoading) {
    return (
      <div className={`w-full aspect-square bg-panel-deep/60 border border-border rounded-sm ${className}`}>
        {!lazyLoad && <div className="w-full h-full animate-pulse bg-panel-deep/40" />}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`w-full aspect-square bg-red-500/10 border border-red-500/30 flex items-center justify-center rounded-sm px-2 text-center ${className}`}
      >
        <p className="text-red-600 dark:text-red-400 text-xs font-mono leading-snug">{error}</p>
      </div>
    );
  }

  if (!imageSrc || imageSrc.trim() === '') {
    return (
      <div
        className={`w-full aspect-square bg-panel-deep/50 border border-border flex items-center justify-center rounded-sm ${className}`}
      >
        <p className="text-muted-foreground text-xs font-mono">No image</p>
      </div>
    );
  }

  const imageUrl = getImageUrl 
    ? getImageUrl(imageSrc) 
    : imageSrc.startsWith('http') || imageSrc.startsWith('/')
      ? imageSrc
      : `/api/image-proxy?blobId=${imageSrc}`;

  const shouldRenderImage = !lazyLoad || inView;

  const Container = disabled ? 'div' : 'button';

  return (
    <Container
      onClick={disabled ? undefined : onClick}
      className={`relative group w-full outline-none transition-all ${disabled ? '' : 'cursor-pointer'} ${className}`}
      ref={lazyLoad ? ref : undefined}
      tabIndex={disabled ? -1 : 0}
      role={disabled ? undefined : 'button'}
      disabled={disabled}
    >
      <div className="relative w-full">
        {shouldRenderImage && imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            width={1200}
            height={800}
            quality={90}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/2wCEAAEBAQEBAQEBAQEBAQECAgICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAALCAA4ADgBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z"
            onLoad={() => setLoaded(true)}
            className={`w-full h-auto object-cover rounded-sm shadow-md transition-all duration-300 group-hover:scale-[1.02] ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
            unoptimized={imageUrl.includes('/api/image-proxy')}
          />
        ) : (
          <div className="w-full aspect-square bg-panel-deep/50 animate-pulse rounded-sm border border-border" />
        )}
        <div className="absolute inset-0 bg-foreground/[0.06] rounded-sm pointer-events-none transition-opacity duration-300 group-hover:opacity-0" />
        
        {/* Bottom info bar */}
        {infoContent && (
          <div 
            className={`absolute inset-x-0 bottom-0 flex flex-col justify-end ${
              infoOnHover 
                ? 'opacity-0 group-hover:opacity-100 transition-opacity duration-300' 
                : ''
            }`}
          >
            <div className="bg-panel-deep/90 backdrop-blur-sm border-t border-border px-3 py-2 text-foreground">
              {infoContent}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}

