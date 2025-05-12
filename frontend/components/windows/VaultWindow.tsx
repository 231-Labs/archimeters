'use client';

import * as Tabs from '@radix-ui/react-tabs';
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import { useInView } from 'react-intersection-observer';
import { useState, useEffect } from 'react';
import { useUserItems } from '@/components/features/vault/hooks/useUserItems';
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
  const [activeTab, setActiveTab] = useState<'ateliers' | 'sculpts'>('ateliers');

  const {
    items: ateliers,
    isLoading: isLoadingAteliers,
    error: errorAteliers,
    reload: reloadAteliers,
  } = useUserItems('ateliers');

  const {
    items: sculpts,
    isLoading: isLoadingSculpts,
    error: errorSculpts,
    reload: reloadSculpts,
  } = useUserItems('sculptures');

  useEffect(() => {
    console.log('🔁 Active tab changed:', activeTab);
    if (activeTab === 'sculpts') {
      console.log('🟢 Tab switched to My Sculpts');
    }
  }, [activeTab]);

  const breakpointColumns = { default: 4, 1400: 3, 1100: 2, 700: 1 };

  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={(val) => setActiveTab(val as 'ateliers' | 'sculpts')}
      className="flex flex-col h-full"
    >
      <Tabs.List className="flex space-x-4 border-b border-neutral-700 p-2">
        <Tabs.Trigger
          value="ateliers"
          className="text-white px-4 py-2 rounded hover:bg-neutral-800 data-[state=active]:bg-neutral-700"
        >
          My Ateliers
        </Tabs.Trigger>
        <Tabs.Trigger
          value="sculpts"
          className="text-white px-4 py-2 rounded hover:bg-neutral-800 data-[state=active]:bg-neutral-700"
        >
          My Sculpts
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="ateliers" className="flex-1 overflow-y-auto">
        <div className="p-4">
          {isLoadingAteliers && !ateliers.length ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errorAteliers ? (
            <div className="flex flex-col items-center justify-center h-full text-white/80">
              <p className="text-lg mb-2">{errorAteliers}</p>
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
                  <ImageItem atelier={atelier} reload={reloadAteliers} />
                </div>
              ))}
            </Masonry>
          )}
        </div>
      </Tabs.Content>

      <Tabs.Content value="sculpts" className="flex-1 overflow-y-auto">
        <div className="p-4">
          {isLoadingSculpts && !sculpts.length ? (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : errorSculpts ? (
            <div className="flex flex-col items-center justify-center h-full text-white/80">
              <p className="text-lg mb-2">{errorSculpts}</p>
            </div>
          ) : !sculpts.length ? (
            <div className="flex flex-col items-center justify-center h-full text-white/80">
              <p className="text-lg mb-2">No Sculpts Found</p>
              <p className="text-sm">Create your first Sculpt to get started!</p>
            </div>
          ) : (
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex w-auto -ml-3"
              columnClassName="pl-3 bg-clip-padding"
            >
              {sculpts.map((sculpt) => (
                <div key={sculpt.id} className="mb-3">
                  <ImageItem atelier={sculpt} reload={reloadSculpts} />
                </div>
              ))}
            </Masonry>
          )}
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}