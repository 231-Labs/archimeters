import { useEffect, useState } from 'react';
import type { WindowName } from '@/types';
import BaseTemplate from '@/components/templates/BaseTemplate';
import DefaultTemplate from '@/components/templates/DefaultTemplate';
import ParametricScene from '@/components/3d/ParametricScene';

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
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [previewParams, setPreviewParams] = useState<Record<string, any>>({});

  useEffect(() => {
    // 從 sessionStorage 中讀取藝術品數據
    const storedArtlier = sessionStorage.getItem('selected-artlier');
    if (storedArtlier) {
      const parsedArtlier = JSON.parse(storedArtlier);
      setArtlier(parsedArtlier);
      
      // 如果有 configData，設置參數
      if (parsedArtlier.configData) {
        setParameters(parsedArtlier.configData.parameters || {});
        // 設置預覽參數的初始值
        const initialPreviewParams = Object.fromEntries(
          Object.entries(parsedArtlier.configData.parameters || {})
            .map(([key, value]: [string, any]) => [key, value.default])
        );
        setPreviewParams(initialPreviewParams);
      }
    }
  }, []);

  const handleParameterChange = (key: string, value: string | number) => {
    setPreviewParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (!artlier) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  return (
    <BaseTemplate
      workName={artlier.title}
      description=""
      price={artlier.price}
      author={artlier.author}
      social={artlier.author?.slice(0, 8) || ''}
      intro=""
      imageUrl={artlier.url || ''}
      parameters={parameters}
      previewParams={previewParams}
      onParameterChange={handleParameterChange}
      onMint={() => {}}
    >
      <DefaultTemplate
        workName={artlier.title}
        description=""
        price={artlier.price}
        author={artlier.author}
        social={artlier.author?.slice(0, 8) || ''}
        intro=""
        imageUrl={artlier.url || ''}
        parameters={parameters}
        previewParams={previewParams}
        onParameterChange={handleParameterChange}
        onMint={() => {}}
        preview3D={<ParametricScene parameters={previewParams} />}
      />
    </BaseTemplate>
  );
} 