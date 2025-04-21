'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Define parameters and their default values
export const defaultParameters = {
  amplitude: {
    type: 'number',
    default: 1,
    label: 'Amplitude',
  },
  frequency: {
    type: 'number',
    default: 1,
    label: 'Frequency',
  },
  resolution: {
    type: 'number',
    default: 20,
    label: 'Resolution',
  },
  heightScale: {
    type: 'number',
    default: 1,
    label: 'Height Scale',
  },
  color: {
    type: 'color',
    default: '#f5f5dc',
    label: 'Color',
  },
} as const;

// Generate parameter types from default parameter definitions
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
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize scene, camera, and controls - runs once when component mounts
  useEffect(() => {
    if (!containerRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 10);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // Animation loop
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current?.clientWidth || 1;
      const height = containerRef.current?.clientHeight || 1;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    // Use ResizeObserver to monitor container size changes
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup function
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
  }, []); // Empty dependency array - runs once on mount

  // Update parametric surface - runs when parameters change
  useEffect(() => {
    if (!sceneRef.current) return;

    // Remove old surface
    if (surfaceRef.current) {
      sceneRef.current.remove(surfaceRef.current);
      surfaceRef.current.geometry.dispose();
      if (Array.isArray(surfaceRef.current.material)) {
        surfaceRef.current.material.forEach(material => material.dispose());
      } else {
        surfaceRef.current.material.dispose();
      }
    }

    // Create parametric surface
    const createParametricSurface = () => {
      const geometry = new THREE.BufferGeometry();
      const vertices = [];
      const indices = [];

      const size = parameters.resolution;
      const step = 10 / size;

      // Generate vertices
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

      // Generate indices
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
    sceneRef.current.add(surface);
    surfaceRef.current = surface;
    
    // Trigger a render
    if (cameraRef.current && rendererRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [parameters]); // Only runs when parameters change

  return <div ref={containerRef} className="w-full h-full" />;
};

export default ParametricScene; 