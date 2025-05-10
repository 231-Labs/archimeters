'use client';

import * as Tabs from '@radix-ui/react-tabs';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import { useState } from 'react';
import { useUserAteliers } from '@/components/features/vault/hooks/useUserAteliers';
import type { WindowName } from '@/types';
import { AtelierWithdrawButton } from '@/components/features/vault/components/AtelierWithdrawButton';

const SUI_MIST = 1000000000;

interface VaultWindowProps {
  name: WindowName;
}

interface Atelier {
  id: string;
  photoBlobId: string;
  title: string;
  author: string;
  price: string;
  pool: string;
  publish_time: string;
  isLoading: boolean;
  error: string | null;
}

const ImageItem: React.FC<{ atelier: Atelier; reload: () => void }> = ({ atelier, reload }) => {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '100px' });
  const [loaded, setLoaded] = useState(false);

  if (atelier.isLoading) {
    return <div className="w-full aspect-square bg-neutral-800/50 rounded-sm" />;
  }

  if (atelier.error) {
    return (
      <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center rounded-sm">
        <p className="text-red-500 text-sm">{atelier.error}</p>
      </div>
    );
  }

  return (
    <div
      className="relative group w-full outline-none transition-all"
      onClick={() => console.log('handleImageClick atelier: ', atelier)}
      ref={ref}
      tabIndex={0}
      role="button"
    >
      <div className="relative w-full">
        <div className="absolute inset-0 bg-neutral-800/50 rounded-sm z-0" />
        {inView && (
          <Image
            src={`/api/image-proxy?blobId=${atelier.photoBlobId}`}
            alt={atelier.title}
            width={1200}
            height={800}
            quality={90}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/2wCEAAEBAQEBAQEBAQEBAQECAgICAgICAgICAgMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAALCAA4ADgBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAQP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwDH4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/Z"
            onLoad={() => setLoaded(true)}
            className={`w-full h-auto object-cover rounded-sm shadow-md opacity-0 transition-opacity duration-500 group-hover:scale-[1.02] ${
              loaded ? 'opacity-100' : ''
            }`}
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, (max-width: 1400px) 33vw, 25vw"
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <AtelierWithdrawButton
            atelierId={atelier.id}
            poolAmount={Number(atelier.pool)}
            onSuccess={() => {
              console.log('Withdrawal successful');
              setTimeout(() => {
                reload();
              }, 2000);
            }}
            onError={(error) => {
              console.error('Withdrawal failed:', error);
            }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end">
          <div className="bg-black/40 backdrop-blur-sm px-3 py-2">
            <div className="flex flex-col text-xs text-white/90">
              <span className="font-semibold">{atelier.title}</span>
              <span>Fee Pool: {Number(atelier.pool) / SUI_MIST} SUI</span>
              <span>Published: {atelier.publish_time}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function VaultWindow({}: VaultWindowProps) {
  const { ateliers, isLoading, error, reload } = useUserAteliers();

  const breakpointColumns = { default: 4, 1400: 3, 1100: 2, 700: 1 };

  return (
    <Tabs.Root defaultValue="gallery" className="flex flex-col h-full">
      <Tabs.List className="flex space-x-4 border-b border-neutral-700 p-2">
        <Tabs.Trigger
          value="gallery"
          className="text-white px-4 py-2 rounded hover:bg-neutral-800 data-[state=active]:bg-neutral-700"
        >
          My Ateliers
        </Tabs.Trigger>
        <Tabs.Trigger
          value="second"
          className="text-white px-4 py-2 rounded hover:bg-neutral-800 data-[state=active]:bg-neutral-700"
        >
          My Sculpts
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="gallery" className="flex-1 overflow-y-auto">
        <div className="p-4">
          {isLoading && !ateliers.length ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-white/80">
              <p className="text-lg mb-2">{error}</p>
            </div>
          ) : !ateliers.length ? (
            <div className="flex flex-col items-center justify-center h-full text-white/80">
              <p className="text-lg mb-2">No Atelier Found</p>
              <p className="text-sm">Create your first Atelier to get started!</p>
            </div>
          ) : (
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex w-auto -ml-3"
              columnClassName="pl-3 bg-clip-padding"
            >
              {ateliers.map((atelier) => (
                <div key={atelier.id} className="mb-3">
                  <ImageItem atelier={atelier} reload={reload} />
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