'use client';

import { useRef, useEffect, useCallback, memo } from 'react';
import { useDataTheme } from '@/hooks/useDataTheme';

type GalaxyProps = {
  paused: boolean;
  baseSpeed: number;
};

function readCosmicPalette() {
  const cs = getComputedStyle(document.documentElement);
  return {
    top: cs.getPropertyValue('--cosmic-sky-top').trim(),
    mid: cs.getPropertyValue('--cosmic-sky-mid').trim(),
    bottom: cs.getPropertyValue('--cosmic-sky-bottom').trim(),
    cool: cs.getPropertyValue('--cosmic-star-cool-rgb').trim(),
    warm: cs.getPropertyValue('--cosmic-star-warm-rgb').trim(),
  };
}

const GalaxyEffect = memo(({ paused, baseSpeed }: GalaxyProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const speedRef = useRef(baseSpeed);
  const theme = useDataTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    speedRef.current = paused ? 0 : baseSpeed;
  }, [paused, baseSpeed]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

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

    const numStars = 5000;
    const depth = 1000;

    let stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() * 2 - 1) * depth,
      y: (Math.random() * 2 - 1) * depth,
      z: Math.random() * depth,
      size: Math.random() * 2 + 1,
      cool: Math.random() < (isLight ? 0.22 : 0.2),
    }));

    let palette = readCosmicPalette();

    const onMouseMove = (e: MouseEvent) => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      mouseRef.current = {
        x: x / width,
        y: y / height,
      };
    };

    const starRgb = (cool: boolean) => {
      const raw = cool ? palette.cool : palette.warm;
      return raw.split(',').map((s) => parseInt(s.trim(), 10));
    };

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      const g = ctx.createLinearGradient(0, 0, 0, height);
      g.addColorStop(0, palette.top);
      g.addColorStop(0.48, palette.mid);
      g.addColorStop(1, palette.bottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);

      rotationRef.current.x += (mouseRef.current.y * 0.05 - rotationRef.current.x) * 0.05;
      rotationRef.current.y += (mouseRef.current.x * 0.05 - rotationRef.current.y) * 0.05;

      const { x: rotationX, y: rotationY } = rotationRef.current;

      for (const star of stars) {
        star.z -= speedRef.current;
        if (star.z <= 1) {
          star.z = depth;
          star.x = (Math.random() * 2 - 1) * depth;
          star.y = (Math.random() * 2 - 1) * depth;
          star.cool = Math.random() < (isLight ? 0.22 : 0.2);
        }

        const cosRY = Math.cos(rotationY);
        const sinRY = Math.sin(rotationY);
        const cosRX = Math.cos(rotationX);
        const sinRX = Math.sin(rotationX);

        let x = star.x;
        let y = star.y;
        let z = star.z;

        let dx = cosRY * x - sinRY * z;
        let dz = sinRY * x + cosRY * z;
        x = dx;
        z = dz;

        let dy = cosRX * y - sinRX * z;
        dz = sinRX * y + cosRX * z;
        y = dy;
        z = dz;

        const k = 400;
        const sx = (x / z) * k + centerX;
        const sy = (y / z) * k + centerY;
        const r = ((1 - z / depth) ** 2) * star.size * 2;

        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          const depthA = Math.min(1, 1 - z / depth + 0.2);
          const [cr, cg, cb] = starRgb(star.cool);
          ctx.beginPath();
          ctx.globalAlpha = isLight ? Math.min(1, depthA * 0.88 + 0.08) : depthA;
          ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    resizeObserverRef.current = new ResizeObserver(() => {
      updateCanvasSize();
      palette = readCosmicPalette();
      stars = Array.from({ length: numStars }, () => ({
        x: (Math.random() * 2 - 1) * depth,
        y: (Math.random() * 2 - 1) * depth,
        z: Math.random() * depth,
        size: Math.random() * 2 + 1,
        cool: Math.random() < (isLight ? 0.22 : 0.2),
      }));
    });
    resizeObserverRef.current.observe(canvas);

    window.addEventListener('mousemove', onMouseMove);

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserverRef.current?.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [setupCanvas, isLight]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full z-0 pointer-events-none ${isLight ? 'opacity-75' : 'opacity-70'}`}
    />
  );
});

GalaxyEffect.displayName = 'GalaxyEffect';

export default GalaxyEffect;
