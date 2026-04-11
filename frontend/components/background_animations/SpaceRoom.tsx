'use client';

import { useRef, useEffect, useCallback, memo } from 'react';
import { useDataTheme } from '@/hooks/useDataTheme';
import './SpaceRoom.css';

const SpaceRoom = memo(() => {
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

    const drawLeftWall = (width: number, height: number) => {
      const wallFrontBottom = { x: 0, y: height };
      const wallFrontTop = { x: 0, y: 26 };
      const wallBackTop = { x: width * 0.15, y: 26 };
      const wallBackBottom = { x: width * 0.4, y: height * 0.85 };

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = isLight ? 'rgba(88, 90, 92, 0.26)' : 'white';
      ctx.lineWidth = isLight ? 1.5 : 2;
      ctx.globalAlpha = isLight ? 0.85 : 0.6;

      ctx.beginPath();
      ctx.moveTo(wallFrontBottom.x, wallFrontBottom.y);
      ctx.lineTo(wallFrontTop.x, wallFrontTop.y);
      ctx.lineTo(wallBackTop.x, wallBackTop.y);
      ctx.lineTo(wallBackBottom.x, wallBackBottom.y);
      ctx.closePath();

      const leftGradient = ctx.createLinearGradient(wallBackBottom.x, 0, wallFrontBottom.x, 0);
      if (isLight) {
        leftGradient.addColorStop(0, 'rgba(198, 198, 196, 0.4)');
        leftGradient.addColorStop(1, 'rgba(175, 175, 172, 0.16)');
      } else {
        leftGradient.addColorStop(0, 'rgba(120, 120, 129, 1)');
        leftGradient.addColorStop(1, 'rgba(76, 76, 104, 0.4)');
      }
      ctx.fillStyle = leftGradient;
      ctx.fill();
      ctx.stroke();

      const rightBoundarySlope = (wallBackBottom.y - wallBackTop.y) / (wallBackBottom.x - wallBackTop.x);
      const rightBoundaryIntercept = wallBackTop.y - rightBoundarySlope * wallBackTop.x;
      const getRightBoundaryY = (x: number) => rightBoundarySlope * x + rightBoundaryIntercept;

      const verticalLines = 20;
      for (let i = 0; i <= verticalLines; i++) {
        const tLinear = i / verticalLines;
        const t = Math.sqrt(tLinear);

        const x = wallFrontBottom.x + t * (wallBackBottom.x - wallFrontBottom.x);
        const yBottom = wallFrontBottom.y + t * (wallBackBottom.y - wallFrontBottom.y);

        if (x <= wallBackBottom.x) {
          const rightBoundaryY = getRightBoundaryY(x);
          const yTop = Math.max(wallFrontTop.y, rightBoundaryY);

          ctx.beginPath();
          ctx.moveTo(x, yBottom);
          ctx.lineTo(x, yTop);
          ctx.stroke();
        }
      }

      const horizontalLines = 7;
      for (let i = 1; i < horizontalLines; i++) {
        const t = i / horizontalLines;
        const xStart = wallFrontBottom.x + t * (wallFrontTop.x - wallFrontBottom.x);
        const yStart = wallFrontBottom.y + t * (wallFrontTop.y - wallFrontBottom.y);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(width * 0.4, height * 0.85);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(width * 0.03, wallFrontTop.y);
      ctx.lineTo(wallBackBottom.x, wallBackBottom.y);
      ctx.stroke();

      ctx.globalAlpha = 1;
    };

    const drawFloor = (width: number, height: number) => {
      const wallFrontBottomB = { x: 0, y: height };
      const wallFrontTopB = { x: width * 0.4, y: height * 0.85 };
      const wallBackTopB = { x: width * 1.2, y: height * 0.85 };
      const wallBackBottomB = { x: width, y: height };

      ctx.strokeStyle = isLight ? 'rgba(88, 90, 92, 0.26)' : 'white';
      ctx.lineWidth = isLight ? 1.5 : 2;
      ctx.globalAlpha = isLight ? 0.85 : 0.6;

      ctx.beginPath();
      ctx.moveTo(wallFrontBottomB.x, wallFrontBottomB.y);
      ctx.lineTo(wallFrontTopB.x, wallFrontTopB.y);
      ctx.lineTo(wallBackTopB.x, wallBackTopB.y);
      ctx.lineTo(wallBackBottomB.x, wallBackBottomB.y);
      ctx.closePath();

      const bottomGradient = ctx.createLinearGradient(0, wallFrontTopB.y, 0, wallBackBottomB.y);
      if (isLight) {
        bottomGradient.addColorStop(1, 'rgba(168, 168, 165, 0.22)');
        bottomGradient.addColorStop(0, 'rgba(205, 205, 202, 0.38)');
      } else {
        bottomGradient.addColorStop(1, 'rgba(76, 76, 104, 0.4)');
        bottomGradient.addColorStop(0, 'rgba(120, 120, 129, 1)');
      }
      ctx.fillStyle = bottomGradient;
      ctx.fill();
      ctx.stroke();

      const verticalLines = 12;
      for (let i = 0; i <= verticalLines; i++) {
        const t = i / verticalLines;
        const xStart = wallFrontBottomB.x + t * (wallBackBottomB.x - wallFrontBottomB.x);
        const yStart = wallFrontBottomB.y + t * (wallBackBottomB.y - wallFrontBottomB.y);
        const xEnd = wallFrontTopB.x + t * (wallBackTopB.x - wallFrontTopB.x);
        const yEnd = wallFrontTopB.y + t * (wallBackTopB.y - wallFrontTopB.y);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      const horizontalLines = 20;
      for (let i = 1; i < horizontalLines; i++) {
        const tLinear = i / horizontalLines;
        const t = Math.sqrt(tLinear);

        const xStart = wallFrontBottomB.x + t * (wallFrontTopB.x - wallFrontBottomB.x);
        const yStart = wallFrontBottomB.y + t * (wallFrontTopB.y - wallFrontBottomB.y);
        const xEnd = wallBackBottomB.x + t * (wallBackTopB.x - wallBackBottomB.x);
        const yEnd = wallBackBottomB.y + t * (wallBackTopB.y - wallBackBottomB.y);

        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      drawLeftWall(width, height);
      drawFloor(width, height);
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    resizeObserverRef.current = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserverRef.current.observe(canvas);

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      resizeObserverRef.current?.disconnect();
    };
  }, [setupCanvas, isLight]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full z-0 pointer-events-none animate-[appear_2s_ease-out] ${
        isLight ? 'opacity-[0.14]' : 'opacity-10'
      }`}
      style={{ animationFillMode: 'forwards' }}
    />
  );
});

SpaceRoom.displayName = 'SpaceRoom';

export default SpaceRoom;
