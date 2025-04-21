'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 定義參數及其默認值
export const defaultParameters = {
  amplitude: {
    type: 'number',
    default: 1,
    label: '振幅',
  },
  frequency: {
    type: 'number',
    default: 1,
    label: '頻率',
  },
  resolution: {
    type: 'number',
    default: 20,
    label: '解析度',
  },
  heightScale: {
    type: 'number',
    default: 1,
    label: '高度縮放test',
  },
  color: {
    type: 'color',
    default: '#f5f5dc',
    label: '顏色',
  },
} as const;

// 從默認參數定義生成參數類型
export type Parameters = {
  [K in keyof typeof defaultParameters]: 
    typeof defaultParameters[K]['type'] extends 'number' ? number :
    typeof defaultParameters[K]['type'] extends 'color' ? string :
    never;
};

export interface ParametricSceneProps {
  parameters: Partial<Parameters>;
}

const ParametricScene = ({ parameters: userParameters }: ParametricSceneProps) => {
  const parameters = {
    ...Object.fromEntries(
      Object.entries(defaultParameters).map(([key, value]) => [key, value.default])
    ),
    ...userParameters
  } as Parameters;

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const surfaceRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 創建場景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // 創建相機
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 10);
    cameraRef.current = camera;

    // 創建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加軌道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // 創建參數化曲面
    const createParametricSurface = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];

      const size = parameters.resolution;
      const step = 10 / size;

      // 生成頂點
      for (let i = 0; i <= size; i++) {
        for (let j = 0; j <= size; j++) {
          const x = i * step - 5;
          const y = j * step - 5;
          const z = parameters.heightScale * parameters.amplitude * Math.sin(
            parameters.frequency * Math.sqrt(x * x + y * y)
          );
          vertices.push(x, z, y);
        }
      }

      // 生成索引
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const a = i * (size + 1) + j;
          const b = a + 1;
          const c = (i + 1) * (size + 1) + j;
          const d = c + 1;

          indices.push(a, b, d);
          indices.push(a, d, c);
        }
      }

      geometry.setIndex(indices);
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        color: parameters.color,
        wireframe: true,
        side: THREE.DoubleSide,
      });

      return new THREE.Mesh(geometry, material);
    };

    const surface = createParametricSurface();
    scene.add(surface);
    surfaceRef.current = surface;

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 動畫循環
    let frameId: number;
    function animate() {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // 處理視窗大小變化
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    // 使用 ResizeObserver 來監聽容器大小變化
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // 清理函數
    return () => {
      cancelAnimationFrame(frameId);
      controls.dispose();
      resizeObserver.disconnect();
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (surfaceRef.current) {
        sceneRef.current?.remove(surfaceRef.current);
        surfaceRef.current.geometry.dispose();
        if (Array.isArray(surfaceRef.current.material)) {
          surfaceRef.current.material.forEach(material => material.dispose());
        } else {
          surfaceRef.current.material.dispose();
        }
      }
      rendererRef.current?.dispose();
    };
  }, [parameters]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default ParametricScene; 