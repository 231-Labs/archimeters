'use client';

import { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface UserScript {
  code: string;
  filename: string;
}

interface ParametricSceneProps {
  userScript: UserScript | null;
  parameters?: Record<string, any>;
  onSceneReady?: (scene: THREE.Scene) => void;
  onRendererReady?: (renderer: THREE.WebGLRenderer) => void;
  onCameraReady?: (camera: THREE.Camera) => void;
}

export default function ParametricScene({ userScript, parameters = {}, onSceneReady, onRendererReady, onCameraReady }: ParametricSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const hasInitializedRef = useRef(false);
  const animationFrameIdRef = useRef<number>();

  // 相機位置持久化
  const cameraStateRef = useRef({
    position: new THREE.Vector3(8, 8, 8),
    target: new THREE.Vector3(0, 0, 0)
  });

  // 清理所有 Three.js 資源
  const cleanupResources = useCallback(() => {
    // 取消動畫幀
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = undefined;
    }

    // 清理控制器
    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }

    // 清理網格和材質
    if (meshRef.current) {
      if (meshRef.current.geometry) {
        meshRef.current.geometry.dispose();
      }
      if (meshRef.current.material) {
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach(mat => mat.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }
      if (sceneRef.current) {
        sceneRef.current.remove(meshRef.current);
      }
      meshRef.current = null;
    }

    // 清理幾何體
    if (geometryRef.current) {
      geometryRef.current.dispose();
      geometryRef.current = null;
    }

    // 清理場景中的所有物體
    if (sceneRef.current) {
      while(sceneRef.current.children.length > 0) {
        const object = sceneRef.current.children[0];
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
        sceneRef.current.remove(object);
      }
    }

    // 清理渲染器
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current.forceContextLoss();
      rendererRef.current.domElement.remove();
      rendererRef.current = null;
    }

    // 清理場景和相機
    sceneRef.current = null;
    cameraRef.current = null;

    // 重置初始化標誌
    hasInitializedRef.current = false;
  }, []);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  // 初始化場景
  useEffect(() => {
    if (!containerRef.current || hasInitializedRef.current) {
      return;
    }

    // 確保在重新初始化之前清理舊的資源
    cleanupResources();

    // 創建場景
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 創建相機
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.copy(cameraStateRef.current.position);
    camera.lookAt(cameraStateRef.current.target);
    cameraRef.current = camera;

    // 創建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      preserveDrawingBuffer: true,
      alpha: true
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 創建控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.target.copy(cameraStateRef.current.target);
    controls.update();

    // 保存相機狀態
    controls.addEventListener('change', () => {
      if (camera) {
        cameraStateRef.current.position.copy(camera.position);
        cameraStateRef.current.target.copy(controls.target);
      }
    });

    controlsRef.current = controls;

    // 添加網格
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // 添加座標軸
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // 添加環境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // 添加主要方向光（右上方）
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // 添加填充光（側面）
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-8, 0, 0);
    scene.add(fillLight);

    // 添加背光
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 2, -10);
    scene.add(backLight);

    // 通知組件準備就緒
    if (onCameraReady) onCameraReady(camera);
    if (onRendererReady) onRendererReady(renderer);
    if (onSceneReady) onSceneReady(scene);

    hasInitializedRef.current = true;

    // 動畫循環
    function animate() {
      if (!controlsRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
      controlsRef.current.update();
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    animate();

    // 清理函數
    return () => {
      cleanupResources();
    };
  }, [onSceneReady, onRendererReady, onCameraReady, cleanupResources]);

  // Handle window size change
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

  // Update geometry
  useEffect(() => {
    if (!userScript || !sceneRef.current) return;

    try {
      // Remove old mesh
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
        if (meshRef.current.geometry) {
          meshRef.current.geometry.dispose();
        }
        if (meshRef.current.material) {
          if (Array.isArray(meshRef.current.material)) {
            meshRef.current.material.forEach(mat => mat.dispose());
          } else {
            meshRef.current.material.dispose();
          }
        }
      }

      // Evaluate user code
      const createGeometry = new Function('THREE', 'params', `
        ${userScript.code}
        return createGeometry(THREE, params);
      `);

      // Create new geometry
      const geometry = createGeometry(THREE, parameters);

      // Create material
      const material = new THREE.MeshPhongMaterial({
        color: parameters.color || 0xff3366,
        emissive: parameters.emissive || 0x000000,
        specular: 0x111111,
        shininess: 30,
        wireframe: false,
        transparent: parameters.opacity !== undefined && parameters.opacity < 1,
        opacity: parameters.opacity || 1.0,
        side: THREE.DoubleSide,
      });

      // Create mesh
      const mesh = new THREE.Mesh(geometry, material);
      
      // 計算法線以確保正確的光照
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.computeVertexNormals();
      }

      // 添加陰影
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      sceneRef.current.add(mesh);
      meshRef.current = mesh;

      // 確保渲染器更新
      if (rendererRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current!);
      }

    } catch (error) {
      console.error('Error creating geometry:', error);
    }
  }, [userScript, parameters]);

  return <div ref={containerRef} className="w-full h-full" />;
} 