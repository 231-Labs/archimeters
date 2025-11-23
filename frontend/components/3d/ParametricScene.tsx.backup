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

  // camera state
  const cameraStateRef = useRef({
    position: new THREE.Vector3(120, 90, 30),
    target: new THREE.Vector3(0, 0, 0)
  });

  // render function
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

    // cleanup mesh and material
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

    // cleanup geometry
    if (geometryRef.current) {
      geometryRef.current.dispose();
      geometryRef.current = null;
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
  }, []);

  // cleanup when component unmounts
  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, [cleanupResources]);

  // update geometry without recreating the entire scene
  const updateGeometry = useCallback(() => {
    if (!userScript || !sceneRef.current) {
      console.log('Cannot update geometry: missing userScript or scene');
      return;
    }

    try {
      console.log('Updating geometry with parameters:', parameters);
      
      // evaluate user code
      const createGeometry = new Function('THREE', 'params', `
        ${userScript.code}
        return createGeometry(THREE, params);
      `);

      // create new geometry
      const geometry = createGeometry(THREE, parameters);
      console.log('Geometry created successfully');

      // Check if geometry has vertex colors
      const hasVertexColors = geometry.getAttribute('color') !== undefined;
      console.log('Geometry has vertex colors:', hasVertexColors);

      // if there is an existing mesh, update its geometry and material
      if (meshRef.current) {
        console.log('Updating existing mesh');
        // save old material and geometry
        const oldMaterial = meshRef.current.material;
        const oldGeometry = meshRef.current.geometry;
        
        // create new material based on whether geometry has vertex colors
        const material = new THREE.MeshPhongMaterial({
          color: hasVertexColors ? 0xffffff : (parameters.color || 0xff3366),
          emissive: parameters.emissive || 0x000000,
          specular: 0x111111,
          shininess: 30,
          wireframe: false,
          transparent: parameters.opacity !== undefined && parameters.opacity < 1,
          opacity: parameters.opacity || 1.0,
          side: THREE.DoubleSide,
          vertexColors: hasVertexColors, // Enable vertex colors if available
        });

        // update mesh
        meshRef.current.geometry = geometry;
        meshRef.current.material = material;

        // cleanup old resources
        if (oldGeometry) {
          oldGeometry.dispose();
        }
        if (oldMaterial) {
          if (Array.isArray(oldMaterial)) {
            oldMaterial.forEach(mat => mat.dispose());
          } else {
            oldMaterial.dispose();
          }
        }
      } else {
        console.log('Creating new mesh');
        // if there is no mesh, create a new one
        const material = new THREE.MeshPhongMaterial({
          color: hasVertexColors ? 0xffffff : (parameters.color || 0xff3366),
          emissive: parameters.emissive || 0x000000,
          specular: 0x111111,
          shininess: 30,
          wireframe: false,
          transparent: parameters.opacity !== undefined && parameters.opacity < 1,
          opacity: parameters.opacity || 1.0,
          side: THREE.DoubleSide,
          vertexColors: hasVertexColors, // Enable vertex colors if available
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Position the mesh so it sits on top of the grid
        if (geometry.boundingBox === null) {
          geometry.computeBoundingBox();
        }
        const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
        mesh.position.y = height / 2;
        sceneRef.current.add(mesh);
        meshRef.current = mesh;
      }

      // compute normals to ensure correct lighting
      if (geometry instanceof THREE.BufferGeometry) {
        geometry.computeVertexNormals();
      }

      // ensure renderer updates
      render();

      console.log('Geometry update completed successfully');

    } catch (error) {
      console.error('Error updating geometry:', error);
    }
  }, [userScript, parameters, render]);

  // initialize scene
  useEffect(() => {
    if (!containerRef.current || hasInitializedRef.current) {
      console.log('Scene initialization skipped:', {
        hasContainer: !!containerRef.current,
        isInitialized: hasInitializedRef.current
      });
      return;
    }

    console.log('Initializing scene');

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

    // create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    controls.enableDamping = false; // disable damping, no continuous updates
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.target.copy(cameraStateRef.current.target);
    controls.update();
    controlsRef.current = controls;

    // save camera state and trigger render
    controls.addEventListener('change', () => {
      if (cameraRef.current && controlsRef.current) {
        cameraStateRef.current.position.copy(cameraRef.current.position);
        cameraStateRef.current.target.copy(controlsRef.current.target);
        render();
      }
    });

    // simulate continuous rendering (only during interaction)
    let isControlActive = false;
    let interactionFrameId: number | null = null;
    controls.addEventListener('start', () => {
      isControlActive = true;
      function interactionRender() {
        if (!isControlActive || !controlsRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
          interactionFrameId = null;
          return;
        }
        controlsRef.current.update();
        render();
        interactionFrameId = requestAnimationFrame(interactionRender);
      }
      interactionRender();
    });
    controls.addEventListener('end', () => {
      isControlActive = false;
      if (interactionFrameId) {
        cancelAnimationFrame(interactionFrameId);
        interactionFrameId = null;
      }
    });

  //   // add grid
  //   const gridHelper = new THREE.GridHelper(60, 60);
  //   scene.add(gridHelper);

  //  // add axes
  //   const axesHelper = new THREE.AxesHelper(8);
  //   scene.add(axesHelper);

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
    console.log('Scene initialization completed');

    // let isAnimating = true;

    // animation loop
    // function animate() {
    //   if (!isAnimating) return;

    //   if (!controlsRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) {
    //     console.log('Animation frame skipped: missing required refs');
    //     return;
    //   }
      
    //   animationFrameIdRef.current = requestAnimationFrame(animate);
    //   controlsRef.current.update();
    //   render();
    // }
    // animate();

    // initial render
    render();

    // cleanup function
    return () => {
      console.log('Cleaning up scene');
      if (interactionFrameId) {
        cancelAnimationFrame(interactionFrameId);
        interactionFrameId = null;
      }
      // only cleanup resources when the component is actually unmounted
      if (containerRef.current) {
        cleanupResources();
      }
    };
  }, [onSceneReady, onRendererReady, onCameraReady, cleanupResources, render]);

  // update geometry
  useEffect(() => {
    console.log('Geometry update effect triggered', {
      hasInitialized: hasInitializedRef.current,
      hasUserScript: !!userScript,
      hasScene: !!sceneRef.current
    });
    
    if (hasInitializedRef.current && sceneRef.current) {
      updateGeometry();
    }
  }, [updateGeometry]);

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

  return <div ref={containerRef} className="w-full h-full" />;
} 