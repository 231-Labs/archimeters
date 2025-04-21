# 3D 場景創建指南

本文檔提供了在 Archimeters 中創建自定義 3D 場景的指南。通過遵循這些指導原則，你可以創建自己的參數化 3D 場景，並在應用程序中使用它們。

## 基本結構

每個 3D 場景組件都應該遵循以下結構：

1. **參數定義**：使用 `defaultParameters` 對象定義場景可調整的參數
2. **類型生成**：從參數定義自動生成 TypeScript 類型
3. **場景渲染**：使用 Three.js 創建和管理 3D 場景
4. **響應式更新**：當參數變化時更新場景

## 模板結構

以下是基於 `ParametricScene.tsx` 的模板結構：

```typescript
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// 參數定義區域 - 這是使場景可動態調整的關鍵
export const defaultParameters = {
  // 數值型參數範例
  param1: {
    type: 'number',
    default: 1,
    label: 'Parameter 1',
  },
  // 顏色參數範例
  colorParam: {
    type: 'color',
    default: '#f5f5dc',
    label: 'Color',
  },
  // 可以添加更多參數...
} as const;

// 從參數定義生成類型
export type Parameters = {
  [K in keyof typeof defaultParameters]: 
    typeof defaultParameters[K]['type'] extends 'number' ? number :
    typeof defaultParameters[K]['type'] extends 'color' ? string :
    never;
};

export interface SceneProps {
  parameters: Partial<Parameters>;
}

const CustomScene = ({ parameters: userParameters }: SceneProps) => {
  // 合併默認參數和用戶提供的參數
  const parameters = {
    ...Object.fromEntries(
      Object.entries(defaultParameters).map(([key, value]) => [key, value.default])
    ),
    ...userParameters
  } as Parameters;

  // 引用
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const objectRef = useRef<THREE.Mesh | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 初始化場景 - 只在組件掛載時執行一次
  useEffect(() => {
    if (!containerRef.current) return;

    // 創建場景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // 創建相機
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 10);
    cameraRef.current = camera;

    // 創建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 添加軌道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 添加光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 動畫循環
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // 處理窗口大小變化
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current?.clientWidth || 1;
      const height = containerRef.current?.clientHeight || 1;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    // 使用 ResizeObserver 監視容器大小變化
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 清理函數
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      resizeObserver.disconnect();
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      rendererRef.current?.dispose();
    };
  }, []); // 空依賴數組 - 只在掛載時執行一次

  // 當參數變化時更新場景
  useEffect(() => {
    if (!sceneRef.current) return;

    // 移除舊的物體
    if (objectRef.current) {
      sceneRef.current.remove(objectRef.current);
      objectRef.current.geometry.dispose();
      if (Array.isArray(objectRef.current.material)) {
        objectRef.current.material.forEach(material => material.dispose());
      } else {
        objectRef.current.material.dispose();
      }
    }

    // 創建新的物體 - 這裡是你自定義形狀的地方
    const createObject = () => {
      // 這裡實現你的自定義幾何體邏輯
      // 以下僅是示例
      const geometry = new THREE.BoxGeometry(
        parameters.param1, // 使用參數
        parameters.param1,
        parameters.param1
      );

      const material = new THREE.MeshStandardMaterial({
        color: parameters.colorParam, // 使用顏色參數
        wireframe: true,
      });

      return new THREE.Mesh(geometry, material);
    };

    const object = createObject();
    sceneRef.current.add(object);
    objectRef.current = object;
    
    // 觸發一次渲染
    if (cameraRef.current && rendererRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  }, [parameters]); // 僅在參數變化時執行

  return <div ref={containerRef} className="w-full h-full" />;
};

export default CustomScene;
```

## 參數定義指南

參數定義是場景的核心部分，使用戶能夠與場景互動。每個參數都應該定義以下屬性：

- **type**: 參數類型（目前支持 'number' 和 'color'）
- **default**: 參數的默認值
- **label**: 在 UI 中顯示的標籤

例如：

```typescript
export const defaultParameters = {
  amplitude: {
    type: 'number',
    default: 1,
    label: 'Amplitude',
  },
  frequency: {
    type: 'number',
    default: 1,
    label: 'Frequency',
  },
  resolution: {
    type: 'number',
    default: 20,
    label: 'Resolution',
  },
  color: {
    type: 'color',
    default: '#f5f5dc',
    label: 'Color',
  },
} as const;
```

## ParametricScene 示例解析

`ParametricScene.tsx` 是一個參數化正弦波曲面的實現。以下是其主要特點：

1. **參數化曲面生成**：
   - 使用參數創建一個基於正弦函數的網格
   - 通過公式 `z = amplitude * sin(frequency * sqrt(x*x + y*y))` 計算高度值

2. **分離的場景初始化和參數更新**：
   - 初始化場景、相機、控制器只在組件掛載時執行一次
   - 當參數變化時，只重新生成曲面，不重建整個場景

3. **性能優化**：
   - 合理清理不再使用的資源（幾何體、材質）
   - 使用 ResizeObserver 處理容器大小變化

## 使用示例

用戶可以通過上傳他們的場景文件（如 `ParametricScene.tsx`）到應用程序中，應用程序將自動提取參數定義並生成相應的 UI 控件。用戶可以調整這些參數來交互式地探索 3D 場景。

## 最佳實踐

1. **參數命名**：使用有意義且直觀的參數名稱
2. **默認值選擇**：提供合理的默認值，使場景在初始狀態下看起來不錯
3. **資源管理**：正確處理資源清理，避免內存泄漏
4. **代碼分離**：將初始化邏輯與更新邏輯分開，提高性能
5. **錯誤處理**：添加適當的錯誤處理，提高穩定性

## 進階功能

可以考慮擴展場景以支持以下功能：

- 更多參數類型（滑塊、下拉選擇等）
- 動畫效果
- 交互控制
- 紋理和材質設置
- 更複雜的幾何體創建邏輯

## 結論

創建自定義 3D 場景是 Archimeters 的強大功能。通過遵循本指南中的模板和最佳實踐，你可以創建豐富多樣的參數化 3D 場景，並與其他用戶分享。 