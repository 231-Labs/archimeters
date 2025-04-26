'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface UserScript {
  code: string;
  filename: string;
}

interface ParametricSceneProps {
  userScript: UserScript | null;
  parameters?: Record<string, any>;
}

export default function ParametricScene({ userScript, parameters = {} }: ParametricSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);

  // 初始化場景
  useEffect(() => {
    if (!containerRef.current) return;

    // 創建場景
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 創建相機
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // 創建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 創建控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // 添加網格
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // 添加座標軸
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 添加環境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 動畫循環
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // 清理函數
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // 處理視窗大小變化
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 更新幾何體
  useEffect(() => {
    if (!userScript || !sceneRef.current) return;

    try {
      // 移除舊的網格
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
        geometryRef.current?.dispose();
      }

      // 評估用戶代碼
      const createGeometry = new Function('THREE', 'params', `
        ${userScript.code}
        return createGeometry(THREE, params);
      `);

      // 創建新的幾何體
      const geometry = createGeometry(THREE, parameters);
      geometryRef.current = geometry;

      // 創建材質
      const material = new THREE.MeshStandardMaterial({
        color: parameters.color || 0xff3366,
        emissive: parameters.emissive || 0x000000,
        roughness: parameters.roughness || 0.5,
        metalness: parameters.metalness || 0,
        wireframe: parameters.wireframe || false,
        transparent: parameters.opacity !== undefined && parameters.opacity < 1,
        opacity: parameters.opacity || 1.0,
        side: THREE.DoubleSide,
      });

      // 創建網格
      const mesh = new THREE.Mesh(geometry, material);
      sceneRef.current.add(mesh);
      meshRef.current = mesh;

    } catch (error) {
      console.error('Error creating geometry:', error);
    }
  }, [userScript, parameters]);

  return <div ref={containerRef} className="w-full h-full" />;
} 