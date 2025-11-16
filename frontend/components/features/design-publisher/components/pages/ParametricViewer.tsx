import React, { useEffect, useRef, useMemo, memo } from 'react';
import ParametricScene from '@/components/3d/ParametricScene';
import AnimatedParametricScene from '@/components/3d/AnimatedParametricScene';
import * as THREE from 'three';

interface ParametricViewerProps {
  userScript: {
    code: string;
    filename: string;
  } | null;
  parameters: Record<string, any>;
  isPrintable?: boolean; // true = use static renderer, false = use animated renderer
  className?: string;
  onSceneReady?: (scene: THREE.Scene) => void;
  onRendererReady?: (renderer: THREE.WebGLRenderer) => void;
  onCameraReady?: (camera: THREE.Camera) => void;
}

export const ParametricViewer: React.FC<ParametricViewerProps> = memo(
  function ParametricViewer({
    userScript,
    parameters,
    isPrintable = true,
    className = 'w-full h-full rounded-lg overflow-hidden bg-black/30',
    onSceneReady,
    onRendererReady,
    onCameraReady
  }) {
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.Camera | null>(null);
    const errorRef = useRef<string | null>(null);

  const callbacks = useMemo(
      () => ({
        onSceneReady: (scene: THREE.Scene) => {
          sceneRef.current = scene;
          onSceneReady?.(scene);
        },
        onRendererReady: (renderer: THREE.WebGLRenderer) => {
          rendererRef.current = renderer;
          onRendererReady?.(renderer);
        },
        onCameraReady: (camera: THREE.Camera) => {
          cameraRef.current = camera;
          onCameraReady?.(camera);
        },
        onError: (error: string) => {
          errorRef.current = error;
        },
      }),
      [onSceneReady, onRendererReady, onCameraReady]
    );

    if (!userScript) {
      return (
        <div className={`${className} flex items-center justify-center text-white/50`}>
          No geometry script provided
        </div>
      );
    }

    if (errorRef.current) {
      return (
        <div className={`${className} flex items-center justify-center text-red-500`}>
          Error rendering 3D model: {errorRef.current}
        </div>
      );
    }
    // Choose renderer based on isPrintable flag
    const SceneComponent = isPrintable ? ParametricScene : AnimatedParametricScene;
    
    return (
      <div className={className} style={{ minHeight: '400px' }}>
        <SceneComponent
          userScript={userScript}
          parameters={parameters}
          {...callbacks}
        />
        {/* Debug indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[9px] font-mono text-white/60">
            {isPrintable ? '3D STATIC' : '2D ANIMATED'}
          </div>
        )}
      </div>
    );
  },
  // Custom comparison for memo
  (prevProps, nextProps) => {
    const userScriptEqual =
      prevProps.userScript?.code === nextProps.userScript?.code &&
      prevProps.userScript?.filename === nextProps.userScript?.filename;

    const parametersEqual =
      JSON.stringify(prevProps.parameters) === JSON.stringify(nextProps.parameters);

    return (
      userScriptEqual &&
      parametersEqual &&
      prevProps.className === nextProps.className &&
      prevProps.isPrintable === nextProps.isPrintable
    );
  }
);
