'use client';

import { useState } from 'react';
import { AtelierItem } from '../hooks/useUserItems';
import { formatSuiAmount } from '@/utils/formatters';
import { AtelierWithdrawButton } from './AtelierWithdrawButton';
import { useAtelierMarketplace } from '@/components/features/marketplace/hooks/useAtelierMarketplace';

interface AtelierDetailModalProps {
  atelier: AtelierItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function AtelierDetailModal({ atelier, isOpen, onClose, onUpdate }: AtelierDetailModalProps) {
  const [listPrice, setListPrice] = useState('');
  const { listAtelier, status: marketplaceStatus } = useAtelierMarketplace();

  if (!isOpen) return null;

  const handleList = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    // TODO: Get kiosk info from user
    // This is a placeholder - needs actual kiosk ID and cap ID
    alert('Marketplace listing requires kiosk integration. Coming soon!');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-neutral-900 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-700 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-semibold">{atelier.title}</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cover Image */}
          <div className="aspect-video bg-neutral-800 rounded-lg overflow-hidden">
            <img
              src={`/api/image-proxy?blobId=${atelier.photoBlobId}`}
              alt={atelier.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-400 text-sm mb-1">Pool Balance</p>
              <p className="text-white text-lg font-semibold">{formatSuiAmount(atelier.pool)}</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-400 text-sm mb-1">Mint Price</p>
              <p className="text-white text-lg font-semibold">{formatSuiAmount(atelier.price)}</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-400 text-sm mb-1">Published</p>
              <p className="text-white text-lg font-semibold">{atelier.publish_time}</p>
            </div>
          </div>

          {/* Derived Sculpts Section */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-3">Derived Sculpts</h3>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-400 text-sm">
                View all sculpts minted from this atelier in the Gallery.
              </p>
              <p className="text-neutral-500 text-xs mt-2">
                Total mints tracking coming soon...
              </p>
            </div>
          </div>

          {/* Actions Section */}
          <div className="space-y-3">
            {/* Withdraw */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Withdraw Earnings</h4>
              <AtelierWithdrawButton
                atelierId={atelier.id}
                poolId={atelier.poolId}
                poolAmount={Number(atelier.pool)}
                onSuccess={() => {
                  onUpdate();
                  onClose();
                }}
                onError={(error) => alert(`Withdrawal failed: ${error}`)}
                onStatusChange={(status) => console.log('Withdraw status:', status)}
              />
            </div>

            {/* List on Marketplace */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">List on Marketplace</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Price in SUI"
                  value={listPrice}
                  onChange={(e) => setListPrice(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white"
                  step="0.01"
                  min="0"
                />
                <button
                  onClick={handleList}
                  disabled={marketplaceStatus === 'processing'}
                  className="px-4 py-2 bg-white text-black rounded hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {marketplaceStatus === 'processing' ? 'Listing...' : 'List'}
                </button>
              </div>
              <p className="text-neutral-500 text-xs mt-2">
                List your atelier for sale on the marketplace
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Atelier ID</span>
                <span className="text-white font-mono text-xs">
                  {atelier.id.slice(0, 8)}...{atelier.id.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Pool ID</span>
                <span className="text-white font-mono text-xs">
                  {atelier.poolId.slice(0, 8)}...{atelier.poolId.slice(-6)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

