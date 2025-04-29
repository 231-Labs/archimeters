'use client';

import { useRef, useEffect } from 'react';

const GalaxyEffect3D = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    let distortionLines: {
      y: number;
      height: number;
      alpha: number;
      colorShift: boolean;
    }[] = [];

    let stars: { x: number; y: number; size: number; alpha: number }[] = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
    }));

    const drawNoise = () => {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);

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

      // 星星閃爍
      stars.forEach((star, index) => {
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
        ctx.fill();

        // 閃爍效果
        star.alpha += (Math.random() - 0.5) * 0.05;
        star.alpha = Math.min(1, Math.max(0.1, star.alpha));
      });

      // 干擾條紋
      distortionLines.forEach(({ y, height: h, alpha, colorShift }) => {
        if (colorShift) {
          const gray = 255 * Math.random();
          ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        }
        ctx.fillRect(0, y, width, h);
      });
    };

    const animate = () => {
      drawNoise();
      requestAnimationFrame(animate);
    };

    animate();

    const triggerDistortionlight = () => {
      const count = Math.floor(Math.random() * 3) + 1;
      distortionLines = Array.from({ length: count }, () => ({
        y: Math.floor(Math.random() * height),
        height: Math.floor(Math.random() * 3) + 3,
        alpha: Math.random() * 0.3 + 0.1,
        colorShift: Math.random() > 1,
      }));

      setTimeout(() => {
        distortionLines = [];
      }, 500 + Math.random() * 2000);

      const next = Math.random() * 4000 + 4000;
      setTimeout(triggerDistortionlight, next);
    };

    const triggerDistortionheavy = () => {
      const count = Math.floor(Math.random() * 2) + 1;
      distortionLines = Array.from({ length: count }, () => ({
        y: Math.floor(Math.random() * height),
        height: Math.floor(Math.random() * 30) + 10,
        alpha: Math.random() * 0.1 + 0.1,
        colorShift: Math.random() > 0.6,
      }));

      setTimeout(() => {
        distortionLines = [];
      }, 150 + Math.random() * 400);

      const next = Math.random() * 4000 + 2000;
      setTimeout(triggerDistortionheavy, next);
    };

    const triggerDistortionheavyheavy = () => {
      const count = Math.floor(Math.random() * 2) + 1;
      distortionLines = Array.from({ length: count }, () => ({
        y: Math.floor(Math.random() * height),
        height: Math.floor(Math.random() * 150) + 150,
        alpha: Math.random() * 0.2 + 0.2,
        colorShift: Math.random() > 0.4,
      }));

      setTimeout(() => {
        distortionLines = [];
      }, 300 + Math.random() * 1000);

      const next = Math.random() * 10000 + 5000;
      setTimeout(triggerDistortionheavyheavy, next);
    };

    triggerDistortionlight();
    triggerDistortionlight();
    triggerDistortionlight();
    triggerDistortionlight();
    // triggerDistortionheavy();
    // triggerDistortionheavyheavy();

    return () => {};
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      style={{ filter: 'blur(0.8px) contrast(1.1)' }}
    />
  );
};

export default GalaxyEffect3D;
