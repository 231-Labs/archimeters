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

### 2. ParametricScene.tsx
- 位置：`components/3d/ParametricScene.tsx`
- 功能：參數化曲面生成和渲染組件
- 主要實現邏輯：
  1. 場景初始化：
     - 創建 Three.js 場景、相機和渲染器
     - 設置背景色為黑色
     - 添加軌道控制器實現相機控制
     - 添加環境光和點光源

  2. 參數化曲面生成：
     - 使用 `BufferGeometry` 創建自定義幾何體
     - 根據 resolution 參數生成網格頂點
     - 使用正弦函數生成曲面高度
     - 計算頂點法線實現光照效果
     - 設置網格材質（支持網格線顯示）

  3. 響應式處理：
     - 使用 `ResizeObserver` 監聽容器大小變化
     - 自動調整相機視角和渲染器大小
     - 實現平滑的動畫循環

  4. 資源管理：
     - 使用 `useRef` 保存 Three.js 實例
     - 在組件卸載時正確清理資源
     - 處理材質和幾何體的釋放

### 3. ThreeScene.tsx
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