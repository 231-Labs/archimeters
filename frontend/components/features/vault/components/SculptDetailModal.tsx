'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { SculptItem } from '../hooks/useUserItems';
import { formatAddress } from '@/utils/formatters';
import { SculptPrintButton } from './SculptPrintButton';
import { useSculptMarketplace } from '../hooks/useSculptMarketplace';
import { RetroPanel } from '@/components/common/RetroPanel';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroInput } from '@/components/common/RetroInput';
import { RetroDetailModal, DetailHeader, InfoField } from '@/components/common/RetroDetailModal';

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
}

export function SculptDetailModal({ sculpt, isOpen, onClose, onUpdate, selectedPrinter }: SculptDetailModalProps) {
  const [listPrice, setListPrice] = useState('');
  const [show3DPreview, setShow3DPreview] = useState(false);
  const { status: marketplaceStatus } = useSculptMarketplace();

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
          <div className="aspect-square bg-[#000000] overflow-hidden relative">
            {show3DPreview ? (
              <GLBViewer blobId={sculpt.structure} className="w-full h-full" />
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
              >
                {show3DPreview ? '2D' : '3D'}
              </RetroButton>
            </div>
          </div>
        </RetroPanel>
      </div>

      <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '90vh' }}>
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
          <h4 className="text-white/90 text-sm font-mono tracking-wide mb-1">LOCATION</h4>
          <p className="text-white/70 text-sm font-mono mb-1">Stored in your Kiosk</p>
          <p className="text-white/40 text-xs font-mono">ⓘ Transfer coming soon</p>
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
            onStatusChange={(status) => console.log('Print status:', status)}
          />
          {!selectedPrinter && (
            <p className="text-white/40 text-xs font-mono mt-2">
              ⓘ Select a printer from Vault
            </p>
          )}
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
              label="SCULPT ID"
              value={`${sculpt.id.slice(0, 8)}...${sculpt.id.slice(-6)}`}
            />
            <InfoField
              label="STRUCTURE"
              value={`${sculpt.structure.slice(0, 15)}...`}
              isLast
            />
          </div>
        </RetroPanel>
      </div>
    </RetroDetailModal>
  );
}
