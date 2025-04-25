'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import type { WindowName } from '@/types';
import Masonry from 'react-masonry-css';
import { useSeriesImages } from '@/components/features/gallery/hooks/useSeriesImages';

interface BrowseWindowProps {
  name: WindowName;
}

interface ImageData {
  id: string;
  url: string | null;
  title: string;
  social: string;
  isLoading: boolean;
  error: string | null;
}

// 緩存圖片的 Map
const imageCache = new Map<string, string>();

export default function BrowseWindow({
  name,
}: BrowseWindowProps) {
  const result = useSeriesImages();
  const images = result?.images || [];
  const isLoading = result?.isLoading || false;
  const error = result?.error || null;
  const [loadedImageIds, setLoadedImageIds] = useState<string[]>([]);

  // 預加載並緩存圖片
  const preloadAndCacheImage = useCallback(async (url: string): Promise<void> => {
    if (imageCache.has(url)) {
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

  // 當圖片數據變化時預加載
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

  const handleImageClick = (image: ImageData) => {
    // TODO: 實現圖片點擊功能
    console.log('Image clicked:', image);
  };

  const breakpointColumns = {
    default: 4,
    1400: 3,
    1100: 2,
    700: 1
  };

  return (
    <div className="flex flex-col h-full relative">
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
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex w-auto -ml-3"
            columnClassName="pl-3 bg-clip-padding"
          >
            {images.map((image: ImageData) => (
              <div key={image.id} className="mb-3">
                {image.isLoading ? (
                  <div className="w-full aspect-square bg-neutral-800 animate-pulse rounded-sm" />
                ) : image.error ? (
                  <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center rounded-sm">
                    <p className="text-red-500 text-sm">{image.error}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleImageClick(image)}
                    className="relative group w-full outline-none transition-all"
                  >
                    {image.url ? (
                      <div className="relative w-full">
                        <div className="relative w-full">
                          {/* 低質量預覽圖 */}
                          <Image
                            src={getImageUrl(image.url)}
                            alt={image.title}
                            className={`w-full h-auto object-cover rounded-sm shadow-md blur-sm scale-110 ${
                              loadedImageIds.includes(image.id) ? 'hidden' : 'block'
                            }`}
                            width={1200}
                            height={800}
                            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
                            quality={1}
                            priority={!loadedImageIds.includes(image.id)}
                            style={{ height: 'auto' }}
                          />
                          {/* 高質量圖片 */}
                          <Image
                            src={getImageUrl(image.url)}
                            alt={image.title}
                            className={`w-full h-auto object-cover rounded-sm shadow-md transition-all duration-300 group-hover:scale-[1.02] ${
                              loadedImageIds.includes(image.id) ? 'block' : 'hidden'
                            }`}
                            width={1200}
                            height={800}
                            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
                            quality={90}
                            style={{ height: 'auto' }}
                            onLoadingComplete={() => {
                              setLoadedImageIds(prev => 
                                prev.includes(image.id) ? prev : [...prev, image.id]
                              );
                            }}
                          />
                        </div>
                        {/* Hover text */}
                        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black/40 backdrop-blur-sm px-3 py-2">
                            <div className="text-sm text-white/95 font-medium">
                              {image.title} | {image.social}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-square bg-gray-800 flex items-center justify-center rounded-sm">
                        <p className="text-gray-500 text-sm">No image URL</p>
                      </div>
                    )}
                  </button>
                )}
              </div>
            ))}
          </Masonry>
        </div>
      </div>
    </div>
  );
} 