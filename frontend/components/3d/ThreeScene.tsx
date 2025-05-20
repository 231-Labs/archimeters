'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

interface ThreeSceneProps {
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

const ThreeScene = ({ dimensions }: ThreeSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // create camera
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);

    // create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);

    // create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // create cube
    const geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
    const material = new THREE.MeshStandardMaterial({ color: 0xf5f5dc });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // handle window size changes
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
    };
  }, [dimensions]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default ThreeScene; 