'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import type { WindowName } from '@/types';
import Masonry from 'react-masonry-css';
import { useSeriesImages } from '@/components/features/gallery/hooks/useSeriesImages';

interface BrowseWindowProps {
  name: WindowName;
  onOpenWindow: (name: WindowName) => void;
}

// Atelier type
interface Atelier {
  id: string;
  photoBlobId: string;
  algorithmBlobId: string;
  dataBlobId: string;
  url: string | null;
  algorithmContent: string | null;
  configData: any | null;
  title: string;
  author: string;
  price: string;
  isLoading: boolean;
  error: string | null;
}

// Image cache Map
const imageCache = new Map<string, string>();

export default function BrowseWindow({
  onOpenWindow,
}: BrowseWindowProps) {
  const result = useSeriesImages();
  const images = result?.images || [];
  const isLoading = result?.isLoading || false;
  const error = result?.error || null;
  const [loadedImageIds, setLoadedImageIds] = useState<string[]>([]);
  
  // Preload and cache images
  const preloadAndCacheImage = useCallback(async (url: string): Promise<void> => {
    if (!url || imageCache.has(url)) {
      return;
    }

    try {
      const response = await fetch(url, {
        cache: 'force-cache',
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      });
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      imageCache.set(url, objectUrl);
    } catch (error) {
      console.error('Error caching image:', error);
    }
  }, []);

  // When image data changes, preload images
  useEffect(() => {
    images.forEach(image => {
      if (image.url) {
        preloadAndCacheImage(image.url);
      }
    });
  }, [images, preloadAndCacheImage]);

  const getImageUrl = useCallback((url: string) => {
    return imageCache.get(url) || url;
  }, []);

  const handleImageClick = (atelier: Atelier) => {
    console.log('Image clicked:', atelier);
    sessionStorage.setItem('selected-atelier', JSON.stringify(atelier));
    onOpenWindow('atelier-viewer');
  };

  const breakpointColumns = {
    default: 4,
    1400: 3,
    1100: 2,
    700: 1
  };

  // Check if Atelier is fully loaded
  const isAtelierLoaded = (atelier: Atelier) => {
    return !atelier.isLoading && !atelier.error && atelier.url !== null;
  };

  // Scale Sui Price
  const scaleSuiPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    const scaled = Math.floor(numPrice / 1_000_000_000).toString();
    return scaled;
  };

  return (
    <div className="flex flex-col h-full relative bg-[#1a1a1a]">
      {/* Loading overlay */}
      {isLoading && images.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error message */}
      {error && images.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Image area: scrollable */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4">
          {images.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-white/80">
              <p className="text-lg mb-2">No Atelier Found</p>
              <p className="text-sm">Be the first one to create an Atelier!</p>
            </div>
          ) : (
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex w-auto -ml-3"
              columnClassName="pl-3 bg-clip-padding"
            >
              {images.map((atelier: Atelier) => (
                <div key={atelier.id} className="mb-3">
                  {atelier.isLoading ? (
                    <div className="w-full aspect-square bg-neutral-800/50 animate-pulse rounded-sm" />
                  ) : atelier.error ? (
                    <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center rounded-sm">
                      <p className="text-red-500 text-sm">{atelier.error}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleImageClick(atelier)}
                      className="relative group w-full outline-none transition-all"
                      disabled={!isAtelierLoaded(atelier)}
                    >
                      {atelier.url ? (
                        <div className="relative w-full">
                          <div className="relative w-full">
                            {/* Low quality preview image */}
                            <Image
                              src={getImageUrl(atelier.url)}
                              alt={atelier.title}
                              className={`w-full h-auto object-cover rounded-sm shadow-md blur-sm scale-110 ${
                                loadedImageIds.includes(atelier.id) ? 'hidden' : 'block'
                              }`}
                              width={1200}
                              height={800}
                              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
                              quality={1}
                              priority={!loadedImageIds.includes(atelier.id)}
                              style={{ height: 'auto' }}
                            />
                            {/* High quality image */}
                            <Image
                              src={getImageUrl(atelier.url)}
                              alt={atelier.title}
                              className={`w-full h-auto object-cover rounded-sm shadow-md transition-all duration-300 group-hover:scale-[1.02] ${
                                loadedImageIds.includes(atelier.id) ? 'block' : 'hidden'
                              }`}
                              width={1200}
                              height={800}
                              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
                              quality={90}
                              style={{ height: 'auto' }}
                              onLoad={() => {
                                setLoadedImageIds(prev => 
                                  prev.includes(atelier.id) ? prev : [...prev, atelier.id]
                                );
                              }}
                            />
                          </div>
                          {/* Hover text */}
                          <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-black/40 backdrop-blur-sm px-3 py-2">
                              <div className="text-sm text-white/95 font-medium">
                                {atelier.title} | @{atelier.author?.slice(0, 8)}
                              </div>
                              <div className="flex gap-1 justify-center items-center text-xs text-white/70">
                                <svg width="10" height="12" viewBox="0 0 300 384" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M240.057 159.914C255.698 179.553 265.052 204.39 265.052 231.407C265.052 258.424 255.414 284.019 239.362 303.768L237.971 305.475L237.608 303.31C237.292 301.477 236.929 299.613 236.502 297.749C228.46 262.421 202.265 232.134 159.148 207.597C130.029 191.071 113.361 171.195 108.985 148.586C106.157 133.972 108.258 119.294 112.318 106.717C116.379 94.1569 122.414 83.6187 127.549 77.2831L144.328 56.7754C147.267 53.1731 152.781 53.1731 155.719 56.7754L240.073 159.914H240.057ZM266.584 139.422L154.155 1.96703C152.007 -0.655678 147.993 -0.655678 145.845 1.96703L33.4316 139.422L33.0683 139.881C12.3868 165.555 0 198.181 0 233.698C0 316.408 67.1635 383.461 150 383.461C232.837 383.461 300 316.408 300 233.698C300 198.181 287.613 165.555 266.932 139.896L266.568 139.438L266.584 139.422ZM60.3381 159.472L70.3866 147.164L70.6868 149.439C70.9237 151.24 71.2239 153.041 71.5715 154.858C78.0809 189.001 101.322 217.456 140.173 239.496C173.952 258.724 193.622 280.828 199.278 305.064C201.648 315.176 202.059 325.129 201.032 333.835L200.969 334.372L200.479 334.609C185.233 342.05 168.09 346.237 149.984 346.237C86.4546 346.237 34.9484 294.826 34.9484 231.391C34.9484 204.153 44.4439 179.142 60.3065 159.44L60.3381 159.472Z" fill="white"/>
                                </svg>
                                {scaleSuiPrice(atelier.price)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full aspect-square bg-neutral-800/50 flex items-center justify-center rounded-sm">
                          <div className="w-full h-full animate-pulse" />
                        </div>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </Masonry>
          )}
        </div>
      </div>
    </div>
  );
} 