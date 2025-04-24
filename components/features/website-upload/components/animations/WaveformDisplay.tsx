import { useEffect, useRef } from 'react';

interface WaveformDisplayProps {
  className?: string;
  isAnimating?: boolean;
}

export function WaveformDisplay({ className = '', isAnimating = true }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const lastDrawTime = useRef<number>(0);
  const FPS = 5;
  const frameDelay = 1000 / FPS;
  const lastPerformance = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true
    });
    if (!ctx) return;

    // 設置 canvas 大小
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      
      // 使用較低的解析度來提升效能
      canvas.width = rect.width * scale / 1.5;
      canvas.height = rect.height * scale / 1.5;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      ctx.scale(scale / 1.5, scale / 1.5);
      
      // 重置背景
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, rect.width, rect.height);
    };

    resize();
    window.addEventListener('resize', resize);

    // 預計算網格
    const gridCanvas = document.createElement('canvas');
    const gridCtx = gridCanvas.getContext('2d');
    if (gridCtx) {
      gridCanvas.width = canvas.width;
      gridCanvas.height = canvas.height;
      
      gridCtx.strokeStyle = '#333333';
      gridCtx.lineWidth = 0.5;
      
      for (let x = 0; x <= canvas.width; x += 20) {
        gridCtx.beginPath();
        gridCtx.moveTo(x, 0);
        gridCtx.lineTo(x, canvas.height);
        gridCtx.stroke();
      }
      
      for (let y = 0; y <= canvas.height; y += 20) {
        gridCtx.beginPath();
        gridCtx.moveTo(0, y);
        gridCtx.lineTo(canvas.width, y);
        gridCtx.stroke();
      }
    }

    // 繪製波形
    const drawWaveform = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // 繪製預計算的網格
      if (gridCtx) {
        ctx.drawImage(gridCanvas, 0, 0);
      }
      
      const amplitude = rect.height / 2.5;  // 增加振幅以創造更深邃的效果
      const frequency = 0.008;  // 更低的頻率，創造更寬廣的波形
      const points: [number, number][] = [];
      const secondaryPoints: [number, number][] = [];
      const tertiaryPoints: [number, number][] = [];  // 新增第三層波形
      
      // 一次性計算所有點
      for (let x = 0; x < rect.width; x += 2) {
        // 主波形 - 模擬重力波的緩慢起伏
        const gravityWave = Math.sin((x - time * 100) * frequency) * 
                          Math.cos((x - time * 50) * frequency * 0.5);
        const cosmicModulation = Math.sin(time * 0.2) * 0.3;
        
        const baseY = rect.height / 2 + 
                   amplitude * gravityWave * 
                   (1 + cosmicModulation) +
                   (Math.random() - 0.5) * 0.5;
        points.push([x, Math.round(baseY / 2) * 2]);

        // 次要波形 - 模擬星際電波
        if (x % 4 === 0) {
          const radioWave = Math.sin((x - time * 150) * frequency * 1.2) * 0.4 *
                           (1 + Math.sin(x * 0.005) * 0.3);  // 電波強度變化
          const y = rect.height / 2 + 
                  amplitude * radioWave * 
                  (1 + Math.sin(x * 0.003 + time * 0.2) * 0.2);
          secondaryPoints.push([x, Math.round(y / 2) * 2]);
        }

        // 第三層波形 - 模擬背景輻射
        if (x % 6 === 0) {
          const backgroundWave = Math.sin((x + time * 30) * frequency * 0.7) * 0.2 *
                               (1 + Math.sin(time * 0.05) * 0.1);
          const z = rect.height / 2 + 
                  amplitude * backgroundWave * 
                  (1 + Math.sin(x * 0.002) * 0.1);
          tertiaryPoints.push([x, Math.round(z / 2) * 2]);
        }
      }

      // 繪製背景輻射
      ctx.fillStyle = 'rgba(180, 180, 180, 0.15)';  // 淺灰色，低透明度
      tertiaryPoints.forEach(([x, y]) => {
        ctx.fillRect(Math.round(x) - 1.5, Math.round(y) - 1.5, 3, 3);
      });

      // 繪製星際電波
      ctx.fillStyle = 'rgba(220, 220, 220, 0.25)';  // 中等亮度的灰色
      secondaryPoints.forEach(([x, y]) => {
        ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
      });

      // 繪製重力波
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';  // 純白色，中等透明度
      points.forEach(([x, y]) => {
        const glowSize = 2 + Math.sin(time * 2 + x * 0.1) * 0.5;  // 微妙的光暈效果
        ctx.fillRect(Math.round(x) - glowSize/2, Math.round(y) - glowSize/2, glowSize, glowSize);
      });
    };

    // 優化的動畫循環
    let isRunning = true;
    const animate = (timestamp: number) => {
      if (!isRunning) return;
      
      if (timestamp - lastDrawTime.current >= frameDelay) {
        const deltaTime = timestamp - lastPerformance.current;
        lastPerformance.current = timestamp;
        
        timeRef.current += 0.002 * (deltaTime / (1000 / 60));
        
        // 只在動畫開啟或初始化時繪製
        if (isAnimating || !lastDrawTime.current) {
          drawWaveform(timeRef.current);
        }
        
        lastDrawTime.current = timestamp;
      }
      
      if (isAnimating) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };

    // 確保至少繪製一次
    drawWaveform(timeRef.current);
    
    if (isAnimating) {
      frameRef.current = requestAnimationFrame(animate);
    }

    return () => {
      isRunning = false;
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener('resize', resize);
    };
  }, [isAnimating]); // 添加 isAnimating 到依賴數組

  return (
    <canvas 
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ 
        imageRendering: 'pixelated',
        backgroundColor: '#000000',
      }}
    />
  );
} 