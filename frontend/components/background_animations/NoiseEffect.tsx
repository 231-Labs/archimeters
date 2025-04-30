'use client';

import { useRef, useEffect, useCallback, memo } from 'react';

interface NoiseEffectProps {
  staticStarfieldOnly?: boolean;
  glitchLinesOnly?: boolean;
}

const NoiseEffect = memo(({ staticStarfieldOnly = false, glitchLinesOnly = false }: NoiseEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver>();

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

    let distortionLines: {
      y: number;
      height: number;
      alpha: number;
      colorShift: boolean;
    }[] = [];

    let stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
    }));

    const drawNoise = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

      // Only draw noise pattern if not in starfield-only mode
      if (!staticStarfieldOnly) {
        const size = 6;
        for (let y = 0; y < height; y += size) {
          for (let x = 0; x < width; x += size) {
            if (Math.random() < 0.02) {
              const gray = Math.floor(Math.random() * 255);
              ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.1)`;
              ctx.fillRect(x, y, size, size);
            }
          }
        }
      }

      // Draw stars if not in glitch-lines-only mode
      if (!glitchLinesOnly) {
        stars.forEach((star) => {
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
          ctx.fill();

          // Twinkling effect
          star.alpha += (Math.random() - 0.5) * 0.05;
          star.alpha = Math.min(1, Math.max(0.1, star.alpha));
        });
      }

      // Draw distortion lines if not in starfield-only mode
      if (!staticStarfieldOnly) {
        distortionLines.forEach(({ y, height: h, alpha, colorShift }) => {
          if (colorShift) {
            const gray = 255 * Math.random();
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          }
          ctx.fillRect(0, y, width, h);
        });
      }
    };

    const animate = () => {
      drawNoise();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const triggerDistortion = (type: 'light' | 'heavy' | 'heavyheavy') => {
      if (staticStarfieldOnly) return; // Don't trigger distortions in starfield-only mode

      const config = {
        light: { count: 3, height: 3, alpha: 0.3, duration: 500, interval: 4000 },
        heavy: { count: 2, height: 30, alpha: 0.1, duration: 150, interval: 2000 },
        heavyheavy: { count: 2, height: 150, alpha: 0.2, duration: 300, interval: 5000 }
      }[type];

      const count = Math.floor(Math.random() * config.count) + 1;
      distortionLines = Array.from({ length: count }, () => ({
        y: Math.floor(Math.random() * height),
        height: Math.floor(Math.random() * config.height) + config.height,
        alpha: Math.random() * config.alpha + config.alpha,
        colorShift: Math.random() > 0.6,
      }));

      setTimeout(() => {
        distortionLines = [];
      }, config.duration + Math.random() * config.duration);

      setTimeout(() => triggerDistortion(type), Math.random() * config.interval + config.interval);
    };

    // Setup resize observer
    resizeObserverRef.current = new ResizeObserver(() => {
      updateCanvasSize();
      // Recreate stars with new dimensions
      stars = Array.from({ length: 200 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
      }));
    });
    resizeObserverRef.current.observe(canvas);

    // Start animations
    animate();
    if (!staticStarfieldOnly && !glitchLinesOnly) {
      triggerDistortion('light');
      triggerDistortion('light');
      triggerDistortion('light');
    }

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [setupCanvas, staticStarfieldOnly, glitchLinesOnly]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ 
        filter: !staticStarfieldOnly ? 'blur(0.8px) contrast(1.1)' : 'none',
        opacity: staticStarfieldOnly ? '0.6' : '1'
      }}
    />
  );
});

NoiseEffect.displayName = 'NoiseEffect';

export default NoiseEffect;
