'use client';

import { useState } from 'react';
import { AtelierItem } from '../hooks/useUserItems';
import { formatSuiAmount } from '@/utils/formatters';
import { AtelierWithdrawButton } from './AtelierWithdrawButton';
import { WithdrawStatusNotification } from './WithdrawStatusNotification';
import { useAtelierMarketplace } from '../hooks/useAtelierMarketplace';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroInput } from '@/components/common/RetroInput';
import { RetroDetailModal, DetailHeader, InfoField } from '@/components/common/RetroDetailModal';

interface AtelierDetailModalProps {
  atelier: AtelierItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function AtelierDetailModal({ atelier, isOpen, onClose, onUpdate }: AtelierDetailModalProps) {
  const [listPrice, setListPrice] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [withdrawMessage, setWithdrawMessage] = useState<string | null>(null);
  const [withdrawTxDigest, setWithdrawTxDigest] = useState<string | null>(null);
  const { status: marketplaceStatus } = useAtelierMarketplace();

  const handleList = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }
    alert('Marketplace listing requires kiosk integration. Coming soon!');
  };

  return (
    <RetroDetailModal isOpen={isOpen} onClose={onClose}>
      <div className="flex items-start">
        <RetroPanel variant="inset" className="w-full">
          <div className="aspect-square bg-[#000000] overflow-hidden">
            <img
              src={`/api/image-proxy?blobId=${atelier.photoBlobId}`}
              alt={atelier.title}
              className="w-full h-full object-cover"
            />
          </div>
        </RetroPanel>
          </div>

      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '90vh' }}>
        <DetailHeader
          title={atelier.title.toUpperCase()}
          subtitle="ATELIER DETAILS"
          onClose={onClose}
        />

        <div className="grid grid-cols-3 gap-2">
          <RetroPanel variant="inset" className="p-2">
            <p className="text-white/50 text-xs font-mono tracking-wide mb-1">POOL</p>
            <p className="text-white/90 text-sm font-mono">{formatSuiAmount(atelier.pool)}</p>
          </RetroPanel>
          <RetroPanel variant="inset" className="p-2">
            <p className="text-white/50 text-xs font-mono tracking-wide mb-1">PRICE</p>
            <p className="text-white/90 text-sm font-mono">{formatSuiAmount(atelier.price)}</p>
          </RetroPanel>
          <RetroPanel variant="inset" className="p-2">
            <p className="text-white/50 text-xs font-mono tracking-wide mb-1">PUBLISHED</p>
            <p className="text-white/90 text-sm font-mono">{atelier.publish_time}</p>
          </RetroPanel>
          </div>

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-1">DERIVED SCULPTS</h4>
          <p className="text-white/70 text-sm font-mono mb-1">View all sculpts in Marketplace</p>
          <p className="text-white/40 text-xs font-mono">ⓘ Tracking coming soon</p>
        </RetroPanel>

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">WITHDRAW EARNINGS</h4>
              <AtelierWithdrawButton
                atelierId={atelier.id}
                poolId={atelier.poolId}
                poolAmount={Number(atelier.pool)}
                onSuccess={() => {
                  onUpdate();
                  // Don't close modal immediately, let user see success toast
                }}
                onError={(error) => {
                  setWithdrawStatus('error');
                  setWithdrawMessage(error);
                }}
                onStatusChange={(status, message, txDigest) => {
                  setWithdrawStatus(status);
                  setWithdrawMessage(message || null);
                  if (txDigest) {
                    setWithdrawTxDigest(txDigest);
                  }
                  if (status === 'success') {
                    // Auto close after 2 seconds on success
                    setTimeout(() => {
                      onUpdate();
                      onClose();
                    }, 2000);
                  }
                }}
              />
        </RetroPanel>

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">MARKETPLACE</h4>
          <div className="flex gap-2 mb-1">
            <RetroInput
                  type="number"
                  placeholder="Price in SUI"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
              className="flex-1"
                  step="0.01"
                  min="0"
                />
            <RetroButton
              variant="primary"
              size="sm"
                  onClick={handleList}
                  disabled={marketplaceStatus === 'processing'}
              isLoading={marketplaceStatus === 'processing'}
                >
                  {marketplaceStatus === 'processing' ? 'Listing...' : 'List'}
            </RetroButton>
          </div>
          <p className="text-white/40 text-xs font-mono">ⓘ List for sale on marketplace</p>
        </RetroPanel>

        <RetroPanel variant="inset" className="p-2">
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-2">DETAILS</h4>
          <div className="space-y-1">
            <InfoField
              label="ATELIER ID"
              value={`${atelier.id.slice(0, 8)}...${atelier.id.slice(-6)}`}
            />
            <InfoField
              label="POOL ID"
              value={`${atelier.poolId.slice(0, 8)}...${atelier.poolId.slice(-6)}`}
              isLast
            />
          </div>
        </RetroPanel>
      </div>

      {/* Withdraw Status Notification */}
      <WithdrawStatusNotification
        status={withdrawStatus}
        message={withdrawMessage}
        txDigest={withdrawTxDigest}
      />
    </RetroDetailModal>
  );
}
