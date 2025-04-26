'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface GeometryScript {
  code: string;
  filename: string;
}

export interface ParametricSceneProps {
  userScript: GeometryScript | null;
}

const ParametricScene = ({ userScript }: ParametricSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  // 初始化場景、相機和控制器
  useEffect(() => {
    if (!containerRef.current) return;

    // 創建場景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // 創建相機
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 創建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加軌道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 添加環境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加點光源
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // 添加網格輔助線
    const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x444444);
    scene.add(gridHelper);

    // 添加座標軸
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 動畫循環
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // 處理視窗大小變化
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current?.clientWidth || 1;
      const height = containerRef.current?.clientHeight || 1;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    // 使用 ResizeObserver 監控容器大小變化
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 清理函數
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      resizeObserver.disconnect();
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []);

  // 處理用戶腳本
  useEffect(() => {
    if (!sceneRef.current || !userScript) return;

    try {
      // 移除現有的幾何體
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
        if (geometryRef.current) {
          geometryRef.current.dispose();
        }
        if (meshRef.current.material instanceof THREE.Material) {
          meshRef.current.material.dispose();
        } else if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach(m => m.dispose());
        }
      }

      // 準備執行環境
      const scriptContent = `
        ${userScript.code}
        return createGeometry(THREE);
      `;

      // 創建一個安全的執行環境並執行代碼
      const createGeometry = new Function('THREE', scriptContent);
      const geometry = createGeometry(THREE);

      if (!(geometry instanceof THREE.BufferGeometry)) {
        throw new Error('腳本必須返回一個 Three.js 幾何體');
      }

      // 創建材質和網格
      const material = new THREE.MeshStandardMaterial({
        color: 0x3366ff,
        metalness: 0.5,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      sceneRef.current.add(mesh);
      
      // 保存引用以便清理
      geometryRef.current = geometry;
      meshRef.current = mesh;

      // 觸發一次渲染
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }

    } catch (error) {
      console.error('執行幾何體腳本時出錯:', error);
    }
  }, [userScript]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default ParametricScene; 