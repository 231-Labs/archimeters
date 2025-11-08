import { useAtelierData } from './hooks/useAtelierData';
import { AtelierMintCore } from './components/AtelierMintCore';
import type { WindowName } from '@/types';

interface AtelierViewerProps {
  name: WindowName;
}

/**
 * AtelierViewer - Window mode wrapper for Atelier minting
 * Loads atelier data from sessionStorage and displays it in a window
 */
export default function AtelierViewer({ name }: AtelierViewerProps) {
  const { atelier, isLoading, error } = useAtelierData();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white/50 font-mono text-sm">LOADING...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-red-500 font-mono text-sm">ERROR: {error}</div>
      </div>
    );
  }

  if (!atelier) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-white/50 font-mono text-sm">NO ATELIER DATA FOUND</div>
      </div>
    );
  }

  return <AtelierMintCore atelier={atelier} />;
}

