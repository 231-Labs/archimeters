import { useState } from 'react';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { ExportFormat } from '../types';

export const useSceneExport = () => {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('glb');

  const exportSceneToGLB = (scene: THREE.Scene, fileName: string): Promise<File> => {
    return new Promise<File>((resolve, reject) => {
      const exporter = new GLTFExporter();
      exporter.parse(
        scene,
        (result) => {
          const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' });
          const file = new File([blob], `${fileName}.glb`, { type: 'model/gltf-binary' });
          resolve(file);
        },
        (error) => reject(error),
        {
          binary: true,
          onlyVisible: true,
          truncateDrawRange: true,
        }
      );
    });
  };

  const exportSceneToSTL = (scene: THREE.Scene, fileName: string): Promise<File> => {
    return new Promise<File>((resolve, reject) => {
      try {
        const exporter = new STLExporter();
        const result = exporter.parse(scene, { binary: true });
        const sourceBuffer = result instanceof DataView ? result.buffer : result;
        const sourceArray = new Uint8Array(sourceBuffer as ArrayBuffer);
        const buffer = new ArrayBuffer(sourceArray.byteLength);
        const targetArray = new Uint8Array(buffer);
        targetArray.set(sourceArray);
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const file = new File([blob], `${fileName}.stl`, { type: 'application/octet-stream' });
        resolve(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  const exportScene = async (scene: THREE.Scene, fileName: string, format: ExportFormat): Promise<File> => {
    if (format === 'glb') {
      return exportSceneToGLB(scene, fileName);
    } else {
      return exportSceneToSTL(scene, fileName);
    }
  };

  return {
    exportFormat,
    setExportFormat,
    exportScene,
  };
};

