'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { SculptItem, KioskInfo } from '../hooks/useUserItems';
import { formatAddress, formatSuiAmount } from '@/utils/formatters';
import { SculptPrintButton } from './SculptPrintButton';
import { useSculptMarketplace } from '../hooks/useSculptMarketplace';
import { useSculptListedStatus } from '../hooks/useSculptListedStatus';
import { usePrinters } from '../hooks/usePrinters';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroInput } from '@/components/common/RetroInput';
import { RetroDetailModal, DetailHeader, InfoField } from '@/components/common/RetroDetailModal';
import { RetroPrinterCard } from '@/components/common/RetroPrinterCard';
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
  kioskInfo: KioskInfo | null;
}

export function SculptDetailModal({ sculpt, isOpen, onClose, onUpdate, kioskInfo }: SculptDetailModalProps) {
  const [listPrice, setListPrice] = useState('');
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastAction, setLastAction] = useState<'list' | 'delist' | 'print' | null>(null);
  const [selectedPrinter, setSelectedPrinter] = useState<string | null>(null);
  const [showPrinters, setShowPrinters] = useState(false);
  const [printStatus, setPrintStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [printError, setPrintError] = useState<string | null>(null);
  const [printTxDigest, setPrintTxDigest] = useState<string | null>(null);
  
  const { listSculpt, delistSculpt, status: marketplaceStatus, error: marketplaceError, txDigest, resetStatus } = useSculptMarketplace();
  const { printers, isLoading: isLoadingPrinters, error: errorPrinters, reload: reloadPrinters } = usePrinters();
  
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
      setSelectedPrinter(null);
      setShowPrinters(false);
      setPrintStatus('idle');
      setPrintError(null);
      setPrintTxDigest(null);
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
      <div className="flex flex-col items-start space-y-3">
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

        <RetroPanel variant="inset" className="p-2 w-full">
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
          
          {selectedPrinter && (
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-white/90 font-mono">
                {printers.find(p => p.id === selectedPrinter)?.alias || `${selectedPrinter.substring(0, 6)}...${selectedPrinter.slice(-6)}`}
              </span>
              <button
                onClick={() => {
                  setSelectedPrinter(null);
                  setShowPrinters(true);
                  reloadPrinters();
                }}
                className="text-[10px] text-white/40 hover:text-white/80 underline font-mono"
              >
                CHANGE
              </button>
            </div>
          )}

          {showPrinters && (
            <div className="mb-2 max-h-48 overflow-y-auto" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#2a2a2a #0a0a0a'
            }}>
              {isLoadingPrinters ? (
                <div className="p-4 text-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-white/50 font-mono">Loading printers...</p>
                </div>
              ) : errorPrinters ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-red-400 font-mono">{errorPrinters}</p>
                  <button 
                    onClick={reloadPrinters}
                    className="mt-2 text-xs text-white/40 hover:text-white/80 underline font-mono"
                  >
                    Retry
                  </button>
                </div>
              ) : printers.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-white/50 font-mono">No printers available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1.5">
                  {printers.map(printer => (
                    <RetroPrinterCard
                      key={printer.id}
                      printer={printer}
                      onSelect={() => {
                        if (printer.online) {
                          setSelectedPrinter(printer.id);
                          setShowPrinters(false);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {!selectedPrinter ? (
            <RetroButton
              variant="primary"
              size="md"
              onClick={() => {
                setShowPrinters(!showPrinters);
                if (!showPrinters) {
                  reloadPrinters();
                }
              }}
            >
              {showPrinters ? 'Cancel' : 'Select Printer'}
            </RetroButton>
          ) : (
            <SculptPrintButton
              sculptId={sculpt.id}
              printerId={selectedPrinter}
              kioskId={sculpt.kioskId || kioskInfo?.kioskId}
              kioskCapId={sculpt.kioskCapId || kioskInfo?.kioskCapId}
              onSuccess={() => {
                setTimeout(() => {
                  onUpdate();
                }, 2000);
              }}
              onError={(error) => {
                console.error('Print error:', error);
              }}
              onStatusChange={(status, message, digest) => {
                setLastAction('print');
                setPrintStatus(status);
                setPrintError(message || null);
                setPrintTxDigest(digest || null);
                
                if (status === 'success') {
                  setTimeout(() => {
                    setPrintStatus('idle');
                    setPrintError(null);
                    setPrintTxDigest(null);
                    setLastAction(null);
                  }, 3000);
                }
              }}
            />
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
      </div>

      {lastAction === 'print' ? (
        <MarketplaceStatusNotification
          status={printStatus}
          error={printError}
          txDigest={printTxDigest}
          action="print"
        />
      ) : (
        <MarketplaceStatusNotification
          status={marketplaceStatus}
          error={marketplaceError}
          txDigest={txDigest}
          action={lastAction}
        />
      )}
    </RetroDetailModal>
  );
}
