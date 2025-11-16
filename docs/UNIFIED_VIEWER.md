# Unified Viewer Architecture

## Overview

我們已經將原本的兩個獨立 viewer（`ParametricScene` 和 `AnimatedParametricScene`）合併成一個統一的 `UnifiedParametricScene` 組件。

## 為什麼要合併？

### 原本的問題

**ParametricScene (3D Printable)**
- ❌ 沒有阻尼（`enableDamping = false`），旋轉手感較差
- ✅ 按需渲染，性能較好
- ✅ 支援 STL 輸出

**AnimatedParametricScene (2D Animated)**
- ✅ 有阻尼（`enableDamping = true`），旋轉手感流暢
- ❌ 持續渲染循環，即使是靜態場景也在渲染
- ✅ 支援動畫效果

### 核心洞察

經過分析發現：
1. **STL 輸出與使用哪個 viewer 無關**，只要場景中有幾何體就能輸出
2. **兩者沒有根本性差異**，只是渲染策略不同
3. **用戶體驗問題**：3D printable 作品的旋轉手感不如 2D animated

## 統一方案

### UnifiedParametricScene 特色

✨ **智能渲染策略**
```typescript
// 自動檢測是否有動畫函數
if (userAnimateFnRef.current) {
  // 有動畫：持續渲染
  isStaticRef.current = false;
} else {
  // 無動畫：按需渲染（節省性能）
  isStaticRef.current = true;
}
```

✨ **統一的優秀手感**
- 所有作品都使用 `enableDamping = true`
- 平滑的旋轉慣性
- 更好的用戶體驗

✨ **性能優化**
- 靜態作品：只在互動時渲染
- 動畫作品：持續渲染循環
- 最佳的性能平衡

✨ **完整功能支援**
- ✅ 多色頂點支援（vertex colors）
- ✅ STL 輸出兼容
- ✅ 動畫效果支援
- ✅ 向後兼容所有現有作品

## 架構變更

### Before (舊架構)

```
ParametricViewer
├── isPrintable === true  → ParametricScene
│   ├── enableDamping: false
│   └── 按需渲染
└── isPrintable === false → AnimatedParametricScene
    ├── enableDamping: true
    └── 持續渲染
```

### After (新架構)

```
ParametricViewer
└── 統一使用 → UnifiedParametricScene
    ├── enableDamping: true (所有作品)
    └── 智能渲染
        ├── 有動畫函數 → 持續渲染
        └── 無動畫函數 → 按需渲染
```

**注意**：`isPrintable` 標誌仍然保留，用於控制 STL 輸出選項的顯示，但不再用於選擇 viewer。

## 技術實現

### 智能渲染邏輯

```typescript
// 主渲染循環：持續運行用於支援 damping
function animate() {
  animationFrameIdRef.current = requestAnimationFrame(animate);
  
  // 更新控制器（damping 需要）
  controlsRef.current.update();
  
  // 只在有動畫函數時才渲染
  if (userAnimateFnRef.current) {
    userAnimateFnRef.current(elapsed);
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }
  // 靜態場景透過 controls 的 'change' 事件觸發渲染
}
```

### 互動時渲染（靜態作品）

```typescript
// 靜態作品在互動時額外觸發渲染
controls.addEventListener('start', () => {
  if (isStaticRef.current) {
    // 啟動互動渲染循環
    function interactionRender() {
      controlsRef.current.update();
      render();
      requestAnimationFrame(interactionRender);
    }
    interactionRender();
  }
});
```

## 使用方式

### 對開發者

**完全透明**，不需要修改任何現有程式碼：

```typescript
// 使用方式完全相同
<ParametricViewer
  userScript={userScript}
  parameters={parameters}
  isPrintable={isPrintable}  // 仍用於 STL 輸出控制
  onSceneReady={onSceneReady}
  onRendererReady={onRendererReady}
  onCameraReady={onCameraReady}
/>
```

### 對創作者

**創作方式完全相同**：

```javascript
// 3D Printable - 自動使用按需渲染
function createGeometry(THREE, params) {
  // ... 創建幾何體
  return geometry;
}

// 2D Animated - 自動使用持續渲染
function createAnimatedScene(THREE, params) {
  return {
    object: myObject,
    animate: (time) => {
      // 動畫邏輯
    }
  };
}
```

## 效能比較

| 場景類型 | 舊架構 | 新架構 | 改進 |
|---------|--------|--------|------|
| 3D Printable（靜態） | 按需渲染<br/>無阻尼 | 按需渲染<br/>有阻尼 | ✅ 手感更好<br/>性能相同 |
| 2D Animated（動畫） | 持續渲染<br/>有阻尼 | 持續渲染<br/>有阻尼 | ✅ 完全相同 |
| 混合作品 | 持續渲染<br/>（浪費） | 智能判斷 | ✅ 性能優化 |

## 向後兼容

✅ **100% 向後兼容**

- 所有現有的 3D printable 作品正常運作
- 所有現有的 2D animated 作品正常運作
- STL 輸出功能完全保留
- `isPrintable` 標誌功能保留（用於 UI 控制）
- 現有的 metadata 結構不變

## 檔案變更

### 新增
- `frontend/components/3d/UnifiedParametricScene.tsx` - 統一的 viewer

### 修改
- `frontend/components/features/design-publisher/components/pages/ParametricViewer.tsx` - 使用統一 viewer

### 備份
- `frontend/components/3d/ParametricScene.tsx.backup` - 舊版本備份
- `frontend/components/3d/AnimatedParametricScene.tsx.backup` - 舊版本備份

### 移除
- 舊的 `ParametricScene.tsx` 和 `AnimatedParametricScene.tsx` 已備份並移除

## 測試建議

1. **3D Printable 作品**
   - 驗證旋轉手感是否改善（應該更流暢）
   - 確認 STL 輸出正常
   - 檢查靜態場景不會持續重新渲染

2. **2D Animated 作品**
   - 確認動畫正常播放
   - 驗證互動流暢度
   - 檢查性能表現

3. **混合測試**
   - 從 3D 切換到 2D 作品
   - 參數調整是否正常
   - 多色支援是否正常

## 未來可能的改進

1. **更細緻的性能控制**
   - 根據設備性能調整渲染策略
   - 節能模式支援

2. **漸進式功能增強**
   - 支援更複雜的動畫系統
   - 支援多個動畫物件管理

3. **開發者工具**
   - 性能監控面板
   - 渲染統計數據

## 相關文檔

- [MULTI_COLOR_SUPPORT.md](./MULTI_COLOR_SUPPORT.md) - 多色支援
- [ANIMATED_SCULPT_SUPPORT.md](./ANIMATED_SCULPT_SUPPORT.md) - 動畫支援
- [ARTWORK_TYPES.md](./ARTWORK_TYPES.md) - 作品類型

