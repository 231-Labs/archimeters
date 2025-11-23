'use client';

import { useEffect, useState, useCallback } from 'react';
import type { WindowName } from '@/components/features/window-manager';
import Masonry from 'react-masonry-css';
import * as Tabs from '@radix-ui/react-tabs';
import { useMarketplaceData } from '@/components/features/marketplace/hooks/useMarketplaceData';
import { RetroTabsList, RetroTabsTrigger } from '@/components/common/RetroTabs';
import { AtelierMintModal } from '@/components/features/atelier-viewer/AtelierMintModal';
import { MarketplaceSculptDetailModal } from '@/components/features/marketplace/components/MarketplaceSculptDetailModal';
import { RetroEmptyState } from '@/components/common/RetroEmptyState';
import { RetroListItem, RetroListThumbnail, RetroListInfo, RetroListArrow } from '@/components/common/RetroListItem';
import { RetroImageItem } from '@/components/common/RetroImageItem';
import { SuiLogo } from '@/components/common/SuiLogo';
import { formatSuiPrice } from '@/utils/formatters';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';
import type { Atelier, Sculpt, KioskInfo } from '@/components/features/marketplace/types';

interface MarketplaceWindowProps {
  name: WindowName;
  onOpenWindow: (name: WindowName) => void;
}

const imageCache = new Map<string, string>();

const breakpointColumns = {
  default: 4,
  1400: 3,
  1100: 2,
  700: 1
};

export default function MarketplaceWindow({
  onOpenWindow,
}: MarketplaceWindowProps) {
  const result = useMarketplaceData();
  const ateliers = result?.ateliers || [];
  const sculpts = result?.sculpts || [];
  const isLoading = result?.isLoading || false;
  const error = result?.error || null;
  const [activeTab, setActiveTab] = useState<string>('ateliers');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAtelier, setSelectedAtelier] = useState<Atelier | null>(null);
  const [selectedSculpt, setSelectedSculpt] = useState<Sculpt | null>(null);
  const [targetKioskInfo, setTargetKioskInfo] = useState<KioskInfo | null>(null);
  
  useEffect(() => {
    const loadKioskInfo = () => {
      const kioskId = sessionStorage.getItem('kiosk-id');
      const kioskCapId = sessionStorage.getItem('kiosk-cap-id');
      
      if (kioskId && kioskCapId) {
        setTargetKioskInfo({ kioskId, kioskCapId });
      } else {
        setTargetKioskInfo(null);
      }
    };

    loadKioskInfo();

    const handleKioskChange = () => {
      loadKioskInfo();
    };

    window.addEventListener('kiosk-selected', handleKioskChange);

    return () => {
      window.removeEventListener('kiosk-selected', handleKioskChange);
    };
  }, []);
  
  const preloadAndCacheImage = useCallback(async (url: string): Promise<void> => {
    if (!url || imageCache.has(url)) return;

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
      // Silently fail
    }
  }, []);

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
    setSelectedAtelier(atelier);
  };

  const handlePurchaseSuccess = () => {
    if (result?.refetch) {
      result.refetch();
    }
  };

  const isAtelierLoaded = (atelier: Atelier) => {
    return !atelier.isLoading && !atelier.error && atelier.url !== null;
  };

  return (
    <div className="relative h-full overflow-hidden">
      <Tabs.Root 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="flex flex-col h-full bg-[#1a1a1a]"
      >
      {isLoading && ateliers.length === 0 && sculpts.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {error && ateliers.length === 0 && sculpts.length === 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <p className="text-red-500">{error}</p>
        </div>
      )}

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
              {ateliers.map((atelier: Atelier) => {
                const infoContent = (
                  <>
                    <div className="text-sm text-white/95 font-medium">
                      {atelier.title} | @{atelier.author?.slice(0, 8)}
                    </div>
                    <div className="flex gap-1 justify-center items-center text-xs text-white/70">
                      <SuiLogo />
                      {formatSuiPrice(atelier.price)}
                    </div>
                  </>
                );

                return (
                  <div key={atelier.id} className="mb-3">
                    <RetroImageItem
                      imageSrc={atelier.url || ''}
                      alt={atelier.title}
                      onClick={() => handleImageClick(atelier)}
                      isLoading={atelier.isLoading}
                      error={atelier.error}
                      infoContent={infoContent}
                      infoOnHover={true}
                      lazyLoad={true}
                      getImageUrl={getImageUrl}
                      disabled={!isAtelierLoaded(atelier)}
                    />
                  </div>
                );
              })}
              </Masonry>
            ) : (
              <div className="space-y-2">
                {ateliers.map((atelier: Atelier) => (
                  <RetroListItem
                    key={atelier.id}
                    onClick={() => handleImageClick(atelier)}
                  >
                    <RetroListThumbnail
                      src={atelier.url || undefined}
                      alt={atelier.title}
                      fallback={<div className="w-full h-full bg-[#0f0f0f] animate-pulse" />}
                    />
                    <RetroListInfo
                      title={atelier.title}
                      metadata={
                        <>
                          <span>AUTHOR: @{atelier.author?.slice(0, 8)}</span>
                          <span>PRICE: {formatSuiPrice(atelier.price)} SUI</span>
                        </>
                      }
                    />
                    <RetroListArrow />
                  </RetroListItem>
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
                {sculpts.map((sculpt: Sculpt) => {
                  const totalPrice = MARKETPLACE_CONFIG.calculateTotal(sculpt.price);
                  const infoContent = (
                    <div className="flex flex-col text-xs text-white/90">
                      <span className="font-semibold">Sculpt #{sculpt.id.slice(0, 8)}</span>
                      <span>Creator: {sculpt.creator.substring(0, 6)}...{sculpt.creator.slice(-4)}</span>
                      <span className="flex gap-1 items-center justify-center mt-1">
                        <SuiLogo width={8} height={10} />
                        {formatSuiPrice(totalPrice)} SUI
                      </span>
                    </div>
                  );
                  
                  return (
                    <div key={sculpt.id} className="mb-3">
                      <RetroImageItem
                        imageSrc={sculpt.photoBlobId}
                        alt={`Sculpt #${sculpt.id.slice(0, 8)}`}
                        onClick={() => setSelectedSculpt(sculpt)}
                        infoContent={infoContent}
                        infoOnHover={true}
                      />
                    </div>
                  );
                })}
              </Masonry>
            ) : (
              <div className="space-y-2">
                {sculpts.map((sculpt: Sculpt) => {
                  const totalPrice = MARKETPLACE_CONFIG.calculateTotal(sculpt.price);
                  return (
                    <RetroListItem
                      key={sculpt.id}
                      onClick={() => setSelectedSculpt(sculpt)}
                    >
                      <RetroListThumbnail
                        src={sculpt.photoBlobId ? `/api/image-proxy?blobId=${sculpt.photoBlobId}` : undefined}
                        alt={`Sculpt #${sculpt.id.slice(0, 8)}`}
                        fallback={
                          <div className="w-full h-full flex items-center justify-center bg-neutral-800/50">
                            <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider">IMAGE</p>
                          </div>
                        }
                      />
                      <RetroListInfo
                        title={`Sculpt #${sculpt.id.slice(0, 8)}`}
                        metadata={
                          <>
                            <span>CREATOR: {sculpt.creator.substring(0, 6)}...{sculpt.creator.slice(-4)}</span>
                            <span>PRICE: {formatSuiPrice(totalPrice)} SUI</span>
                          </>
                        }
                      />
                      <RetroListArrow />
                    </RetroListItem>
                  );
                })}
              </div>
            )}
          </div>
        </Tabs.Content>
      </Tabs.Root>

      {selectedAtelier && (
        <AtelierMintModal
          atelier={selectedAtelier}
          isOpen={!!selectedAtelier}
          onClose={() => setSelectedAtelier(null)}
          onOpenWindow={onOpenWindow}
        />
      )}

      {selectedSculpt && (
        <MarketplaceSculptDetailModal
          sculpt={selectedSculpt}
          isOpen={!!selectedSculpt}
          onClose={() => setSelectedSculpt(null)}
          onPurchaseSuccess={handlePurchaseSuccess}
          targetKioskInfo={targetKioskInfo}
        />
      )}
    </div>
  );
}
