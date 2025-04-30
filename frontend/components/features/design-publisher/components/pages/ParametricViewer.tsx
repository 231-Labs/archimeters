import React, { useEffect, useRef, useMemo } from 'react';
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
export const ParametricViewer: React.FC<ParametricViewerProps> = ({
  userScript,
  parameters,
  className = "h-full rounded-lg overflow-hidden bg-black/30",
  onSceneReady,
  onRendererReady,
  onCameraReady
}) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

  // Memoize the scene callbacks
  const callbacks = useMemo(() => ({
    onSceneReady: (scene: THREE.Scene) => {
      console.log('Scene ready callback triggered');
      sceneRef.current = scene;
      if (onSceneReady) {
        onSceneReady(scene);
      }
    },
    onRendererReady: (renderer: THREE.WebGLRenderer) => {
      console.log('Renderer ready callback triggered');
      rendererRef.current = renderer;
      if (onRendererReady) {
        onRendererReady(renderer);
      }
    },
    onCameraReady: (camera: THREE.Camera) => {
      console.log('Camera ready callback triggered');
      cameraRef.current = camera;
      if (onCameraReady) {
        onCameraReady(camera);
      }
    }
  }), [onSceneReady, onRendererReady, onCameraReady]);

  // Monitor scene state
  useEffect(() => {
    console.log('ParametricViewer scene state:', {
      hasScene: !!sceneRef.current,
      hasRenderer: !!rendererRef.current,
      hasCamera: !!cameraRef.current,
      hasUserScript: !!userScript,
      parameters
    });
  }, [userScript, parameters]);

  if (!userScript) {
    return (
      <div className={className}>
        <div className="flex h-full items-center justify-center text-white/50">
          No geometry script provided
        </div>
      </div>
    );
  }
  
  console.log(`ParametricViewer rendering ${userScript.filename} with parameters:`, parameters);
  
  return (
    <div className={className}>
      <ParametricScene 
        key={userScript.filename} // Force remount when script changes
        userScript={userScript} 
        parameters={parameters}
        {...callbacks}
      />
    </div>
  );
}; 