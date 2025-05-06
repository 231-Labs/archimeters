'use client';

import * as Tabs from '@radix-ui/react-tabs';
import Masonry from 'react-masonry-css';
import { useUserAteliers } from '@/components/features/vault/hooks/useUserAteliers';
import { ImageItem } from '@/components/features/vault/components/ImageItem';
import type { WindowName } from '@/types';

interface BrowseWindowProps {
  name: WindowName;
}

export default function BrowseWindow({}: BrowseWindowProps) {
  const { images = [], isLoading = false, error = null } = useUserAteliers();

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
              <p className="text-sm">Create your first Atelier!</p>
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