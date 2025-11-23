'use client';

import { useEffect } from 'react';
import { AtelierMintCore } from './components/AtelierMintCore';
import { WindowName } from '@/components/features/window-manager/types';

interface AtelierMintModalProps {
  atelier: any;
  isOpen: boolean;
  onClose: () => void;
  onOpenWindow?: (windowName: WindowName) => void;
}

/**
 * AtelierMintModal - Modal wrapper for Atelier minting
 * Displays the minting interface in a modal overlay
 */
export function AtelierMintModal({ atelier, isOpen, onClose, onOpenWindow }: AtelierMintModalProps) {

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
      {/* Backdrop - covers entire window content area */}
      <div
        className="absolute inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal Content - covers entire window content area */}
      <div className="absolute inset-0 z-50 overflow-auto hide-scrollbar bg-[#0a0a0a]">
        <AtelierMintCore atelier={atelier} onOpenWindow={onOpenWindow} onBack={onClose} />

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

