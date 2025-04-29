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
    const wallFrontTop = { x: 0, y: 20 }; // 左上
    const wallBackTop = { x: width * 0.15, y: 20 }; // 右上
    const wallBackBottom = { x: width * 0.4, y: height * 0.85 }; // 右下

    // 地板
    const wallFrontBottomB = { x: 0, y: height }; //左下
    const wallFrontTopB = { x: width * 0.4, y: height * 0.85 }; // 左上
    const wallBackTopB = { x: width * 1.2, y: height * 0.85 }; // 右上
    const wallBackBottomB = { x: width, y: height }; // 右下

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
      leftGradient.addColorStop(0, 'rgba(120, 120, 129, 1)');
      leftGradient.addColorStop(1, 'rgba(76, 76, 104, 0.4)');
      ctx.fillStyle = leftGradient
      //ctx.fillStyle = 'rgba(113, 113, 123, 0.8)'; // 半透明藍灰色
      ctx.fill();
      ctx.stroke();

      /// 計算右側邊界線的方程式 (從左上到右下的線段)
      // 這條線是從 wallBackTop 到 wallBackBottom
      const rightBoundarySlope = (wallBackBottom.y - wallBackTop.y) / (wallBackBottom.x - wallBackTop.x);
      const rightBoundaryIntercept = wallBackTop.y - rightBoundarySlope * wallBackTop.x;
      
      // 計算給定 x 座標時，右側邊界的 y 座標
      const getRightBoundaryY = (x: number) => rightBoundarySlope * x + rightBoundaryIntercept;

      // 畫垂直格線（左壁，完全垂直，但限制在輪廓內）
      const verticalLines = 20;
      for (let i = 0; i <= verticalLines; i++) {
        const tLinear = i / verticalLines;
        const t = Math.sqrt(tLinear); // 非線性分布：越後面越密集

        const x = wallFrontBottom.x + t * (wallBackBottom.x - wallFrontBottom.x);
        const yBottom = wallFrontBottom.y + t * (wallBackBottom.y - wallFrontBottom.y);
        
        // 計算垂直線與右側邊界的交點
        // 如果 x 在右側邊界內，則只需計算邊界上的 y 值
        if (x <= wallBackBottom.x) {
          // 計算右側邊界線上對應的 y 值
          const rightBoundaryY = getRightBoundaryY(x);
          const yTop = Math.max(wallFrontTop.y, rightBoundaryY);

          ctx.beginPath();
          ctx.moveTo(x, yBottom);
          ctx.lineTo(x, yTop);
          ctx.stroke();
        }
      }


      // 畫水平格線
      const horizontalLines = 7;
      for (let i = 1; i < horizontalLines; i++) {
        const t = i / horizontalLines;
        const xStart = wallFrontBottom.x + t * (wallFrontTop.x - wallFrontBottom.x);
        const yStart = wallFrontBottom.y + t * (wallFrontTop.y - wallFrontBottom.y);
        const xEnd = wallBackBottom.x + t * (wallBackTop.x - wallBackBottom.x);
        const yEnd = wallBackBottom.y + t * (wallBackTop.y - wallBackBottom.y);
        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(width * 0.4, height * 0.85);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.moveTo(width * 0.03, wallFrontTop.y); // 左上
      ctx.lineTo(wallBackBottom.x, wallBackBottom.y); // 右下
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(width * 0.03, wallFrontTop.y); // 左上
      ctx.lineTo(wallBackBottom.x, wallBackBottom.y); // 右下
      ctx.stroke();     

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
      bottomGradient.addColorStop(1, 'rgba(76, 76, 104, 0.4');
      bottomGradient.addColorStop(0, 'rgba(120, 120, 129, 1)');
      ctx.fillStyle = bottomGradient;
      //ctx.fillStyle = 'rgba(113, 113, 123, 0.8)'; // 半透明藍灰色
      ctx.fill();
      ctx.stroke();

      // 畫垂直格線
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

      // 畫水平格線（地板，前面密集）
      const horizontalLines = 20;
      for (let i = 1; i < horizontalLines; i++) {
        const tLinear = i / horizontalLines;
        const t = Math.sqrt(tLinear); // 非線性：前面密集，後面稀疏

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

    drawleft();
    drawbottom();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 opacity-90 pointer-events-none animate-[appear_2s_ease-out]"
      style={{ animationFillMode: 'forwards' }}
    />
  );
};

export default GalaxyEffect3D;
