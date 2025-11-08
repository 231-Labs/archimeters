import type { WindowName } from '@/components/features/window-manager';
import AtelierViewer from '@/components/features/atelier-viewer';

interface AtelierViewerProps {
  name: WindowName;
}

export default function AtelierViewerWindow({ name }: AtelierViewerProps) {
  return <AtelierViewer name={name} />;
}