'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SculptItem, KioskInfo } from '../hooks/useUserItems';
import { formatAddress, formatSuiAmount } from '@/utils/formatters';
import { SculptPrintButton } from './SculptPrintButton';
import { useSculptMarketplace } from '../hooks/useSculptMarketplace';
import { useSculptListedStatus } from '../hooks/useSculptListedStatus';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroInput } from '@/components/common/RetroInput';
import { RetroDetailModal, DetailHeader, InfoField } from '@/components/common/RetroDetailModal';
import { MarketplaceStatusNotification } from './MarketplaceStatusNotification';

const GLBViewer = dynamic(() => import('@/components/3d/GLBViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

interface SculptDetailModalProps {
  sculpt: SculptItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  selectedPrinter?: string;
  kioskInfo: KioskInfo | null;
}

export function SculptDetailModal({ sculpt, isOpen, onClose, onUpdate, selectedPrinter, kioskInfo }: SculptDetailModalProps) {
  const [listPrice, setListPrice] = useState('');
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastAction, setLastAction] = useState<'list' | 'delist' | null>(null);
  const { listSculpt, delistSculpt, status: marketplaceStatus, error: marketplaceError, txDigest, resetStatus } = useSculptMarketplace();
  
  const stableKioskId = useMemo(() => sculpt.kioskId || kioskInfo?.kioskId || null, [sculpt.kioskId, kioskInfo?.kioskId]);
  
  const { isListed, price: listedPrice, isLoading: isLoadingListedStatus } = useSculptListedStatus(
    sculpt.id, 
    refreshKey,
    stableKioskId
  );

  useEffect(() => {
    if (isListed && listedPrice && !isLoadingListedStatus) {
      const priceInSui = (Number(listedPrice) / 1_000_000_000).toFixed(2);
      setListPrice(priceInSui);
    } else if (!isListed && !isLoadingListedStatus && marketplaceStatus !== 'success') {
      setListPrice('');
    }
  }, [isListed, listedPrice, isLoadingListedStatus, marketplaceStatus]);

  useEffect(() => {
    if (!isOpen) {
      resetStatus();
      setLastAction(null);
      if (!isListed) {
        setListPrice('');
      }
    }
  }, [isOpen, resetStatus, isListed]);

  const onUpdateRef = useRef(onUpdate);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  
  const hasHandledSuccessRef = useRef(false);
  const successTimeoutsRef = useRef<{update: NodeJS.Timeout | null; refresh: NodeJS.Timeout | null}>({update: null, refresh: null});
  
  useEffect(() => {
    if (marketplaceStatus === 'success' && !hasHandledSuccessRef.current) {
      hasHandledSuccessRef.current = true;
      
      if (successTimeoutsRef.current.update) clearTimeout(successTimeoutsRef.current.update);
      if (successTimeoutsRef.current.refresh) clearTimeout(successTimeoutsRef.current.refresh);
      
      successTimeoutsRef.current.update = setTimeout(() => {
        onUpdateRef.current();
      }, 1000);
      
      successTimeoutsRef.current.refresh = setTimeout(() => {
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
          hasHandledSuccessRef.current = false;
        }, 500);
      }, 2000);
      
      return () => {
        if (successTimeoutsRef.current.update) clearTimeout(successTimeoutsRef.current.update);
        if (successTimeoutsRef.current.refresh) clearTimeout(successTimeoutsRef.current.refresh);
      };
    }
    
    if (marketplaceStatus !== 'success') {
      hasHandledSuccessRef.current = false;
    }
  }, [marketplaceStatus]);

  const handleList = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const effectiveKioskId = sculpt.kioskId || kioskInfo?.kioskId;
    const effectiveKioskCapId = sculpt.kioskCapId || kioskInfo?.kioskCapId;

    if (!effectiveKioskId || !effectiveKioskCapId) {
      alert('Kiosk information not available. Please ensure you have a Kiosk.');
      return;
    }

    setLastAction('list');
    const priceInMist = Math.floor(parseFloat(listPrice) * 1_000_000_000);

    await listSculpt(
      sculpt.id,
      effectiveKioskId,
      effectiveKioskCapId,
      priceInMist,
      () => {
        onUpdate();
        setRefreshKey(prev => prev + 1);
      }
    );
  };

  const handleDelist = async () => {
    const effectiveKioskId = sculpt.kioskId || kioskInfo?.kioskId;
    const effectiveKioskCapId = sculpt.kioskCapId || kioskInfo?.kioskCapId;

    if (!effectiveKioskId || !effectiveKioskCapId) {
      alert('Kiosk information not available. Please ensure you have a Kiosk.');
      return;
    }

    setLastAction('delist');
    await delistSculpt(
      sculpt.id,
      effectiveKioskId,
      effectiveKioskCapId,
      () => {
        onUpdate();
        setRefreshKey(prev => prev + 1);
      }
    );
  };

  return (
    <RetroDetailModal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-start">
        <RetroPanel variant="inset" className="w-full">
          <div className="aspect-square bg-[#000000] overflow-hidden relative">
            {show3DPreview ? (
              sculpt.glbFile ? (
                <GLBViewer blobId={sculpt.glbFile} className="w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                  <div className="text-center">
                    <svg className="w-12 h-12 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-white/50 text-sm font-mono">3D MODEL NOT AVAILABLE</p>
                    <p className="text-white/30 text-xs font-mono mt-2">This sculpt has no GLB file data</p>
                  </div>
                </div>
              )
            ) : (
              <img
                src={`/api/image-proxy?blobId=${sculpt.photoBlobId}`}
                alt={sculpt.alias}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-3 right-3">
              <RetroButton
                variant="primary"
                size="sm"
                onClick={() => setShow3DPreview(!show3DPreview)}
                disabled={!sculpt.glbFile && show3DPreview}
              >
                {show3DPreview ? '2D' : '3D'}
              </RetroButton>
            </div>
          </div>
        </RetroPanel>
      </div>

      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <DetailHeader
          title={sculpt.alias.toUpperCase()}
          subtitle="SCULPT DETAILS"
          onClose={onClose}
        />

        <div className="grid grid-cols-2 gap-2">
          <RetroPanel variant="inset" className="p-2">
            <p className="text-white/50 text-sm font-mono tracking-wide mb-1">CREATOR</p>
            <p className="text-white/90 text-sm font-mono">{formatAddress(sculpt.creator)}</p>
          </RetroPanel>
          <RetroPanel variant="inset" className="p-2">
            <p className="text-white/50 text-sm font-mono tracking-wide mb-1">CREATED</p>
            <p className="text-white/90 text-sm font-mono">{sculpt.time}</p>
          </RetroPanel>
        </div>

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">KIOSK</h4>
          {sculpt.kioskId ? (
            <div className="space-y-1">
              <p className="text-white/70 text-xs font-mono break-all">{sculpt.kioskId}</p>
              <p className="text-white/40 text-[10px] font-mono">ⓘ Sculpt is stored in this Kiosk</p>
            </div>
          ) : (
            <p className="text-white/50 text-xs font-mono">No Kiosk assigned</p>
          )}
        </RetroPanel>

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">PRINT SCULPT</h4>
          <SculptPrintButton
            sculptId={sculpt.id}
            printerId={selectedPrinter}
            onSuccess={() => {
              onUpdate();
              onClose();
            }}
            onError={(error) => alert(`Print failed: ${error}`)}
            onStatusChange={() => {}}
          />
          {!selectedPrinter && (
            <p className="text-white/40 text-xs font-mono mt-2">
              ⓘ Select a printer from Vault
            </p>
          )}
        </RetroPanel>

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">MARKETPLACE</h4>
          {!kioskInfo ? (
            <p className="text-white/50 text-xs font-mono">ⓘ Kiosk not found. Please create a Kiosk first.</p>
          ) : isLoadingListedStatus ? (
            <p className="text-white/50 text-xs font-mono">Loading listing status...</p>
          ) : (
            <>
              <div className="flex gap-2 mb-1">
                <RetroInput
                  type="number"
                  placeholder="Price in SUI"
                  value={listPrice}
                  onChange={(e) => !isListed && setListPrice(e.target.value)}
                  className="flex-1"
                  step="0.01"
                  min="0"
                  disabled={marketplaceStatus === 'processing' || isListed}
                />
                <RetroButton
                  variant="primary"
                  size="sm"
                  onClick={isListed ? handleDelist : handleList}
                  disabled={marketplaceStatus === 'processing' || (!isListed && (!listPrice || parseFloat(listPrice) <= 0))}
                  isLoading={marketplaceStatus === 'processing'}
                >
                  {marketplaceStatus === 'processing' 
                    ? (isListed ? 'Delisting...' : 'Listing...') 
                    : (isListed ? 'Delist' : 'List')}
                </RetroButton>
              </div>
              <p className="text-white/40 text-xs font-mono mt-1">
                ⓘ {isListed ? `Currently listed at ${formatSuiAmount(listedPrice || '0')} SUI` : 'List for sale on marketplace'}
              </p>
            </>
          )}
        </RetroPanel>

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">DETAILS</h4>
          <div className="space-y-1">
            <InfoField
              label="SCULPT ID"
              value={`${sculpt.id.slice(0, 8)}...${sculpt.id.slice(-6)}`}
            />
            <InfoField
              label="GLB FILE"
              value={sculpt.glbFile ? `${sculpt.glbFile.slice(0, 15)}...` : 'N/A'}
            />
            {sculpt.structure && (
              <InfoField
                label="STL FILE"
                value={`${sculpt.structure.slice(0, 15)}... 🔐`}
                isLast
              />
            )}
          </div>
        </RetroPanel>
      </div>

      <MarketplaceStatusNotification
        status={marketplaceStatus}
        error={marketplaceError}
        txDigest={txDigest}
        action={lastAction}
      />
    </RetroDetailModal>
  );
}
