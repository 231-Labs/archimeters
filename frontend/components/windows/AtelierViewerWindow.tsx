import type { WindowName } from '@/types';
import AtelierViewer from '@/components/features/atelier-viewer';

interface AtelierViewerProps {
  name: WindowName;
}

export default function AtelierViewerWindow({ name }: AtelierViewerProps) {
  return <AtelierViewer name={name} />;
}