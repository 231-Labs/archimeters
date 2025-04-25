'use client';

import { useEffect } from 'react';
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

// TODO: 添加模擬照片數據, 待刪除
const mockImages: ImageData[] = [
  {
    id: 'mock1',
    url: 'https://picsum.photos/800/1200',
    title: '直向照片',
    social: '@photographer1',
    isLoading: false,
    error: null
  },
  {
    id: 'mock2',
    url: 'https://picsum.photos/1200/800',
    title: '橫向照片',
    social: '@photographer2',
    isLoading: false,
    error: null
  },
  {
    id: 'mock3',
    url: 'https://picsum.photos/1000/1000',
    title: '方形照片',
    social: '@photographer3',
    isLoading: false,
    error: null
  },
  {
    id: 'mock4',
    url: 'https://picsum.photos/900/1600',
    title: '超長直向照片',
    social: '@photographer4',
    isLoading: false,
    error: null
  },
  {
    id: 'mock5',
    url: 'https://picsum.photos/1600/900',
    title: '超寬橫向照片',
    social: '@photographer5',
    isLoading: false,
    error: null
  },
  {
    id: 'mock6',
    url: 'https://picsum.photos/700/1400',
    title: '高瘦照片',
    social: '@photographer6',
    isLoading: false,
    error: null
  },
  {
    id: 'mock7',
    url: 'https://picsum.photos/1400/700',
    title: '寬扁照片',
    social: '@photographer7',
    isLoading: false,
    error: null
  },
  {
    id: 'mock8',
    url: 'https://picsum.photos/800/1500',
    title: '超高照片',
    social: '@photographer8',
    isLoading: false,
    error: null
  },
  {
    id: 'mock9',
    url: 'https://picsum.photos/1500/800',
    title: '超寬照片',
    social: '@photographer9',
    isLoading: false,
    error: null
  },
  {
    id: 'mock10',
    url: 'https://picsum.photos/600/900',
    title: '中等直向照片',
    social: '@photographer10',
    isLoading: false,
    error: null
  },
  {
    id: 'mock11',
    url: 'https://picsum.photos/900/600',
    title: '中等橫向照片',
    social: '@photographer11',
    isLoading: false,
    error: null
  },
  {
    id: 'mock12',
    url: 'https://picsum.photos/700/1100',
    title: '高直向照片',
    social: '@photographer12',
    isLoading: false,
    error: null
  }
];

export default function BrowseWindow({
  name,
}: BrowseWindowProps) {
  const result = useSeriesImages();
  // 確保即使沒有真實數據也會顯示模擬數據
  const realImages = result?.images || [];
  const allImages = [...realImages, ...mockImages]; // TODO: 待刪除
  const isLoading = result?.isLoading || false;
  const error = result?.error || null;

  const handleImageClick = (image: ImageData) => {
    // TODO: 實現圖片點擊功能
    console.log('Image clicked:', image);
  };

  // Masonry layout breakpoints
  const breakpointColumns = {
    default: 4,
    1400: 3,
    1100: 2,
    700: 1
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Loading overlay */}
      {isLoading && realImages.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <p className="text-white">Loading...</p>
        </div>
      )}
      
      {/* Error message */}
      {error && realImages.length === 0 && (
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
            {allImages.map((image: ImageData) => (
              <div key={image.id} className="mb-3">
                {image.isLoading ? (
                  <div className="w-full aspect-square bg-gray-800 animate-pulse rounded-sm" />
                ) : image.error ? (
                  <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center rounded-sm">
                    <p className="text-red-500 text-sm">{image.error}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => handleImageClick(image)}
                    className="relative group w-full outline-none transition-all"
                    style={{ display: 'block' }}
                  >
                    {image.url ? (
                      <>
                        <img
                          src={image.url}
                          alt={image.title}
                          className="w-full h-auto object-cover rounded-sm shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                          style={{ maxHeight: '80vh' }}
                          onError={(e) => {
                            console.error('Image failed to load:', image.url);
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                          onLoad={(e) => {
                            console.log('Image loaded successfully:', image.url);
                          }}
                        />
                      </>
                    ) : (
                      <div className="w-full aspect-square bg-gray-800 flex items-center justify-center rounded-sm">
                        <p className="text-gray-500 text-sm">No image URL</p>
                      </div>
                    )}
                    {/* Hover text */}
                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-black/40 backdrop-blur-sm px-3 py-2">
                        <div className="text-sm text-white/95 font-medium">
                          {image.title} | {image.social}
                        </div>
                      </div>
                    </div>
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