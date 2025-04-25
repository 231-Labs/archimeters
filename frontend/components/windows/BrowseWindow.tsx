'use client';

import { useEffect, useState } from 'react';
import Window from '../core/Window';
import type { WindowName } from '@/types';

interface BrowseWindowProps {
  name: WindowName;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isActive?: boolean;
  onClose: (name: WindowName) => void;
  onDragStart: (e: React.MouseEvent<Element>, name: WindowName) => void;
  onResize?: (e: React.MouseEvent, name: WindowName) => void;
  onClick?: () => void;
}

export default function BrowseWindow({
  name,
  position,
  size,
  isActive,
  onClose,
  onDragStart,
  onResize,
  onClick,
}: BrowseWindowProps) {
  const [blobUrls, setBlobUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleImageClick = (url: string) => {
    // TODO: 實現圖片點擊功能
    console.log('Image clicked:', url);
  };

  useEffect(() => {
    async function fetchBlobUrls() {
      try {
        const response = await fetch('/api/walrus?list=1');
        const data = await response.json();

        if (response.ok && data.blobIds) {
          const urls = await Promise.all(
            data.blobIds.map(async (id: string) => {
              try {
                const blobResponse = await fetch(`/api/walrus/blob/${id}`);
                if (blobResponse.ok) {
                  const blob = await blobResponse.blob();
                  return URL.createObjectURL(blob);
                }
                console.error(`無法獲取 Blob 數據 for ID: ${id}`, blobResponse.status);
                return null;
              } catch (fetchError) {
                console.error(`獲取 Blob 數據失敗 for ID: ${id}`, fetchError);
                return null;
              }
            })
          ).then((resolvedUrls) => resolvedUrls.filter(url => url !== null)) as string[];
          
          setBlobUrls(urls);
        } else {
          setError(data.error || '發生未知錯誤');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('無法取得資料');
      } finally {
        setLoading(false);
      }
    }

    fetchBlobUrls();
  }, []);

  return (
    <Window
      name={name}
      title="瀏覽圖片"
      position={position}
      size={size}
      isActive={isActive}
      onClose={onClose}
      onDragStart={onDragStart}
      onResize={onResize}
      onClick={onClick}
      resizable={true}
      className="w-[80vw] h-[80vh] max-w-6xl max-h-[680px]"
    >
      <div className="flex flex-col h-full">
        {/* 圖片區域：可滾動 */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <p className="text-white">載入中...</p>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          <div className="columns-1 sm:columns-2 md:columns-3 gap-4 p-6">
            {blobUrls.map((url) => (
              <button
                key={url}
                onClick={() => handleImageClick(url)}
                className="relative group w-full mb-4 break-inside-avoid outline-none transition-all"
                style={{ display: 'block' }}
              >
                <img
                  src={url}
                  alt="可點擊的圖片"
                  className="w-full rounded-lg shadow-md ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 group-hover:ring-white/30"
                />
                {/* 浮出的文字 */}
                <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                  <div className='bg-black/40 flex flex-col justify-end w-fit rounded-lg'>
                    <span className="inline-block border text-sm text-white font-mono tracking-wide px-4 py-1 rounded text-center">
                      ハイキュー!!
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Window>
  );
} 