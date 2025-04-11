# 3D 模型編輯器實現指南

## 主要組件

### 1. Model3DWindow.tsx
- 位置：`components/windows/Model3DWindow.tsx`
- 功能：3D 模型編輯器的主窗口組件
- 主要修改點：
  - 使用 `useState` 管理模型尺寸狀態
  - 實現了輸入框的處理邏輯
  - 使用 `dynamic import` 加載 ThreeScene 組件
  - 樣式調整：
    - 移除了輸入框的圓角
    - 調整了輸入框的高度
    - 移除了輸入值的限制

### 2. ThreeScene.tsx
- 位置：`components/3d/ThreeScene.tsx`
- 功能：Three.js 場景渲染組件
- 主要修改點：
  - 實現了基本的 Three.js 場景設置
  - 添加了相機和渲染器
  - 實現了立方體模型
  - 添加了光源
  - 實現了視窗大小變化的響應
  - 樣式調整：
    - 將背景色改為純黑色
    - 將立方體顏色改為米黃色

## 依賴項
- Three.js：用於 3D 渲染
- OrbitControls：用於相機控制

## 如何修改

### 修改模型尺寸
1. 在 `Model3DWindow.tsx` 中修改 `dimensions` 狀態
2. 修改 `handleDimensionChange` 函數的邏輯

### 修改視覺效果
1. 在 `ThreeScene.tsx` 中修改：
   - `scene.background` 修改背景色
   - `material.color` 修改模型顏色
   - 光源設置可以調整亮度和位置

### 添加新功能
1. 在 `Model3DWindow.tsx` 中添加新的控制項
2. 在 `ThreeScene.tsx` 中實現相應的 3D 效果

## 注意事項
- Three.js 組件需要使用 `dynamic import` 避免 SSR 問題
- 需要處理組件卸載時的資源清理
- 注意性能優化，避免不必要的重渲染 