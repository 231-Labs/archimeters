'use client';

import { useState } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { useSeriesImages } from '@/components/features/gallery/hooks/useSeriesImages';
import type { WindowName } from '@/types';

interface BrowseWindowProps {
  name: WindowName;
}

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

export default function BrowseWindow({}: BrowseWindowProps) {
  const { images = [], isLoading = false, error = null } = useSeriesImages();
  const [loadedImageIds, setLoadedImageIds] = useState<string[]>([]);

  const breakpointColumns = { default: 4, 1400: 3, 1100: 2, 700: 1 };

  // 單張圖片渲染邏輯，使用 Next.js Image 的 placeholder="blur"
  const renderImage = (atelier: Atelier) => {
    const { id, url, title, author, error, isLoading, price } = atelier;

    if (isLoading)
      return <div className="w-full aspect-square bg-neutral-800/50 animate-pulse rounded-sm" />;

    if (error)
      return (
        <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center rounded-sm">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      );

    return (
      <button
        className="relative group w-full outline-none transition-all"
        onClick={() => console.log('handleImageClick atelier: ', atelier)}
        disabled={!url}
      >
        {url && (
          <div className="relative w-full">
            <Image
              src={url}
              alt={title}
              width={1200}
              height={800}
              quality={90}
              placeholder="blur"
              blurDataURL="/blur-placeholder.jpg" // 預設模糊圖，可替換
              className="w-full h-auto object-cover rounded-sm shadow-md transition-all duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
            />
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* 載入中畫面 */}
      {isLoading && !images.length && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 錯誤提示畫面 */}
      {error && !images.length && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* 主內容區域 */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-4">
          {!images.length && !isLoading ? (
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
              {images.map(atelier => (
                <div key={atelier.id} className="mb-3">
                  {renderImage(atelier)}
                </div>
              ))}
            </Masonry>
          )}
        </div>
      </div>
    </div>
  );
}
