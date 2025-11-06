'use client';

import { useState } from 'react';
import { SculptItem } from '../hooks/useUserItems';
import { formatAddress } from '@/utils/formatters';
import { SculptPrintButton } from './SculptPrintButton';
import { useSculptMarketplace } from '../hooks/useSculptMarketplace';

interface SculptDetailModalProps {
  sculpt: SculptItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  selectedPrinter?: string;
}

export function SculptDetailModal({ sculpt, isOpen, onClose, onUpdate, selectedPrinter }: SculptDetailModalProps) {
  const [listPrice, setListPrice] = useState('');
  const [show3DPreview, setShow3DPreview] = useState(false);
  const { listSculpt, status: marketplaceStatus } = useSculptMarketplace();

  if (!isOpen) return null;

  const handleList = async () => {
    if (!listPrice || parseFloat(listPrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }

    // TODO: Get kiosk info
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
          <h2 className="text-white text-xl font-semibold">{sculpt.alias}</h2>
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
          {/* Preview Image */}
          <div className="aspect-video bg-neutral-800 rounded-lg overflow-hidden relative">
            <img
              src={`/api/image-proxy?blobId=${sculpt.photoBlobId}`}
              alt={sculpt.alias}
              className="w-full h-full object-cover"
            />
            {/* 3D Preview Toggle */}
            <button
              onClick={() => setShow3DPreview(!show3DPreview)}
              className="absolute bottom-4 right-4 px-3 py-2 bg-black/70 hover:bg-black/90 text-white text-sm rounded transition-colors"
            >
              {show3DPreview ? 'Show 2D' : 'Show 3D'}
            </button>
          </div>

          {show3DPreview && (
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-400 text-sm text-center">
                3D GLB viewer coming soon...
                <br />
                <span className="text-xs text-neutral-500 mt-1 block">
                  Will display: {sculpt.structure}
                </span>
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-400 text-sm mb-1">Creator</p>
              <p className="text-white text-sm font-mono">{formatAddress(sculpt.creator)}</p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4">
              <p className="text-neutral-400 text-sm mb-1">Created</p>
              <p className="text-white text-sm">{sculpt.time}</p>
            </div>
          </div>

          {/* Current Location */}
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Current Location</h4>
            <p className="text-neutral-400 text-sm">
              This sculpt is stored in your Kiosk
            </p>
            <p className="text-neutral-500 text-xs mt-2">
              Kiosk transfer functionality coming soon...
            </p>
          </div>

          {/* Actions Section */}
          <div className="space-y-3">
            {/* Print */}
            <div className="bg-neutral-800 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-3">Print Sculpt</h4>
              <SculptPrintButton
                sculptId={sculpt.id}
                printerId={selectedPrinter}
                onSuccess={() => {
                  onUpdate();
                  onClose();
                }}
                onError={(error) => alert(`Print failed: ${error}`)}
                onStatusChange={(status) => console.log('Print status:', status)}
              />
              {!selectedPrinter && (
                <p className="text-neutral-500 text-xs mt-2">
                  Select a printer from the Vault to enable printing
                </p>
              )}
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
                List your sculpt for sale on the marketplace
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-2">Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Sculpt ID</span>
                <span className="text-white font-mono text-xs">
                  {sculpt.id.slice(0, 8)}...{sculpt.id.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Structure File</span>
                <span className="text-white font-mono text-xs truncate max-w-xs">
                  {sculpt.structure.slice(0, 20)}...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

