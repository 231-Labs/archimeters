import { useEffect, useState } from 'react';
import type { WindowName } from '@/types';
import Image from 'next/image';

interface ArtlierViewerWindowProps {
  name: WindowName;
}

interface Artlier {
  id: string;
  photoBlobId: string;
  algorithmBlobId: string;
  dataBlobId: string;
  url: string | null;
  algorithmContent: string | null;
  configData: any | null;
  title: string;
  author: string;
  price: string;
}

export default function ArtlierViewerWindow({
  name,
}: ArtlierViewerWindowProps) {
  const [artlier, setArtlier] = useState<Artlier | null>(null);

  useEffect(() => {
    // 從 sessionStorage 中讀取藝術品數據
    const storedArtlier = sessionStorage.getItem('selected-artlier');
    if (storedArtlier) {
      setArtlier(JSON.parse(storedArtlier));
    }
  }, []);

  if (!artlier) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a] text-white">
      {/* 主圖區域 */}
      <div className="flex-1 relative overflow-hidden">
        {artlier.url && (
          <Image
            src={artlier.url}
            alt={artlier.title}
            className="w-full h-full object-contain"
            width={1200}
            height={800}
            priority
          />
        )}
      </div>

      {/* 信息區域 */}
      <div className="p-4 border-t border-white/10 bg-[#0a0a0a]">
        <h2 className="text-lg font-bold mb-2">{artlier.title}</h2>
        <div className="flex items-center justify-between text-sm text-white/70">
          <div>@{artlier.author}</div>
          <div>φ {artlier.price}</div>
        </div>
      </div>
    </div>
  );
} 