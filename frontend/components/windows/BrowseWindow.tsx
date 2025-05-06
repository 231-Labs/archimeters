'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import type { WindowName } from '@/types';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import { useSeriesImages } from '@/components/features/gallery/hooks/useSeriesImages';

interface BrowseWindowProps {
  name: WindowName;
  onOpenWindow: (name: WindowName) => void;
}

// 從 useSeriesImages 介面獲取 Atelier 類型
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

// 緩存圖片的 Map
const imageCache = new Map<string, string>();

const ImageItem: React.FC<{
  atelier: Atelier;
  onClick: () => void;
  imageUrl: string;
}> = ({ atelier, onClick, imageUrl }) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '100px' });
  const [loaded, setLoaded] = useState(false);

  if (atelier.isLoading) {
    return <div className="w-full aspect-square bg-neutral-800/50 animate-pulse rounded-sm" />;
  }

  if (atelier.error) {
    return (
      <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center rounded-sm">
        <p className="text-red-500 text-sm">{atelier.error}</p>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="relative group w-full outline-none transition-all"
      disabled={!atelier.url}
      ref={ref}
    >
      <div className="relative w-full">
        <div className="absolute inset-0 bg-neutral-800/50 animate-pulse rounded-sm z-0" />
        {inView && (
          <Image
            src={imageUrl}
            alt={atelier.title}
            width={1200}
            height={800}
            quality={90}
            className={`w-full h-auto object-cover rounded-sm shadow-md opacity-0 transition-opacity duration-500 group-hover:scale-[1.02] ${
              loaded ? 'opacity-100' : ''
            }`}
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
            onLoad={() => setLoaded(true)}
          />
        )}
      </div>
    </button>
  );
};

export default function BrowseWindow({ onOpenWindow }: BrowseWindowProps) {
  const result = useSeriesImages();
  const images = result?.images || [];
  const isLoading = result?.isLoading || false;
  const error = result?.error || null;
  // 預加載並緩存圖片
  const preloadAndCacheImage = useCallback(async (url: string): Promise<void> => {
    if (!url || imageCache.has(url)) return;
    try {
      const response = await fetch(url, {
        cache: 'force-cache',
        headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
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
      if (image.url) preloadAndCacheImage(image.url);
    });
  }, [images, preloadAndCacheImage]);

  const getImageUrl = useCallback((url: string) => {
    return imageCache.get(url) || url;
  }, []);

  const handleImageClick = (atelier: Atelier) => {
    console.log('Image clicked:', atelier);
    // 將圖片數據保存到 sessionStorage 中
    sessionStorage.setItem('selected-atelier', JSON.stringify(atelier));
    // 使用 props 傳入的 onOpenWindow
    onOpenWindow('atelier-viewer');
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
                  <ImageItem
                    atelier={atelier}
                    onClick={() => handleImageClick(atelier)}
                    imageUrl={getImageUrl(atelier.url || '')}
                  />
                </div>
              ))}
            </Masonry>
          )}
        </div>
      </div>
    </div>
  );
} 