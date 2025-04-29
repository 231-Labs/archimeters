import React, { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (sceneRef.current && onSceneReady) {
      onSceneReady(sceneRef.current);
    }
  }, [onSceneReady]);

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
        userScript={userScript} 
        parameters={parameters}
        onSceneReady={(scene) => {
          sceneRef.current = scene;
          if (onSceneReady) {
            onSceneReady(scene);
          }
        }}
        onRendererReady={onRendererReady}
        onCameraReady={onCameraReady}
      />
    </div>
  );
}; 