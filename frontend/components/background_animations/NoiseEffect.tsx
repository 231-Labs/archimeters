'use client';

import { useRef, useEffect, useCallback, memo } from 'react';
import { useDataTheme } from '@/hooks/useDataTheme';

interface NoiseEffectProps {
  staticStarfieldOnly?: boolean;
  glitchLinesOnly?: boolean;
}

function readCosmicPalette() {
  const cs = getComputedStyle(document.documentElement);
  return {
    top: cs.getPropertyValue('--cosmic-sky-top').trim(),
    mid: cs.getPropertyValue('--cosmic-sky-mid').trim(),
    bottom: cs.getPropertyValue('--cosmic-sky-bottom').trim(),
    cool: cs.getPropertyValue('--cosmic-star-cool-rgb').trim(),
    warm: cs.getPropertyValue('--cosmic-star-warm-rgb').trim(),
    scanRgb: cs.getPropertyValue('--cosmic-scanline-rgb').trim(),
    scanAlpha: parseFloat(cs.getPropertyValue('--cosmic-scanline-alpha').trim()) || 0.12,
  };
}

type Star = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  cool: boolean;
};

const NoiseEffect = memo(({ staticStarfieldOnly = false, glitchLinesOnly = false }: NoiseEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number>();
  const resizeObserverRef = useRef<ResizeObserver>();
  const theme = useDataTheme();
  const isLight = theme === 'light';

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

    const makeStars = (w: number, h: number): Star[] => {
      const count = isLight ? 260 : 200;
      return Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * (isLight ? 1.15 : 1.5) + (isLight ? 0.35 : 0.5),
        alpha: Math.random() * (isLight ? 0.5 : 0.65) + (isLight ? 0.2 : 0.15),
        cool: Math.random() < (isLight ? 0.28 : 0.32),
      }));
    };

    let stars = makeStars(canvas.width, canvas.height);
    let palette = readCosmicPalette();
    let frameCount = 0;

    let distortionLines: {
      y: number;
      height: number;
      alpha: number;
      colorShift: boolean;
    }[] = [];

    const drawSkyGradient = (w: number, h: number) => {
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, palette.top);
      g.addColorStop(0.52, palette.mid);
      g.addColorStop(1, palette.bottom);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    const drawScanlines = (w: number, h: number) => {
      if (!staticStarfieldOnly) return;
      const { scanRgb, scanAlpha } = palette;
      ctx.save();
      ctx.strokeStyle = `rgba(${scanRgb}, ${scanAlpha})`;
      ctx.lineWidth = 1;
      const lines = isLight ? [h * 0.31, h * 0.58] : [h * 0.34, h * 0.66];
      for (const y of lines) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();
    };

    const starRgb = (star: Star) => {
      const raw = star.cool ? palette.cool : palette.warm;
      return raw.split(',').map((s) => parseInt(s.trim(), 10));
    };

    const drawNoise = () => {
      frameCount += 1;
      const w = canvas.width;
      const h = canvas.height;
      drawSkyGradient(w, h);

      const twinkleStride = 3;
      if (!glitchLinesOnly) {
        stars.forEach((star) => {
          const [r, g, b] = starRgb(star);
          ctx.fillStyle = `rgba(${r},${g},${b},${star.alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
          ctx.fill();

          if (frameCount % twinkleStride === 0) {
            const tw = isLight ? 0.009 : 0.014;
            star.alpha += (Math.random() - 0.5) * tw;
            const lo = isLight ? 0.12 : 0.08;
            const hi = isLight ? 0.95 : 1;
            star.alpha = Math.min(hi, Math.max(lo, star.alpha));
          }
        });
      }

      drawScanlines(w, h);

      if (!staticStarfieldOnly) {
        distortionLines.forEach(({ y, height: lineH, alpha, colorShift }) => {
          if (colorShift) {
            const gray = 255 * Math.random();
            ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha * (isLight ? 0.35 : 1)})`;
          } else if (isLight) {
            ctx.fillStyle = `rgba(95, 98, 102, ${alpha * 0.2})`;
          } else {
            ctx.fillStyle = `rgba(255,255,255,${alpha})`;
          }
          ctx.fillRect(0, y, w, lineH);
        });
      }
    };

    const animate = () => {
      drawNoise();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const triggerDistortion = (type: 'light' | 'heavy' | 'heavyheavy') => {
      if (staticStarfieldOnly) return;

      const config = {
        light: { count: 3, height: 3, alpha: 0.28, duration: 650, interval: 7200 },
        heavy: { count: 2, height: 30, alpha: 0.09, duration: 200, interval: 3800 },
        heavyheavy: { count: 2, height: 150, alpha: 0.18, duration: 400, interval: 9000 },
      }[type];

      const count = Math.floor(Math.random() * config.count) + 1;
      distortionLines = Array.from({ length: count }, () => ({
        y: Math.floor(Math.random() * canvas.height),
        height: Math.floor(Math.random() * config.height) + config.height,
        alpha: Math.random() * config.alpha + config.alpha,
        colorShift: Math.random() > 0.6,
      }));

      setTimeout(() => {
        distortionLines = [];
      }, config.duration + Math.random() * config.duration);

      setTimeout(() => triggerDistortion(type), Math.random() * config.interval + config.interval);
    };

    resizeObserverRef.current = new ResizeObserver(() => {
      updateCanvasSize();
      palette = readCosmicPalette();
      stars = makeStars(canvas.width, canvas.height);
    });
    resizeObserverRef.current.observe(canvas);

    animate();
    if (!staticStarfieldOnly && !glitchLinesOnly) {
      triggerDistortion('light');
      triggerDistortion('light');
      triggerDistortion('light');
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserverRef.current?.disconnect();
    };
  }, [setupCanvas, staticStarfieldOnly, glitchLinesOnly, isLight]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{
        filter: !staticStarfieldOnly ? (isLight ? 'blur(0.5px) contrast(1.04)' : 'blur(0.8px) contrast(1.1)') : 'none',
        opacity: staticStarfieldOnly ? (isLight ? '0.88' : '0.6') : '1',
      }}
    />
  );
});

NoiseEffect.displayName = 'NoiseEffect';

export default NoiseEffect;
