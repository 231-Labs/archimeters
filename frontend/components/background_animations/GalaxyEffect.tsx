'use client';

import { useRef, useEffect } from 'react';

const GalaxyEffect3D = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    const numStars = 5000; // 數量
    const depth = 1000; // 景深

    // 初始化星星位置
    const stars = Array.from({ length: numStars }, () => ({
      x: (Math.random() * 2 - 1) * depth,
      y: (Math.random() * 2 - 1) * depth,
      z: Math.random() * depth,
      size: Math.random() * 2 + 1,
    }));

    let mouseX = 0;
    let mouseY = 0;
    let rotationX = 0;
    let rotationY = 0;

    // 監聽滑鼠移動以控制視角旋轉
    const onMouseMove = (e: MouseEvent) => {
      const x = e.clientX - centerX;
      const y = e.clientY - centerY;
      mouseX = x / width;
      mouseY = y / height;
    };

    window.addEventListener('mousemove', onMouseMove);

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // 平滑控制旋轉角度
      rotationX += (mouseY * 0.05 - rotationX) * 0.05;
      rotationY += (mouseX * 0.05 - rotationY) * 0.05;

      for (let star of stars) {
        // 緩慢移動星星位置（非由中心飛出）
        star.z -= 0.5;
        if (star.z <= 1) {
          star.z = depth;
          star.x = (Math.random() * 2 - 1) * depth;
          star.y = (Math.random() * 2 - 1) * depth;
        }

        // 套用旋轉變換（模擬 3D）
        const cosRY = Math.cos(rotationY);
        const sinRY = Math.sin(rotationY);
        const cosRX = Math.cos(rotationX);
        const sinRX = Math.sin(rotationX);

        let x = star.x;
        let y = star.y;
        let z = star.z;

        // Y 軸旋轉
        let dx = cosRY * x - sinRY * z;
        let dz = sinRY * x + cosRY * z;
        x = dx;
        z = dz;

        // X 軸旋轉
        let dy = cosRX * y - sinRX * z;
        dz = sinRX * y + cosRX * z;
        y = dy;
        z = dz;

        // 投影計算
        const k = 400; // 焦距變大，視角更窄，景更深遠
        const sx = (x / z) * k + centerX;
        const sy = (y / z) * k + centerY;
        const r = ((1 - z / depth) ** 2) * star.size * 2; // 大小差

        if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
          ctx.beginPath();
          ctx.globalAlpha = Math.min(1, 1 - z / depth + 0.2);
          ctx.fillStyle = '#ffffff'; // 顏色
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
    };

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    animate();

    // 清理事件監聽
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 opacity-60 pointer-events-none"
    />
  );
};

export default GalaxyEffect3D;