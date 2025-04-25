'use client';

import { useEffect, useState } from 'react';
import type { WindowName } from '@/types';
import Masonry from 'react-masonry-css';

interface BrowseWindowProps {
  name: WindowName;
}

export default function BrowseWindow({
  name,
}: BrowseWindowProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Placeholder image data with different heights for masonry layout
  const placeholderImages = [
    { id: '1', url: 'https://picsum.photos/400/300?random=1', title: 'CryptoArtist#0042', height: 300, social: '@archimeters.lens' },
    { id: '2', url: 'https://picsum.photos/400/400?random=2', title: 'CryptoArtist#0043', height: 400, social: '@archimeters.lens' },
    { id: '3', url: 'https://picsum.photos/400/250?random=3', title: 'CryptoArtist#0044', height: 250, social: '@archimeters.lens' },
    { id: '4', url: 'https://picsum.photos/400/350?random=4', title: 'CryptoArtist#0045', height: 350, social: '@archimeters.lens' },
    { id: '5', url: 'https://picsum.photos/400/280?random=5', title: 'CryptoArtist#0046', height: 280, social: '@archimeters.lens' },
    { id: '6', url: 'https://picsum.photos/400/320?random=6', title: 'CryptoArtist#0047', height: 320, social: '@archimeters.lens' },
    { id: '7', url: 'https://picsum.photos/400/380?random=7', title: 'CryptoArtist#0048', height: 380, social: '@archimeters.lens' },
    { id: '8', url: 'https://picsum.photos/400/290?random=8', title: 'CryptoArtist#0049', height: 290, social: '@archimeters.lens' },
    { id: '9', url: 'https://picsum.photos/400/340?random=9', title: 'CryptoArtist#0050', height: 340, social: '@archimeters.lens' },
  ];

  const handleImageClick = (url: string) => {
    // TODO: Implement image click functionality
    console.log('Image clicked:', url);
  };

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Masonry layout breakpoints
  const breakpointColumns = {
    default: 3,
    1100: 2,
    700: 1
  };

  return (
    <div className="flex flex-col h-full">
      {/* Image area: scrollable */}
      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <p className="text-white">Loading...</p>
          </div>
        )}
        
        {error && (
          <div className="flex items-center justify-center h-full">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        <div className="p-4">
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex w-auto -ml-3"
            columnClassName="pl-3 bg-clip-padding"
          >
            {placeholderImages.map((image) => (
              <div key={image.id} className="mb-3">
                <button
                  onClick={() => handleImageClick(image.url)}
                  className="relative group w-full outline-none transition-all"
                  style={{ display: 'block' }}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full rounded-sm shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                    style={{ height: `${image.height}px` }}
                  />
                  {/* Hover text */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-sm">
                    <div className='flex flex-col space-y-2 bg-black/60 px-4 py-2 rounded-sm w-fit'>
                      <div className="text-sm text-white/90 font-mono">
                        {image.title} | {image.social}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
          </Masonry>
        </div>
      </div>
    </div>
  );
} 