'use client';

import { useRef, useEffect } from 'react';
import "./SpaceRoom.css";

const GalaxyEffect3D = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;

    const spacing = 40;

    // 左壁
    const wallFrontBottom = { x: 0, y: height }; //左下
    const wallFrontTop = { x: 0, y: -10 }; // 左上
    const wallBackTop = { x: 230, y: 25 }; // 右上
    const wallBackBottom = { x: 230, y: height * 0.85 }; // 右下

    // 地板
    const wallFrontBottomB = { x: 0, y: height }; //左下
    const wallFrontTopB = { x: 230, y: height * 0.85 }; // 左上
    const wallBackTopB = { x: width, y: height * 0.95 }; // 右上
    const wallBackBottomB = { x: width * 1.1, y: height * 1.2 }; // 右下

    const drawleft = () => {
      ctx.clearRect(0, 0, width, height);
      //ctx.fillStyle = '111';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;

      // 畫牆輪廓線
      ctx.beginPath();
      ctx.moveTo(wallFrontBottom.x, wallFrontBottom.y);
      ctx.lineTo(wallFrontTop.x, wallFrontTop.y);
      ctx.lineTo(wallBackTop.x, wallBackTop.y);
      ctx.lineTo(wallBackBottom.x, wallBackBottom.y);
      ctx.closePath();

      const leftGradient = ctx.createLinearGradient(wallBackBottom.x, 0, wallFrontBottom.x, 0);
      leftGradient.addColorStop(0, 'rgba(120, 120, 129, 0.9)');
      leftGradient.addColorStop(1, 'rgba(76, 76, 104, 0.2)');
      ctx.fillStyle = leftGradient
      //ctx.fillStyle = 'rgba(113, 113, 123, 0.8)'; // 半透明藍灰色
      ctx.fill();
      ctx.stroke();

      // 畫垂直格線
      const verticalLines = 4;
      for (let i = 0; i <= verticalLines; i++) {
        const t = i / verticalLines;
        const xStart = wallFrontBottom.x + t * (wallBackBottom.x - wallFrontBottom.x);
        const yStart = wallFrontBottom.y + t * (wallBackBottom.y - wallFrontBottom.y);
        const xEnd = wallFrontTop.x + t * (wallBackTop.x - wallFrontTop.x);
        const yEnd = wallFrontTop.y + t * (wallBackTop.y - wallFrontTop.y);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      // 畫水平格線
      const horizontalLines = 10;
      for (let i = 1; i < horizontalLines; i++) {
        const t = i / horizontalLines;
        const xStart = wallFrontBottom.x + t * (wallFrontTop.x - wallFrontBottom.x);
        const yStart = wallFrontBottom.y + t * (wallFrontTop.y - wallFrontBottom.y);
        const xEnd = wallBackBottom.x + t * (wallBackTop.x - wallBackBottom.x);
        const yEnd = wallBackBottom.y + t * (wallBackTop.y - wallBackBottom.y);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      

      ctx.globalAlpha = 1;
    };

    const drawbottom = () => {
      // ctx.clearRect(0, 0, width, height);
      // ctx.fillStyle = '#1alala';
      // ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;

      // 畫牆輪廓線
      ctx.beginPath();
      ctx.moveTo(wallFrontBottomB.x, wallFrontBottomB.y);
      ctx.lineTo(wallFrontTopB.x, wallFrontTopB.y);
      ctx.lineTo(wallBackTopB.x, wallBackTopB.y);
      ctx.lineTo(wallBackBottomB.x, wallBackBottomB.y);
      ctx.closePath();

      const bottomGradient = ctx.createLinearGradient(0, wallFrontTopB.y, 0, wallBackBottomB.y);
      bottomGradient.addColorStop(1, 'rgba(76, 76, 104, 0.2');
      bottomGradient.addColorStop(0, 'rgba(120, 120, 129, 0.9)');
      ctx.fillStyle = bottomGradient;
      //ctx.fillStyle = 'rgba(113, 113, 123, 0.8)'; // 半透明藍灰色
      ctx.fill();
      ctx.stroke();

      // 畫垂直格線
      const verticalLines = 16;
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

      // 畫水平格線
      const horizontalLines = 4;
      for (let i = 1; i < horizontalLines; i++) {
        const t = i / horizontalLines;
        const xStart = wallFrontBottomB.x + t * (wallFrontTopB.x - wallFrontBottomB.x);
        const yStart = wallFrontBottomB.y + t * (wallFrontTopB.y - wallFrontBottom.y);
        const xEnd = wallBackBottomB.x + t * (wallBackTopB.x - wallBackBottomB.x);
        const yEnd = wallBackBottomB.y + t * (wallBackTopB.y - wallBackBottomB.y);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    };

    drawleft();
    drawbottom();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 opacity-80 pointer-events-none animate-[appear_2s_ease-out]"
      style={{ animationFillMode: 'forwards' }}
    />
  );
};

export default GalaxyEffect3D;