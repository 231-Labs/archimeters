import BaseTemplate from '@/components/templates/BaseTemplate'
import DefaultTemplate from '@/components/templates/DefaultTemplate';
import { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { ParametricViewer } from './ParametricViewer';
import * as THREE from 'three';

interface PreviewPageProps {
  workName: string;
  description: string;
  price: string;
  name: string;
  social: string;
  intro: string;
  imageUrl: string;
  parameters: Record<string, any>;
  previewParams: Record<string, any>;
  onParameterChange: (key: string, value: string | number) => void;
  onMint: () => void;
  userScript: { code: string; filename: string } | null;
  membershipData: {
    username: string;
    description: string;
    address: string;
  } | null;
}

export const PreviewPage = ({
  workName,
  description,
  price,
  name,
  social,
  intro,
  imageUrl,
  parameters,
  previewParams,
  onParameterChange,
  onMint,
  userScript,
  membershipData
}: PreviewPageProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [alias, setAlias] = useState('');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const mountedRef = useRef(false);

  // Memoize the viewer props
  const viewerProps = useMemo(() => {
    console.log('PreviewPage: Updating viewer props', {
      hasUserScript: !!userScript,
      scriptName: userScript?.filename,
      parameterCount: Object.keys(previewParams).length
    });

    return {
      userScript: userScript ? {
        ...userScript,
        filename: `preview_${userScript.filename}` // Ensure unique filename
      } : null,
      parameters: previewParams,
      onSceneReady: (scene: THREE.Scene) => {
        console.log('PreviewPage: Scene ready');
        sceneRef.current = scene;
      },
      onRendererReady: (renderer: THREE.WebGLRenderer) => {
        console.log('PreviewPage: Renderer ready');
        rendererRef.current = renderer;
      },
      onCameraReady: (camera: THREE.Camera) => {
        console.log('PreviewPage: Camera ready');
        cameraRef.current = camera;
      }
    };
  }, [userScript, previewParams]);

  // Monitor component lifecycle and scene state
  useEffect(() => {
    mountedRef.current = true;
    
    console.log('PreviewPage: Component mounted');
    
    return () => {
      console.log('PreviewPage: Component unmounting');
      mountedRef.current = false;
      
      // Clean up refs
      sceneRef.current = null;
      rendererRef.current = null;
      cameraRef.current = null;
    };
  }, []);

  // Monitor scene state changes
  useEffect(() => {
    if (mountedRef.current) {
      console.log('PreviewPage: Scene state updated', {
        hasScene: !!sceneRef.current,
        hasRenderer: !!rendererRef.current,
        hasCamera: !!cameraRef.current,
        hasUserScript: !!userScript,
        parameters: previewParams
      });
    }
  }, [userScript, previewParams]);
  
  // 自訂的 mint 處理函數
  const handleMintClick = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 顯示提示信息
    setShowTooltip(true);
    
    // 3秒後自動隱藏提示
    return new Promise<void>(resolve => {
      setTimeout(() => {
        if (mountedRef.current) {
          setShowTooltip(false);
        }
        resolve();
      }, 3000);
    });
  }, []);
  
  // Preview mode button state
  const mintButtonState = useMemo(() => ({
    disabled: false,
    tooltip: 'Preview Mode: Click to see how minting works'
  }), []);
  
  // 懸浮提示
  const TooltipOverlay = () => {
    if (!showTooltip) return null;
    
    return (
      <div className="fixed top-6 right-6 bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg z-50 shadow-lg border border-white/20 max-w-sm animation-fadeInOut">
        <div className="font-medium text-white mb-1">Preview Mode Only</div>
        <div className="text-sm text-white/80">
          This is a preview page. Please use the confirmation button in the bottom right corner to continue the upload process.
        </div>
        <style jsx>{`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-10px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
          }
          .animation-fadeInOut {
            animation: fadeInOut 3s ease-in-out forwards;
          }
        `}</style>
      </div>
    );
  };
  
  return (
    <>
      {/* 懸浮提示，放在最外層 */}
      <TooltipOverlay />
      
      <BaseTemplate
        workName={workName}
        description={description}
        price={price}
        author={membershipData?.username || name}
        social={membershipData?.address ? membershipData.address.slice(0, 6) + '...' + membershipData.address.slice(-4) : social}
        intro={membershipData?.description || intro}
        imageUrl={imageUrl}
        parameters={parameters}
        previewParams={previewParams}
        onParameterChange={onParameterChange}
        onMint={handleMintClick}
        mintButtonState={mintButtonState}
        alias={alias}
        onAliasChange={setAlias}
      >
        <DefaultTemplate
          workName={workName}
          description={description}
          price={price}
          author={membershipData?.username || name}
          social={membershipData?.address ? membershipData.address.slice(0, 6) + '...' + membershipData.address.slice(-4) : social}
          intro={membershipData?.description || intro}
          imageUrl={imageUrl}
          parameters={parameters}
          previewParams={previewParams}
          onParameterChange={onParameterChange}
          onMint={handleMintClick}
          mintButtonState={mintButtonState}
          alias={alias}
          onAliasChange={setAlias}
          preview3D={
            <div className="w-full h-full">
              <ParametricViewer 
                key={`preview_${userScript?.filename}`} // Force remount when script changes
                {...viewerProps}
              />
            </div>
          }
        />
      </BaseTemplate>
    </>
  );
}; 