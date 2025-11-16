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

/**
 * UnifiedParametricScene - Universal 3D scene renderer
 * 統一的 3D 場景渲染器
 * 
 * Features:
 * - Supports both static and animated artworks
 * - Intelligent rendering: continuous for animations, on-demand for static
 * - Smooth damping for better control feel
 * - Multi-color vertex support
 * - STL export compatible
 * 
 * 功能：
 * - 支援靜態和動畫作品
 * - 智能渲染：動畫持續渲染，靜態按需渲染
 * - 平滑阻尼，更好的操作手感
 * - 多色頂點支援
 * - 兼容 STL 輸出
 */
export default function UnifiedParametricScene({ 
  userScript, 
  parameters = {}, 
  onSceneReady, 
  onRendererReady, 
  onCameraReady 
}: ParametricSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Object3D | null>(null);
  const hasInitializedRef = useRef(false);
  const animationFrameIdRef = useRef<number>();
  const userAnimateFnRef = useRef<((time: number) => void) | null>(null);
  const clockRef = useRef(new THREE.Clock());
  const isStaticRef = useRef(false); // Track if current artwork is static

  // camera state
  const cameraStateRef = useRef({
    position: new THREE.Vector3(120, 90, 30),
    target: new THREE.Vector3(0, 0, 0)
  });

  // render function for on-demand rendering (static artworks)
  const render = useCallback(() => {
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, []);

  // cleanup all three.js resources
  const cleanupResources = useCallback(() => {
    // cancel animation frame
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = undefined;
    }

    // cleanup controls
    if (controlsRef.current) {
      controlsRef.current.dispose();
      controlsRef.current = null;
    }

    // cleanup mesh/object
    if (meshRef.current) {
      if (meshRef.current instanceof THREE.Mesh) {
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
      if (sceneRef.current) {
        sceneRef.current.remove(meshRef.current);
      }
      meshRef.current = null;
    }

    // cleanup all objects in the scene
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

    // cleanup renderer
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current.forceContextLoss();
      rendererRef.current.domElement.remove();
      rendererRef.current = null;
    }

    // cleanup scene and camera
    sceneRef.current = null;
    cameraRef.current = null;

    // reset initialization flag
    hasInitializedRef.current = false;
    userAnimateFnRef.current = null;
  }, []);

  // cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  // update geometry/scene
  const updateScene = useCallback(() => {
    if (!userScript || !sceneRef.current) {
      console.log('[Unified] Cannot update scene: missing userScript or scene');
      return;
    }

    try {
      console.log('[Unified] Updating scene with parameters:', parameters);
      
      // Remove old mesh/object
      if (meshRef.current) {
        sceneRef.current.remove(meshRef.current);
        if (meshRef.current instanceof THREE.Mesh) {
          if (meshRef.current.geometry) meshRef.current.geometry.dispose();
          if (meshRef.current.material) {
            if (Array.isArray(meshRef.current.material)) {
              meshRef.current.material.forEach(mat => mat.dispose());
            } else {
              meshRef.current.material.dispose();
            }
          }
        }
        meshRef.current = null;
      }

      // Execute user code - try animated scene first, fallback to geometry
      const executeCode = new Function('THREE', 'params', 'scene', `
        ${userScript.code}
        
        // Try to create animated scene
        if (typeof createAnimatedScene === 'function') {
          const result = createAnimatedScene(THREE, params);
          return { 
            object: result.object || result, 
            animate: result.animate || null,
            type: 'animated'
          };
        }
        
        // Fallback to standard geometry
        if (typeof createGeometry === 'function') {
          const geometry = createGeometry(THREE, params);
          
          // Check if geometry has vertex colors
          const hasVertexColors = geometry.getAttribute('color') !== undefined;
          
          const material = new THREE.MeshPhongMaterial({
            color: hasVertexColors ? 0xffffff : (params.color || 0xff3366),
            emissive: params.emissive || 0x000000,
            specular: 0x111111,
            shininess: 30,
            wireframe: false,
            transparent: params.opacity !== undefined && params.opacity < 1,
            opacity: params.opacity || 1.0,
            side: THREE.DoubleSide,
            vertexColors: hasVertexColors, // Enable vertex colors if available
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          
          // Position mesh
          if (geometry.boundingBox === null) {
            geometry.computeBoundingBox();
          }
          const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
          mesh.position.y = height / 2;
          
          return { object: mesh, animate: null, type: 'static' };
        }
        
        throw new Error('No createAnimatedScene or createGeometry function found');
      `);

      const result = executeCode(THREE, parameters, sceneRef.current);
      console.log('[Unified] Scene created, type:', result.type);

      // Add object to scene
      if (result.object) {
        sceneRef.current.add(result.object);
        meshRef.current = result.object;
      }

      // Store animate function if provided
      if (result.animate && typeof result.animate === 'function') {
        userAnimateFnRef.current = result.animate;
        isStaticRef.current = false;
        console.log('[Unified] Animation detected - continuous rendering enabled');
      } else {
        userAnimateFnRef.current = null;
        isStaticRef.current = true;
        console.log('[Unified] Static geometry - on-demand rendering enabled');
        // Render once for static geometry
        render();
      }

    } catch (error) {
      console.error('[Unified] Error updating scene:', error);
    }
  }, [userScript, parameters, render]);

  // initialize scene
  useEffect(() => {
    if (!containerRef.current || hasInitializedRef.current) {
      return;
    }

    console.log('[Unified] Initializing scene');

    // create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // create camera
    const camera = new THREE.PerspectiveCamera(
      50,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.copy(cameraStateRef.current.position);
    camera.lookAt(cameraStateRef.current.target);
    cameraRef.current = camera;

    // create renderer
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

    // create controls with damping for smooth feel
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Always enable damping for better feel
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.target.copy(cameraStateRef.current.target);
    controls.update();
    controlsRef.current = controls;

    // save camera state
    controls.addEventListener('change', () => {
      if (cameraRef.current && controlsRef.current) {
        cameraStateRef.current.position.copy(cameraRef.current.position);
        cameraStateRef.current.target.copy(controlsRef.current.target);
        // For static scenes, render on change
        if (isStaticRef.current) {
          render();
        }
      }
    });

    // For static scenes, trigger continuous rendering during interaction
    let isInteracting = false;
    let interactionFrameId: number | null = null;
    
    controls.addEventListener('start', () => {
      isInteracting = true;
      if (isStaticRef.current) {
        function interactionRender() {
          if (!isInteracting || !controlsRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
            interactionFrameId = null;
            return;
          }
          controlsRef.current.update();
          render();
          interactionFrameId = requestAnimationFrame(interactionRender);
        }
        interactionRender();
      }
    });
    
    controls.addEventListener('end', () => {
      isInteracting = false;
      if (interactionFrameId) {
        cancelAnimationFrame(interactionFrameId);
        interactionFrameId = null;
      }
    });

    // add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // add main light (top right)
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.6);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    // add fill light (side)
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-8, 0, 0);
    scene.add(fillLight);

    // add back light
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 2, -10);
    scene.add(backLight);

    // notify component ready
    if (onCameraReady) onCameraReady(camera);
    if (onRendererReady) onRendererReady(renderer);
    if (onSceneReady) onSceneReady(scene);

    hasInitializedRef.current = true;
    console.log('[Unified] Scene initialization completed');

    // Start animation loop
    const clock = clockRef.current;
    clock.start();

    function animate() {
      if (!hasInitializedRef.current) return;
      
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      if (!controlsRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
        return;
      }
      
      // Update controls (needed for damping)
      controlsRef.current.update();
      
      // Only render if we have an animation function (animated artwork)
      // Static artworks render on-demand via controls.addEventListener('change')
      if (userAnimateFnRef.current) {
        const elapsed = clock.getElapsedTime();
        try {
          userAnimateFnRef.current(elapsed);
        } catch (error) {
          console.error('[Unified] Error in user animate function:', error);
        }
        // Render for animated scenes
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }
    
    animate();
    console.log('[Unified] Render loop started');

    // cleanup function
    return () => {
      console.log('[Unified] Cleaning up scene');
      if (interactionFrameId) {
        cancelAnimationFrame(interactionFrameId);
        interactionFrameId = null;
      }
      if (containerRef.current) {
        cleanupResources();
      }
    };
  }, [onSceneReady, onRendererReady, onCameraReady, cleanupResources, render]);

  // update scene when script or parameters change
  useEffect(() => {
    if (hasInitializedRef.current && sceneRef.current) {
      updateScene();
    }
  }, [updateScene]);

  // Handle window size change
  useEffect(() => {
    function handleResize() {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();

      rendererRef.current.setSize(width, height);
      
      // Render once after resize for static scenes
      if (isStaticRef.current) {
        render();
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [render]);

  return <div ref={containerRef} className="w-full h-full" />;
}

