# Artwork Types - 3D Printable vs 2D/Animated

Archimeters 現在支持兩種類型的藝術作品：

## 🖨️ 3D Printable (可列印)

### 特點
- 靜態 3D 幾何體
- 可轉換為 STL/OBJ 用於 3D 列印
- 使用 `ParametricScene` 渲染器（靜態渲染）
- 只需要 `createGeometry()` 函數

### 範例
```javascript
const parameters = {
  size: { label: 'Size', type: 'number', default: 20, min: 10, max: 50 },
  color: { label: 'Color', type: 'color', default: '#ff3366' }
};

function createGeometry(THREE, params = {}) {
  const size = params.size ?? parameters.size.default;
  const geometry = new THREE.BoxGeometry(size, size, size);
  return geometry;
}

window.MyDesign = { parameters, createGeometry };
```

### 適用場景
- 參數化設計
- 建築模型
- 產品設計
- 雕塑作品
- 任何需要實體化的設計

---

## 🎨 2D/Animated (動畫藝術)

### 特點
- 支持動畫和時間效果
- 可使用粒子系統、Shader、後處理效果
- 使用 `AnimatedParametricScene` 渲染器（動畫循環）
- 需要 `createAnimatedScene()` 函數和 `animate()` 回調

### 範例
```javascript
const parameters = {
  speed: { label: 'Speed', type: 'number', default: 1.0, min: 0.1, max: 3.0 },
  color: { label: 'Color', type: 'color', default: '#00ffff' }
};

function createAnimatedScene(THREE, params = {}) {
  const group = new THREE.Group();
  
  // 創建動畫元素
  const geometry = new THREE.SphereGeometry(10, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color: params.color });
  const sphere = new THREE.Mesh(geometry, material);
  group.add(sphere);
  
  // 動畫函數
  function animate(time) {
    const t = time * params.speed;
    sphere.position.y = Math.sin(t) * 20;
    sphere.rotation.y = t;
  }
  
  return {
    object: group,
    animate: animate
  };
}

window.MyAnimation = { 
  parameters, 
  createAnimatedScene,
  isPrintable: false  // 明確標記為非可列印
};
```

### 適用場景
- 數位藝術
- 視覺效果
- 互動裝置
- Pavilion 展示
- 純視覺體驗的作品

---

## 🔧 自動偵測機制

系統會自動分析上傳的腳本，根據以下特徵判斷類型：

### 偵測為 **3D Printable** 的特徵
- 只有 `createGeometry()` 函數
- 返回 `THREE.BufferGeometry`
- 使用標準 Three.js 幾何體

### 偵測為 **2D/Animated** 的特徵
- 有 `createAnimatedScene()` 或 `animate()` 函數
- 使用 `requestAnimationFrame`
- 包含 `ParticleSystem`、`ShaderMaterial`
- 包含 `Sprite`、`Points`
- 時間參數：`createGeometry(THREE, params, time)`
- 明確標記：`isPrintable: false` 或 `@printable false`

### 信心度
- **High**: 偵測到明確特徵（自動設定類型）
- **Medium**: 特徵不明確（建議手動選擇）
- **Low**: 無特徵（默認為可列印）

---

## 📝 最佳實踐

### 1. 明確標記類型

在腳本中明確標記可列印性：

```javascript
// 方法 1: 在註解中標記
// @printable false

// 方法 2: 在導出物件中標記
window.MyArtwork = {
  parameters,
  createAnimatedScene,
  isPrintable: false
};

// 方法 3: 作為常數定義
const IS_PRINTABLE = false;
```

### 2. 提供兩種模式

為動畫作品提供靜態預覽版本：

```javascript
// 動畫版本（用於展示）
function createAnimatedScene(THREE, params) {
  // ... 動畫邏輯
  return { object: group, animate: animateFunc };
}

// 靜態版本（用於預覽）
function createGeometry(THREE, params) {
  // ... 靜態幾何體
  return geometry;
}
```

### 3. 性能考量

- **可列印模式**：優化幾何複雜度（面數）
- **動畫模式**：優化幀率（避免過多計算）

### 4. 參數設計

```javascript
const parameters = {
  // 通用參數
  color: { label: 'Color', type: 'color', default: '#ff3366' },
  
  // 幾何參數（可列印）
  segments: { label: 'Segments', type: 'number', default: 32, min: 8, max: 128 },
  
  // 動畫參數（僅動畫模式使用）
  speed: { label: 'Speed', type: 'number', default: 1.0, min: 0.1, max: 5.0 },
  amplitude: { label: 'Amplitude', type: 'number', default: 10, min: 1, max: 50 }
};
```

---

## 🎯 UI 控制

### Publisher 介面

上傳算法文件後，會顯示：

1. **自動偵測結果**
   - 綠色點：高信心度
   - 黃色點：中信心度
   - 灰色點：低信心度
   - 顯示偵測到的特徵

2. **手動 Toggle**
   - 左側 = 3D Printable（靜態）
   - 右側 = 2D/Animated（動畫）
   - 可隨時切換

3. **模式說明**
   - 顯示當前模式的特點
   - 提供使用建議

### 3D 預覽

開發模式下，預覽器右上角會顯示：
- `3D STATIC` - 使用靜態渲染器
- `2D ANIMATED` - 使用動畫渲染器

---

## 🚀 與 Pavilion 整合

### 元數據

上傳到 Walrus 的 metadata.json 包含：

```json
{
  "artwork": {
    "title": "...",
    "description": "...",
    "isPrintable": true,  // 類型標記
    "template": { ... }
  },
  ...
}
```

### 建議流程

1. **Archimeters** - 發布作品，選擇類型
2. **Metadata** - 自動記錄 `isPrintable` 標誌
3. **Pavilion** - 讀取標誌，選擇適合的展示方式
   - 可列印作品：顯示參數控制 + 下載 STL
   - 動畫作品：全螢幕沉浸式播放

---

## 📦 範例文件

專案包含以下範例：

### 3D Printable
- `cube.js` - 基礎立方體
- `pyramid.js` - 金字塔
- `aurora_bloom_stool.js` - 複雜參數化設計
- `neural-genesis.js` - AI 生成結構

### 2D/Animated
- `animated_waves.js` - 波浪動畫（新增）

---

## ⚠️ 注意事項

1. **向後兼容**
   - 所有現有的 3D 可列印腳本完全不受影響
   - 默認為 `isPrintable: true`
   - 靜態渲染器保持原有邏輯

2. **動畫性能**
   - 動畫模式會持續運行 `requestAnimationFrame`
   - 確保 `animate()` 函數效率高
   - 避免在動畫循環中創建新物件

3. **參數更新**
   - 參數改變時會重新創建場景
   - 動畫會重新開始
   - `animate()` 函數接收的是經過時間（elapsed time）

4. **開發模式**
   - 可在控制台看到 `[Animated]` 前綴的日誌
   - 預覽器顯示當前模式標籤
   - 便於調試

---

## 🔮 未來擴展

可能的功能擴展：

1. **混合模式** - 在可列印幾何上添加動畫效果
2. **互動參數** - 動畫響應用戶輸入
3. **錄製功能** - 將動畫轉為視頻
4. **VR/AR 支持** - 在虛擬空間中體驗
5. **Web Assembly** - 更複雜的計算效果

---

## 💡 總結

這個雙模式系統讓 Archimeters 同時支持：
- **實體創作** - 可列印的參數化設計
- **數位藝術** - 精美的動畫和視覺效果

設計師可以根據作品性質自由選擇模式，系統會自動優化渲染方式，確保最佳體驗！

