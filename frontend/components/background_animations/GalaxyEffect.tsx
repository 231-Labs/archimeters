'use client';

import { useRef, useEffect, useCallback, memo } from 'react';

type GalaxyProps = {
  paused: boolean;
  baseSpeed: number;
};

const GalaxyEffect = memo(({ paused, baseSpeed }: GalaxyProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
    const speedRef = useRef(baseSpeed);


   // ⭐ 每當 paused 改變，就同步到 speedRef
  useEffect(() => {
    speedRef.current = paused ? 0 : baseSpeed;
  }, [paused, baseSpeed]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Set canvas size
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();

    return { ctx, canvas, updateCanvasSize };
  }, []);

  useEffect(() => {
    const setup = setupCanvas();
    if (!setup) return;
    const { ctx, canvas, updateCanvasSize } = setup;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    const numStars = 5000;
    const depth = 1000;

    // Initialize stars
    let stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() * 2 - 1) * depth,
      y: (Math.random() * 2 - 1) * depth,
      z: Math.random() * depth,
      size: Math.random() * 2 + 1,
    }));

    // Mouse movement handler
    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      mouseRef.current = {
        x: x / width,
        y: y / height
      };
    };

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // Smooth rotation control
      rotationRef.current.x += (mouseRef.current.y * 0.05 - rotationRef.current.x) * 0.05;
      rotationRef.current.y += (mouseRef.current.x * 0.05 - rotationRef.current.y) * 0.05;

      const { x: rotationX, y: rotationY } = rotationRef.current;

      for (let star of stars) {
        // Slow star movement
        star.z -= speedRef.current;
        if (star.z <= 1) {
          star.z = depth;
          star.x = (Math.random() * 2 - 1) * depth;
          star.y = (Math.random() * 2 - 1) * depth;
        }

        // Apply rotation transform (3D simulation)
        const cosRY = Math.cos(rotationY);
        const sinRY = Math.sin(rotationY);
        const cosRX = Math.cos(rotationX);
        const sinRX = Math.sin(rotationX);

        let x = star.x;
        let y = star.y;
        let z = star.z;

        // Y-axis rotation
        let dx = cosRY * x - sinRY * z;
        let dz = sinRY * x + cosRY * z;
        x = dx;
        z = dz;

        // X-axis rotation
        let dy = cosRX * y - sinRX * z;
        dz = sinRX * y + cosRX * z;
        y = dy;
        z = dz;

        // Projection calculation
        const k = 400; // Focal length
        const sx = (x / z) * k + centerX;
        const sy = (y / z) * k + centerY;
        const r = ((1 - z / depth) ** 2) * star.size * 2;

        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          ctx.beginPath();
          ctx.globalAlpha = Math.min(1, 1 - z / depth + 0.2);
          ctx.fillStyle = '#ffffff';
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Setup resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      updateCanvasSize();
      // Recreate stars with new dimensions
      stars = Array.from({ length: numStars }, () => ({
        x: (Math.random() * 2 - 1) * depth,
        y: (Math.random() * 2 - 1) * depth,
        z: Math.random() * depth,
        size: Math.random() * 2 + 1,
      }));
    });
    resizeObserverRef.current.observe(canvas);

    // Add event listeners
    window.addEventListener('mousemove', onMouseMove);

    // Start animation
    draw();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [setupCanvas]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 opacity-70 pointer-events-none"
    />
  );
});

GalaxyEffect.displayName = 'GalaxyEffect';

export default GalaxyEffect;