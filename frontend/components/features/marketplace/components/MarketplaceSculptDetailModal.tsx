'use client';

import { useEffect, useState } from 'react';
import { useMarketplacePurchase } from '../hooks/useMarketplacePurchase';
import { RetroDetailModal, DetailHeader, InfoField } from '@/components/common/RetroDetailModal';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroKioskSelector } from '@/components/common/RetroKioskSelector';
import { RetroPriceBreakdown } from '@/components/common/RetroPriceBreakdown';
import { MarketplaceStatusNotification } from '@/components/features/vault/components/MarketplaceStatusNotification';
import { SuiLogo } from '@/components/common/SuiLogo';
import { formatSuiPrice, formatAddress } from '@/utils/formatters';
import { useSuiBalance } from '@/hooks/useSuiBalance';
import { MARKETPLACE_CONFIG } from '@/config/marketplace';
import type { Sculpt, KioskInfo } from '../types';

interface MarketplaceSculptDetailModalProps {
  sculpt: Sculpt;
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
  const { balance, isLoading: isLoadingBalance, hasEnoughBalance } = useSuiBalance();
  const [localKioskId, setLocalKioskId] = useState<string | null>(null);
  const [localKioskCapId, setLocalKioskCapId] = useState<string | null>(null);
  
  const totalPrice = MARKETPLACE_CONFIG.calculateTotal(sculpt.price);
  const hasBalance = hasEnoughBalance(BigInt(totalPrice));
  
  const formatBalanceDisplay = (balanceInMist: bigint): string => {
    const balanceInSui = Number(balanceInMist) / 1_000_000_000;
    return balanceInSui.toFixed(2);
  };

  useEffect(() => {
    if (targetKioskInfo) {
      setLocalKioskId(targetKioskInfo.kioskId);
      setLocalKioskCapId(targetKioskInfo.kioskCapId);
    }
  }, [targetKioskInfo]);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        resetStatus();
        if (onPurchaseSuccess) {
          onPurchaseSuccess();
        }
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, resetStatus, onPurchaseSuccess, onClose]);

  const handleKioskChange = (kioskId: string | null, kioskCapId: string | null) => {
    setLocalKioskId(kioskId);
    setLocalKioskCapId(kioskCapId);
  };

  const handlePurchase = async () => {
    if (status === 'processing' || status === 'loading_kiosk') return;
    
    if (!localKioskId || !localKioskCapId) {
      alert('Please select a Kiosk to receive the purchased item.');
      return;
    }
    
    const currentKioskInfo: KioskInfo = {
      kioskId: localKioskId,
      kioskCapId: localKioskCapId
    };
    
    await purchaseSculpt(sculpt.id, sculpt.kioskId, sculpt.price, currentKioskInfo);
  };

  const handleClose = () => {
    if (status === 'processing' || status === 'loading_kiosk') return;
    resetStatus();
    onClose();
  };

  return (
    <RetroDetailModal isOpen={isOpen} onClose={handleClose}>
      <div className="flex flex-col items-start space-y-3">
        <RetroPanel variant="inset" className="w-full">
          <div className="aspect-[4/3] bg-[#000000] overflow-hidden relative">
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

        <RetroPanel variant="inset" className="p-2 w-full">
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

      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '90vh' }} onClick={(e) => e.stopPropagation()}>
        <DetailHeader
          title={`SCULPT #${sculpt.id.slice(0, 8)}`}
          subtitle="MARKETPLACE LISTING"
          onClose={handleClose}
        />

        <div className="grid grid-cols-2 gap-2">
          <RetroPanel variant="inset" className="p-2">
            <p className="text-white/50 text-sm font-mono tracking-wide mb-1">CREATOR</p>
            <p className="text-white/90 text-sm font-mono">{formatAddress(sculpt.creator)}</p>
          </RetroPanel>
          <RetroPanel variant="inset" className="p-2">
            <p className="text-white/50 text-sm font-mono tracking-wide mb-1">TOTAL PRICE</p>
            <div className="flex items-center gap-1">
              <SuiLogo />
              <p className="text-white/90 text-sm font-mono">{formatSuiPrice(totalPrice)} SUI</p>
            </div>
          </RetroPanel>
        </div>

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">PRICE BREAKDOWN</h4>
          <RetroPriceBreakdown priceInMist={sculpt.price} />
        </RetroPanel>

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

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">PURCHASE</h4>
          
          <div className="space-y-2">
            {balance !== null && (
              <div className="text-xs font-mono text-white/70 mb-1">
                Your Balance: {formatBalanceDisplay(balance)} SUI
                {!hasBalance && (
                  <span className="text-red-400 ml-2">
                    (Insufficient)
                  </span>
                )}
              </div>
            )}

            <div>
              <p className="text-white/50 text-xs font-mono tracking-wide mb-1">SELECT DESTINATION KIOSK</p>
              <RetroKioskSelector 
                onKioskChange={handleKioskChange}
                compact={false}
              />
            </div>

            <RetroButton
              variant="primary"
              size="sm"
              onClick={handlePurchase}
              disabled={
                status === 'processing' || 
                status === 'loading_kiosk' || 
                !localKioskId || 
                !hasBalance ||
                isLoadingBalance
              }
              isLoading={status === 'processing' || status === 'loading_kiosk'}
              className="w-full"
            >
              {isLoadingBalance ? 'Checking Balance...' :
               status === 'loading_kiosk' ? 'Loading...' :
               status === 'processing' ? 'Purchasing...' :
               !hasBalance ? 'Insufficient Balance' :
               'Purchase'}
            </RetroButton>

            <p className="text-white/40 text-xs font-mono">
              ⓘ Item will be transferred to selected Kiosk
            </p>
          </div>
        </RetroPanel>
      </div>

      <MarketplaceStatusNotification
        status={status}
        error={error}
        txDigest={txDigest}
        action="purchase"
      />
    </RetroDetailModal>
  );
}
