'use client';

import { useState, useEffect } from 'react';
import { useMarketplacePurchase } from '../hooks/useMarketplacePurchase';
import { RetroDetailModal, DetailHeader, InfoField } from '@/components/common/RetroDetailModal';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroPanel } from '@/components/common/RetroPanel';
import { MIST_PER_SUI } from '@/utils/transactions';
import { MarketplaceStatusNotification } from '@/components/features/vault/components/MarketplaceStatusNotification';

interface MarketplaceSculpt {
  id: string;
  atelierId: string;
  blueprint: string;
  photoBlobId: string;
  creator: string;
  paramKeys: string[];
  paramValues: string[];
  price: string;
  kioskId: string;
}

interface KioskInfo {
  kioskId: string;
  kioskCapId: string;
}

interface MarketplaceSculptDetailModalProps {
  sculpt: MarketplaceSculpt;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
  targetKioskInfo: KioskInfo | null;
}

export function MarketplaceSculptDetailModal({ 
  sculpt, 
  isOpen, 
  onClose,
  onPurchaseSuccess,
  targetKioskInfo
}: MarketplaceSculptDetailModalProps) {
  const { purchaseSculpt, status, error, txDigest, resetStatus } = useMarketplacePurchase();

  // Handle purchase success
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        resetStatus();
        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
        onClose();
      }, 3000); // Wait 3 seconds for user to see the success notification
      return () => clearTimeout(timer);
    }
  }, [status, resetStatus, onPurchaseSuccess, onClose]);

  const handlePurchase = async () => {
    if (status === 'processing' || status === 'loading_kiosk') return;
    
    if (!targetKioskInfo) {
      alert('Please ensure you have a Kiosk to receive the purchased item.');
      return;
    }
    
    try {
      await purchaseSculpt(sculpt.id, sculpt.kioskId, sculpt.price, targetKioskInfo);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    if (status === 'processing' || status === 'loading_kiosk') return;
    resetStatus();
    onClose();
  };

  const formatSuiPrice = (priceInMist: string) => {
    const numPrice = parseInt(priceInMist);
    const scaled = numPrice / MIST_PER_SUI;
    return scaled.toFixed(9).replace(/\.?0+$/, '');
  };

  const formatAddress = (address: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  return (
    <RetroDetailModal isOpen={isOpen} onClose={handleClose}>
      {/* Image Preview */}
      <div className="flex items-start">
        <RetroPanel variant="inset" className="w-full">
          <div className="aspect-square bg-[#000000] overflow-hidden relative">
            {sculpt.photoBlobId ? (
              <img
                src={`/api/image-proxy?blobId=${sculpt.photoBlobId}`}
                alt={`Sculpt #${sculpt.id.slice(0, 8)}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
                <div className="text-center">
                  <svg className="w-12 h-12 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-white/50 text-sm font-mono">NO IMAGE</p>
                </div>
              </div>
            )}
          </div>
        </RetroPanel>
      </div>

      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <DetailHeader
          title={`SCULPT #${sculpt.id.slice(0, 8)}`}
          subtitle="MARKETPLACE LISTING"
          onClose={handleClose}
        />

        {/* Creator Info */}
        <div className="grid grid-cols-2 gap-2">
          <RetroPanel variant="inset" className="p-2">
            <p className="text-white/50 text-sm font-mono tracking-wide mb-1">CREATOR</p>
            <p className="text-white/90 text-sm font-mono">{formatAddress(sculpt.creator)}</p>
          </RetroPanel>
          <RetroPanel variant="inset" className="p-2">
            <p className="text-white/50 text-sm font-mono tracking-wide mb-1">PRICE</p>
            <div className="flex items-center gap-1">
              <svg width="10" height="12" viewBox="0 0 300 384" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M240.057 159.914C255.698 179.553 265.052 204.39 265.052 231.407C265.052 258.424 255.414 284.019 239.362 303.768L237.971 305.475L237.608 303.31C237.292 301.477 236.929 299.613 236.502 297.749C228.46 262.421 202.265 232.134 159.148 207.597C130.029 191.071 113.361 171.195 108.985 148.586C106.157 133.972 108.258 119.294 112.318 106.717C116.379 94.1569 122.414 83.6187 127.549 77.2831L144.328 56.7754C147.267 53.1731 152.781 53.1731 155.719 56.7754L240.073 159.914H240.057ZM266.584 139.422L154.155 1.96703C152.007 -0.655678 147.993 -0.655678 145.845 1.96703L33.4316 139.422L33.0683 139.881C12.3868 165.555 0 198.181 0 233.698C0 316.408 67.1635 383.461 150 383.461C232.837 383.461 300 316.408 300 233.698C300 198.181 287.613 165.555 266.932 139.896L266.568 139.438L266.584 139.422ZM60.3381 159.472L70.3866 147.164L70.6868 149.439C70.9237 151.24 71.2239 153.041 71.5715 154.858C78.0809 189.001 101.322 217.456 140.173 239.496C173.952 258.724 193.622 280.828 199.278 305.064C201.648 315.176 202.059 325.129 201.032 333.835L200.969 334.372L200.479 334.609C185.233 342.05 168.09 346.237 149.984 346.237C86.4546 346.237 34.9484 294.826 34.9484 231.391C34.9484 204.153 44.4439 179.142 60.3065 159.44L60.3381 159.472Z" fill="white"/>
              </svg>
              <p className="text-white/90 text-sm font-mono">{formatSuiPrice(sculpt.price)} SUI</p>
            </div>
          </RetroPanel>
        </div>

        {/* Parameters */}
        {sculpt.paramKeys.length > 0 && (
          <RetroPanel variant="inset" className="p-2">
            <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">PARAMETERS</h4>
            <div className="space-y-1">
              {sculpt.paramKeys.map((key, index) => (
                <InfoField
                  key={key}
                  label={key.toUpperCase()}
                  value={sculpt.paramValues[index]?.toString() || 'N/A'}
                />
              ))}
            </div>
          </RetroPanel>
        )}

        {/* Purchase Section */}
        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">PURCHASE</h4>
          <RetroButton
            variant="primary"
            size="sm"
            onClick={handlePurchase}
            disabled={status === 'processing' || status === 'loading_kiosk'}
            isLoading={status === 'processing' || status === 'loading_kiosk'}
          >
            {status === 'loading_kiosk' ? 'Loading...' :
             status === 'processing' ? 'Purchasing...' :
             'Purchase'}
          </RetroButton>

          <p className="text-white/40 text-xs font-mono mt-2">
            ⓘ Item will be transferred to your Kiosk
          </p>
        </RetroPanel>

        {/* Details */}
        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">DETAILS</h4>
          <div className="space-y-1">
            <InfoField
              label="SCULPT ID"
              value={`${sculpt.id.slice(0, 8)}...${sculpt.id.slice(-6)}`}
            />
            <InfoField
              label="ATELIER ID"
              value={`${sculpt.atelierId.slice(0, 8)}...${sculpt.atelierId.slice(-6)}`}
            />
            <InfoField
              label="SELLER KIOSK"
              value={`${sculpt.kioskId.slice(0, 8)}...${sculpt.kioskId.slice(-6)}`}
              isLast
            />
          </div>
        </RetroPanel>
      </div>

      {/* Purchase Status Notification */}
      <MarketplaceStatusNotification
        status={status}
        error={error}
        txDigest={txDigest}
        action="purchase"
      />
    </RetroDetailModal>
  );
}

