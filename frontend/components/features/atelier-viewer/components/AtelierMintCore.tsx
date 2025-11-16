'use client';

import { useState, useRef, useMemo } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import * as THREE from 'three';
import { ParametricViewer } from '@/components/features/design-publisher/components/pages/ParametricViewer';
import { AtelierMintLayout } from './AtelierMintLayout';
import { useAtelierParameters } from '../hooks/useAtelierParameters';
import { useSceneExport } from '../hooks/useSceneExport';
import { useWalrusUpload } from '../hooks/useWalrusUpload';
import { useSculptMint } from '../hooks/useSculptMint';
import { useMembershipCheck } from '../hooks/useMembershipCheck';
import { useMintButtonState } from '../hooks/useMintButtonState';
import { StlToggle } from './ExportFormatToggle';
import { MintStatusConsole } from './MintStatusConsole';
import { formatAddress, formatText, scaleSuiPrice } from '../utils/formatters';
import { SceneRefs } from '../types';
import { WindowName } from '@/components/features/window-manager/types';

interface AtelierMintCoreProps {
  atelier: any;
  onOpenWindow?: (windowName: WindowName) => void;
  onBack?: () => void;
}

/**
 * AtelierMintCore - Core minting logic and UI
 * Shared between AtelierViewer (window mode) and AtelierMintModal (modal mode)
 */
export function AtelierMintCore({ atelier, onOpenWindow, onBack }: AtelierMintCoreProps) {
  const [alias, setAlias] = useState('');
  const [generateStl, setGenerateStl] = useState(false);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const currentAccount = useCurrentAccount();

  const { parameters, previewParams, handleParameterChange, userScript } = useAtelierParameters(atelier);
  const { exportFormat, setExportFormat, exportScene } = useSceneExport();
  const { uploadToWalrus } = useWalrusUpload();
  const { hasMembership } = useMembershipCheck();
  const { mintButtonState, suiBalance } = useMintButtonState(hasMembership, atelier);

  const sceneRefs: SceneRefs = useMemo(() => ({
    scene: sceneRef.current,
    renderer: rendererRef.current,
    camera: cameraRef.current,
  }), [sceneRef.current, rendererRef.current, cameraRef.current]);

  // Extract isPrintable from atelier metadata
  // Check both metadata structure and top-level (for backward compatibility)
  const isPrintable = useMemo(() => {
    // Try to get from metadata.artwork.isPrintable
    if (atelier?.metadata?.artwork?.isPrintable !== undefined) {
      return atelier.metadata.artwork.isPrintable;
    }
    // Try to get from top-level isPrintable
    if (atelier?.isPrintable !== undefined) {
      return atelier.isPrintable;
    }
    
    // Fallback: Detect from algorithm code for old artworks
    // This helps identify animated artworks that were uploaded before isPrintable support
    if (atelier?.algorithmContent) {
      const code = atelier.algorithmContent;
      
      // Check for explicit flags in code
      if (code.includes('isPrintable: false') || code.includes('printable: false')) {
        console.log('🎨 [Runtime Detection] Detected non-printable artwork from code flag');
        return false;
      }
      
      // Check for animation features
      const hasCreateAnimatedScene = code.includes('createAnimatedScene');
      const hasAnimateFunction = /function\s+animate\s*\(/.test(code) || /\.animate\s*=/.test(code);
      const hasAnimationParams = code.includes('Animation Speed') || code.includes('speed');
      
      if (hasCreateAnimatedScene || (hasAnimateFunction && hasAnimationParams)) {
        console.log('🎨 [Runtime Detection] Detected animated artwork from code features');
        return false;
      }
    }
    
    // Default to true (3D printable) for backward compatibility
    return true;
  }, [atelier]);

  // For animated artworks, force generateStl to false (safety check)
  // Even if UI somehow allows it, backend should not generate STL
  const effectiveGenerateStl = isPrintable ? generateStl : false;

  const { mintStatus, mintError, txDigest, currentStep, steps, screenshotDataUrl, handleMint } = useSculptMint({
    atelier,
    sceneRefs,
    exportScene,
    uploadToWalrus,
    exportFormat,
    generateStl: effectiveGenerateStl,
    parameters,
    previewParams,
  });

  const viewerProps = useMemo(() => ({
    userScript,
    parameters: previewParams,
    isPrintable, // Pass to ParametricViewer to choose renderer
    onSceneReady: (scene: THREE.Scene) => {
      sceneRef.current = scene;
    },
    onRendererReady: (renderer: THREE.WebGLRenderer) => {
      rendererRef.current = renderer;
    },
    onCameraReady: (camera: THREE.Camera) => {
      cameraRef.current = camera;
    }
  }), [userScript, previewParams, isPrintable]);

  const onMint = async () => {
    // For animated artworks, ensure STL generation is disabled
    // even if generateStl state is true (shouldn't happen with UI logic, but safety check)
    await handleMint(alias);
  };

  // For animated artworks, STL export should be disabled
  const stlToggle = isPrintable ? (
    <StlToggle 
      generateStl={generateStl} 
      onToggle={() => setGenerateStl(prev => !prev)} 
    />
  ) : (
    <div className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-white/10 rounded">
      <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        />
      </svg>
      <span className="text-white/40 text-xs font-mono">STL export not available for animated artworks</span>
    </div>
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

  // Show console when minting is in progress or complete
  const showMintConsole = mintStatus !== 'idle';

  const handleGoToVault = () => {
    if (onOpenWindow) {
      // Set flag in sessionStorage to open vault with sculpts tab
      sessionStorage.setItem('vault-initial-tab', 'sculpts');
      onOpenWindow('vault');
    }
  };

  // If minting, show status console instead of mint layout
  if (showMintConsole) {
    return (
      <MintStatusConsole
        currentStep={currentStep}
        steps={steps}
        txDigest={txDigest}
        mintError={mintError}
        previewImage={screenshotDataUrl || atelier.url}
        sculptName={alias || atelier.title}
        atelierName={atelier.title}
        atelierAuthor={atelier.artistName || atelier.author || 'Unknown'}
        atelierDescription={atelier.intro || atelier.description || ''}
        sculptOwner={currentAccount?.address ? formatAddress(currentAccount.address) : ''}
        onGoToVault={onOpenWindow ? handleGoToVault : undefined}
        onBack={onBack}
      />
    );
  }

  return (
      <AtelierMintLayout
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
        exportFormatToggle={stlToggle}
        mintButtonState={{
          ...mintButtonState,
          tooltipComponent,
        }}
        alias={alias}
        onAliasChange={setAlias}
        preview3D={
          <div className="w-full h-full relative">
            <ParametricViewer {...viewerProps} />
            {/* Artwork type indicator */}
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 border border-white/20 rounded">
              <div className="flex items-center gap-2">
                {isPrintable ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                    <span className="text-white/80 text-[10px] font-mono uppercase tracking-wide">3D Printable</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-cyan-400 text-[10px] font-mono uppercase tracking-wide">Animated</span>
                  </>
                )}
              </div>
            </div>
          </div>
        }
      />
  );
}

