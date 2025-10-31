import { useState, useRef, useMemo } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import * as THREE from 'three';
import { ParametricViewer } from '@/components/features/design-publisher/components/pages/ParametricViewer';
import BaseTemplate from '@/components/templates/BaseTemplate';
import DefaultTemplate from '@/components/templates/DefaultTemplate';
import { useAtelierData } from './hooks/useAtelierData';
import { useAtelierParameters } from './hooks/useAtelierParameters';
import { useSceneExport } from './hooks/useSceneExport';
import { useWalrusUpload } from './hooks/useWalrusUpload';
import { useSculptMint } from './hooks/useSculptMint';
import { useMembershipCheck } from './hooks/useMembershipCheck';
import { useMintButtonState } from './hooks/useMintButtonState';
import { ExportFormatToggle } from './components/ExportFormatToggle';
import { MintStatusNotification } from './components/MintStatusNotification';
import { formatAddress, formatText, scaleSuiPrice } from './utils/formatters';
import { SceneRefs } from './types';
import type { WindowName } from '@/types';

interface AtelierViewerProps {
  name: WindowName;
}

export default function AtelierViewer({ name }: AtelierViewerProps) {
  const [alias, setAlias] = useState('');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const currentAccount = useCurrentAccount();

  const { atelier, isLoading, error } = useAtelierData();
  const { parameters, previewParams, handleParameterChange, userScript } = useAtelierParameters(atelier);
  const { exportFormat, setExportFormat, exportScene } = useSceneExport();
  const { uploadStatus, uploadProgress, uploadToWalrus } = useWalrusUpload();
  const { hasMembership } = useMembershipCheck();
  const { mintButtonState, suiBalance } = useMintButtonState(hasMembership, atelier);

  const sceneRefs: SceneRefs = useMemo(() => ({
    scene: sceneRef.current,
    renderer: rendererRef.current,
    camera: cameraRef.current,
  }), [sceneRef.current, rendererRef.current, cameraRef.current]);

  const { mintStatus, mintError, txDigest, handleMint } = useSculptMint({
    atelier,
    sceneRefs,
    exportScene,
    uploadToWalrus,
    exportFormat,
  });

  const viewerProps = useMemo(() => ({
    userScript,
    parameters: previewParams,
    onSceneReady: (scene: THREE.Scene) => {
      sceneRef.current = scene;
    },
    onRendererReady: (renderer: THREE.WebGLRenderer) => {
      rendererRef.current = renderer;
    },
    onCameraReady: (camera: THREE.Camera) => {
      cameraRef.current = camera;
    }
  }), [userScript, previewParams]);

  const onMint = async () => {
    await handleMint(alias);
  };

  const exportFormatToggle = (
    <ExportFormatToggle 
      exportFormat={exportFormat} 
      onToggle={() => setExportFormat(prev => prev === 'glb' ? 'stl' : 'glb')} 
    />
  );

  const tooltipComponent = mintButtonState.disabled ? (
    <div className="absolute bottom-full left-1/3 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      <div className="flex items-center gap-2">
        {!currentAccount && (
          <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {currentAccount && !hasMembership && (
          <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        )}
        {currentAccount && hasMembership && suiBalance < BigInt(atelier?.price || 0) && (
          <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        <span className="text-sm font-mono text-white/90">{mintButtonState.tooltip}</span>
      </div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/90 border-r border-b border-white/10"></div>
    </div>
  ) : null;

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!atelier) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/50">No atelier data found</div>
      </div>
    );
  }

  return (
    <BaseTemplate
      workName={atelier.title}
      description={atelier.description || ''}
      price={scaleSuiPrice(atelier.price)}
      author={atelier.artistName || atelier.author}
      social={formatAddress(atelier.artistAddress || '')}
      intro={formatText(atelier.artistStatement || '')}
      imageUrl={atelier.url || ''}
      parameters={parameters}
      previewParams={previewParams}
      onParameterChange={handleParameterChange}
      onMint={onMint}
      exportFormatToggle={exportFormatToggle}
      mintButtonState={{
        ...mintButtonState,
        tooltipComponent,
      }}
      alias={alias}
      onAliasChange={setAlias}
    >
      <DefaultTemplate
        workName={atelier.title}
        description={atelier.description || ''}
        price={scaleSuiPrice(atelier.price)}
        author={atelier.artistName || atelier.author}
        social={formatAddress(atelier.artistAddress || '')}
        intro={formatText(atelier.artistStatement || '')}
        imageUrl={atelier.url || ''}
        parameters={parameters}
        previewParams={previewParams}
        onParameterChange={handleParameterChange}
        onMint={onMint}
        exportFormatToggle={exportFormatToggle}
        mintButtonState={{
          ...mintButtonState,
          tooltipComponent,
        }}
        alias={alias}
        onAliasChange={setAlias}
        preview3D={
          <div className="w-full h-full">
            <ParametricViewer {...viewerProps} />
          </div>
        }
      />
      <MintStatusNotification
        uploadStatus={uploadStatus}
        uploadProgress={uploadProgress}
        mintStatus={mintStatus}
        mintError={mintError}
        txDigest={txDigest}
      />
    </BaseTemplate>
  );
}

