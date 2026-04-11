import { useAtelierData } from './hooks/useAtelierData';
import { AtelierMintCore } from './components/AtelierMintCore';
import type { WindowName } from '@/components/features/window-manager';

interface AtelierViewerProps {
  name: WindowName;
  onOpenWindow?: (windowName: WindowName) => void;
}

/**
 * AtelierViewer - Window mode wrapper for Atelier minting
 * Loads atelier data from sessionStorage and displays it in a window
 */
export default function AtelierViewer({ name, onOpenWindow }: AtelierViewerProps) {
  const { atelier, isLoading, error } = useAtelierData();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-mono text-sm">LOADING...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-red-600 dark:text-red-400 font-mono text-sm">ERROR: {error}</div>
      </div>
    );
  }

  if (!atelier) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-muted-foreground font-mono text-sm">NO ATELIER DATA FOUND</div>
      </div>
    );
  }

  return <AtelierMintCore atelier={atelier} onOpenWindow={onOpenWindow} />;
}

