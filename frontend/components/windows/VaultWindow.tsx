'use client';

import * as Tabs from '@radix-ui/react-tabs';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { useSeriesImages } from '@/components/features/gallery/hooks/useSeriesImages';
import type { WindowName } from '@/types';

interface BrowseWindowProps {
  name: WindowName;
}

interface Atelier {
  id: string;
  photoBlobId: string;
  title: string;
  author: string;
  price: string;
  isLoading: boolean;
  error: string | null;
}

const ImageItem: React.FC<{ atelier: Atelier }> = ({ atelier }) => {
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
      className="relative group w-full outline-none transition-all"
      onClick={() => console.log('handleImageClick atelier: ', atelier)}
      disabled={!atelier.photoBlobId}
      ref={ref}
    >
      <div className="relative w-full">
        <div className="absolute inset-0 bg-neutral-800/50 animate-pulse rounded-sm z-0" />
        {inView && (
          <Image
            src={`/api/image-proxy?blobId=${atelier.photoBlobId}`}
            alt={atelier.title}
            width={1200}
            height={800}
            quality={90}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/2wCEAAEBAQEBAQEBAQEBAQECAgICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAALCAA4ADgBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z"
            onLoad={() => setLoaded(true)}
            className={`w-full h-auto object-cover rounded-sm shadow-md opacity-0 transition-opacity duration-500 group-hover:scale-[1.02] ${
              loaded ? 'opacity-100' : ''
            }`}
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
          />
        )}
      </div>
    </button>
  );
};

export default function BrowseWindow({}: BrowseWindowProps) {
  const { images = [], isLoading = false, error = null } = useSeriesImages();

  const breakpointColumns = { default: 4, 1400: 3, 1100: 2, 700: 1 };

  return (
    <Tabs.Root defaultValue="gallery" className="flex flex-col h-full">
      <Tabs.List className="flex space-x-4 border-b border-neutral-700 p-2">
        <Tabs.Trigger
          value="gallery"
          className="text-white px-4 py-2 rounded hover:bg-neutral-800 data-[state=active]:bg-neutral-700"
        >
          圖片
        </Tabs.Trigger>
        <Tabs.Trigger
          value="second"
          className="text-white px-4 py-2 rounded hover:bg-neutral-800 data-[state=active]:bg-neutral-700"
        >
          列表
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="gallery" className="flex-1 overflow-y-auto">
        <div className="p-4">
          {isLoading && !images.length ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error && !images.length ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <p className="text-red-500">{error}</p>
            </div>
          ) : !images.length ? (
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
              {images.map((atelier) => (
                <div key={atelier.id} className="mb-3">
                  <ImageItem atelier={atelier} />
                </div>
              ))}
            </Masonry>
          )}
        </div>
      </Tabs.Content>

      <Tabs.Content value="second" className="p-4 text-white">
        <p>列表資訊</p>
      </Tabs.Content>
    </Tabs.Root>
  );
}