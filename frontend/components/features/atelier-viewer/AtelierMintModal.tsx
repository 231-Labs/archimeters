'use client';

import { useEffect } from 'react';
import { AtelierMintCore } from './components/AtelierMintCore';
import { RetroButton } from '@/components/common/RetroButton';

interface AtelierMintModalProps {
  atelier: any;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AtelierMintModal - Modal wrapper for Atelier minting
 * Displays the minting interface in a modal overlay
 */
export function AtelierMintModal({ atelier, isOpen, onClose }: AtelierMintModalProps) {

  // ESC key support
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!atelier) {
    return null;
  }

  return (
    <>
      {/* Backdrop - no blur, positioned below header, with padding for window borders */}
      <div
        className="absolute left-0 right-[2px] top-[38px] bottom-[2px] bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal Content - positioned below window header, with padding for window borders */}
      <div className="absolute left-0 right-[2px] top-[38px] bottom-[2px] z-50 overflow-auto hide-scrollbar bg-[#0a0a0a]">
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-[60]">
          <RetroButton
            size="sm"
            variant="secondary"
            onClick={onClose}
          >
            BACK
          </RetroButton>
        </div>

        <AtelierMintCore atelier={atelier} />

        <style jsx>{`
          .hide-scrollbar {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </>
  );
}

