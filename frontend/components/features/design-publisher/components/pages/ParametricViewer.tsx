import React, { useEffect, useRef, useMemo, memo } from 'react';
import ParametricScene from '@/components/3d/ParametricScene';
import * as THREE from 'three';

interface ParametricViewerProps {
  userScript: {
    code: string;
    filename: string;
  } | null;
  parameters: Record<string, any>;
  className?: string;
  onSceneReady?: (scene: THREE.Scene) => void;
  onRendererReady?: (renderer: THREE.WebGLRenderer) => void;
  onCameraReady?: (camera: THREE.Camera) => void;
}

/**
 * 共用的參數化模型查看器組件，可用於不同頁面之間共享相同的3D渲染功能
 */
export const ParametricViewer: React.FC<ParametricViewerProps> = memo(
  function ParametricViewer({
    userScript,
    parameters,
    className = 'w-full h-full rounded-lg overflow-hidden bg-black/30',
    onSceneReady,
    onRendererReady,
    onCameraReady
  }) {
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.Camera | null>(null);
    const errorRef = useRef<string | null>(null);

  // Memoize the scene callbacks
  const callbacks = useMemo(
      () => ({
        onSceneReady: (scene: THREE.Scene) => {
          console.log('ParametricViewer: Scene ready:', scene);
          sceneRef.current = scene;
          onSceneReady?.(scene);
        },
        onRendererReady: (renderer: THREE.WebGLRenderer) => {
          console.log('ParametricViewer: Renderer ready:', renderer);
          rendererRef.current = renderer;
          onRendererReady?.(renderer);
        },
        onCameraReady: (camera: THREE.Camera) => {
          console.log('ParametricViewer: Camera ready:', camera);
          cameraRef.current = camera;
          onCameraReady?.(camera);
        },
        onError: (error: string) => {
          console.error('ParametricViewer: ParametricScene error:', error);
          errorRef.current = error;
        },
      }),
      [onSceneReady, onRendererReady, onCameraReady]
    );

    // Log initialization and cleanup
    useEffect(() => {
      console.log('ParametricViewer initialized:', {
        userScript: userScript?.filename,
        parametersCount: Object.keys(parameters).length,
        className,
      });

      return () => {
        console.log('ParametricViewer unmounted');
      };
    }, []);

    useEffect(() => {
      console.log('ParametricViewer props updated:', {
        userScript: userScript?.filename,
        parameters,
      });
    }, [userScript, parameters]);

    if (!userScript) {
      return (
        <div className={`${className} flex items-center justify-center text-white/50`}>
          No geometry script provided
        </div>
      );
    }

    if (errorRef.current) {
      console.warn('ParametricViewer: Rendering error state:', errorRef.current);
      return (
        <div className={`${className} flex items-center justify-center text-red-500`}>
          Error rendering 3D model: {errorRef.current}
        </div>
      );
    }
    return (
      <div className={className} style={{ minHeight: '400px' }}>
        <ParametricScene
          userScript={userScript}
          parameters={parameters}
          {...callbacks}
        />
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
      prevProps.className === nextProps.className
    );
  }
);
