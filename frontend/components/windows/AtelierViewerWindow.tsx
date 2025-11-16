import type { WindowName } from '@/components/features/window-manager';
import AtelierViewer from '@/components/features/atelier-viewer';

interface AtelierViewerProps {
  name: WindowName;
  onOpenWindow?: (windowName: WindowName) => void;
}

export default function AtelierViewerWindow({ name, onOpenWindow }: AtelierViewerProps) {
  return <AtelierViewer name={name} onOpenWindow={onOpenWindow} />;
}