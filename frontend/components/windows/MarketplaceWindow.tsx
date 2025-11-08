'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import type { WindowName } from '@/types';
import Masonry from 'react-masonry-css';
import * as Tabs from '@radix-ui/react-tabs';
import { useMarketplaceData } from '@/components/features/marketplace/hooks/useMarketplaceData';
import { RetroTabsList, RetroTabsTrigger } from '@/components/common/RetroTabs';
import { AtelierMintModal } from '@/components/features/atelier-viewer/AtelierMintModal';
import { RetroEmptyState } from '@/components/common/RetroEmptyState';

interface MarketplaceWindowProps {
  name: WindowName;
  onOpenWindow: (name: WindowName) => void;
}

// Atelier type
interface Atelier {
  id: string;
  photoBlobId: string;
  algorithmBlobId: string;
  dataBlobId: string;
  poolId: string;
  url: string | null;
  algorithmContent: string | null;
  configData: any | null;
  title: string;
  author: string;
  price: string;
  isLoading: boolean;
  error: string | null;
}

// Sculpt type
interface Sculpt {
  id: string;
  atelierId: string;
  stlBlobId: string;
  glbBlobId: string;
  creator: string;
  paramKeys: string[];
  paramValues: string[];
  price: string;
  kioskId: string;
  glbUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

// Image cache Map
const imageCache = new Map<string, string>();

export default function MarketplaceWindow({
  onOpenWindow,
}: MarketplaceWindowProps) {
  const result = useMarketplaceData();
  const ateliers = result?.ateliers || [];
  const sculpts = result?.sculpts || [];
  const isLoading = result?.isLoading || false;
  const error = result?.error || null;
  const [loadedImageIds, setLoadedImageIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ateliers');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  
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
    ateliers.forEach(atelier => {
      if (atelier.url) {
        preloadAndCacheImage(atelier.url);
      }
    });
  }, [ateliers, preloadAndCacheImage]);

  const getImageUrl = useCallback((url: string) => {
    return imageCache.get(url) || url;
  }, []);

  const handleImageClick = (atelier: Atelier) => {
    console.log('Atelier clicked:', atelier);
    setSelectedAtelier(atelier);
  };

  const handleCloseModal = () => {
    setSelectedAtelier(null);
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
    <>
      <Tabs.Root 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex flex-col h-full bg-[#1a1a1a]"
      >
      {/* Loading overlay */}
      {isLoading && ateliers.length === 0 && sculpts.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {/* Error message */}
      {error && ateliers.length === 0 && sculpts.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Header with Tabs and View Mode Toggle */}
      <div 
        className="flex items-center justify-between bg-[#0f0f0f] px-2"
        style={{
          borderBottom: '2px solid #0a0a0a',
          boxShadow: 'inset 0 -1px 2px rgba(0, 0, 0, 0.5)',
        }}
      >
        <RetroTabsList className="flex-1">
          <RetroTabsTrigger value="ateliers">Ateliers</RetroTabsTrigger>
          <RetroTabsTrigger value="sculpts">Sculpts</RetroTabsTrigger>
        </RetroTabsList>

        {/* View Mode Toggle */}
        <div className="flex gap-1 p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-white/10 text-white/90'
                : 'text-white/40 hover:text-white/70'
            }`}
            title="Grid View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-white/10 text-white/90'
                : 'text-white/40 hover:text-white/70'
            }`}
            title="List View"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <Tabs.Content value="ateliers" className="flex-1 overflow-y-auto bg-[#1a1a1a]">
        <div className="p-4">
          {ateliers.length === 0 && !isLoading ? (
            <RetroEmptyState 
              title="NO ATELIERS FOUND"
              message="Be the first one to create an Atelier!"
              icon="box"
            />
          ) : viewMode === 'grid' ? (
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex w-auto -ml-3"
              columnClassName="pl-3 bg-clip-padding"
            >
              {ateliers.map((atelier: Atelier) => (
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
            ) : (
              /* List View */
              <div className="space-y-2">
                {ateliers.map((atelier: Atelier) => (
                  <div
                    key={atelier.id}
                    onClick={() => handleImageClick(atelier)}
                    className="flex items-center gap-4 p-3 bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-white/5 rounded cursor-pointer transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-16 flex-shrink-0 bg-neutral-800 rounded overflow-hidden">
                      {atelier.url ? (
                        <Image
                          src={getImageUrl(atelier.url)}
                          alt={atelier.title}
                          width={96}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-800/50 animate-pulse" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white/90 text-sm font-medium font-mono truncate">{atelier.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-white/60 font-mono">
                        <span>AUTHOR: @{atelier.author?.slice(0, 8)}</span>
                        <span>PRICE: {scaleSuiPrice(atelier.price)} SUI</span>
                      </div>
                    </div>

                    {/* Action Icon */}
                    <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs.Content>

        <Tabs.Content value="sculpts" className="flex-1 overflow-y-auto bg-[#1a1a1a]">
          <div className="p-4">
            {sculpts.length === 0 && !isLoading ? (
              <RetroEmptyState 
                title="NO LISTED SCULPTS"
                message="Check back later for new listings!"
                icon="image"
              />
            ) : viewMode === 'grid' ? (
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex w-auto -ml-3"
                columnClassName="pl-3 bg-clip-padding"
              >
                {sculpts.map((sculpt: Sculpt) => (
                    <div key={sculpt.id} className="mb-3">
                      {sculpt.isLoading ? (
                        <div className="w-full aspect-square bg-neutral-800/50 animate-pulse rounded-sm" />
                      ) : sculpt.error ? (
                        <div className="w-full aspect-square bg-red-900/20 flex items-center justify-center rounded-sm">
                          <p className="text-red-500 text-sm">{sculpt.error}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => console.log('Sculpt clicked:', sculpt)}
                          className="relative group w-full outline-none transition-all"
                        >
                          {sculpt.glbUrl ? (
                            <div className="relative w-full">
                              <div className="w-full aspect-square bg-neutral-800/50 rounded-sm flex items-center justify-center">
                                <p className="text-white/60 text-xs font-mono">3D Model</p>
                              </div>
                              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-black/40 backdrop-blur-sm px-3 py-2">
                                  <div className="text-sm text-white/95 font-medium">
                                    Sculpt #{sculpt.id.slice(0, 8)}
                                  </div>
                                  <div className="flex gap-1 justify-center items-center text-xs text-white/70">
                                    <svg width="10" height="12" viewBox="0 0 300 384" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path fillRule="evenodd" clipRule="evenodd" d="M240.057 159.914C255.698 179.553 265.052 204.39 265.052 231.407C265.052 258.424 255.414 284.019 239.362 303.768L237.971 305.475L237.608 303.31C237.292 301.477 236.929 299.613 236.502 297.749C228.46 262.421 202.265 232.134 159.148 207.597C130.029 191.071 113.361 171.195 108.985 148.586C106.157 133.972 108.258 119.294 112.318 106.717C116.379 94.1569 122.414 83.6187 127.549 77.2831L144.328 56.7754C147.267 53.1731 152.781 53.1731 155.719 56.7754L240.073 159.914H240.057ZM266.584 139.422L154.155 1.96703C152.007 -0.655678 147.993 -0.655678 145.845 1.96703L33.4316 139.422L33.0683 139.881C12.3868 165.555 0 198.181 0 233.698C0 316.408 67.1635 383.461 150 383.461C232.837 383.461 300 316.408 300 233.698C300 198.181 287.613 165.555 266.932 139.896L266.568 139.438L266.584 139.422ZM60.3381 159.472L70.3866 147.164L70.6868 149.439C70.9237 151.24 71.2239 153.041 71.5715 154.858C78.0809 189.001 101.322 217.456 140.173 239.496C173.952 258.724 193.622 280.828 199.278 305.064C201.648 315.176 202.059 325.129 201.032 333.835L200.969 334.372L200.479 334.609C185.233 342.05 168.09 346.237 149.984 346.237C86.4546 346.237 34.9484 294.826 34.9484 231.391C34.9484 204.153 44.4439 179.142 60.3065 159.44L60.3381 159.472Z" fill="white"/>
                                    </svg>
                                    {scaleSuiPrice(sculpt.price)}
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
            ) : (
              /* List View */
              <div className="space-y-2">
                {sculpts.map((sculpt: Sculpt) => (
                  <div
                    key={sculpt.id}
                    onClick={() => console.log('Sculpt clicked:', sculpt)}
                    className="flex items-center gap-4 p-3 bg-[#0f0f0f] hover:bg-[#1a1a1a] border border-white/5 rounded cursor-pointer transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 h-16 flex-shrink-0 bg-neutral-800 rounded overflow-hidden flex items-center justify-center">
                      <p className="text-white/60 text-xs font-mono">3D MODEL</p>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white/90 text-sm font-medium font-mono truncate">
                        Sculpt #{sculpt.id.slice(0, 8)}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-xs text-white/60 font-mono">
                        <span>CREATOR: @{sculpt.creator?.slice(0, 8)}</span>
                        <span>PRICE: {scaleSuiPrice(sculpt.price)} SUI</span>
                      </div>
                    </div>

                    {/* Action Icon */}
                    <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {/* Atelier Mint Modal */}
      {selectedAtelier && (
        <AtelierMintModal
          atelier={selectedAtelier}
          isOpen={!!selectedAtelier}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}

