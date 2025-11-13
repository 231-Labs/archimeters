# 窗口系統代碼重構方案

## 📊 現狀分析

### 當前文件分佈

```
frontend/
├── hooks/
│   └── useWindowManager.ts          # 窗口狀態管理 (214 行)
├── components/
│   ├── common/
│   │   └── Window.tsx                # 當前使用的窗口組件 (152 行)
│   └── core/
│       └── Window/                   # ⚠️ 舊的窗口系統（未使用）
│           ├── index.tsx
│           ├── styles.ts
│           └── types.ts
├── types/
│   └── window.ts                     # 窗口類型定義
└── app/
    └── page.tsx                      # 額外的 zOrder 邏輯（重複）
```

### 問題識別

#### 1. **文件位置不清晰**
- `useWindowManager.ts` 在 `frontend/hooks/` - 看似全局 hook，實際上是窗口系統專用
- `Window.tsx` 在 `components/common/` - 與窗口管理邏輯分離
- 類型定義在 `types/window.ts` - 與實現分離

#### 2. **存在重複邏輯**
```typescript
// page.tsx 中的重複邏輯
const activateWindow = (name: string) => {
  setZOrder(prev => [...prev.filter(n => n !== name), name]);
};

// useWindowManager.ts 中已有類似邏輯
const activateWindow = useCallback((name: WindowName) => {
  setState(prev => {
    const newMaxZIndex = prev.maxZIndex + 1;
    return {
      ...prev,
      activeWindow: name,
      openWindows: [...prev.openWindows.filter(w => w !== name), name],
      // ...
    };
  });
}, []);
```

#### 3. **遺留代碼未清理**
- `components/core/Window/` 目錄包含舊的窗口系統實現
- 與當前使用的 `components/common/Window.tsx` 不同
- 造成混淆，增加維護成本

---

## 🎯 重構目標

1. **統一管理**: 將窗口相關代碼集中在一個目錄
2. **清晰職責**: 分離 UI 層和邏輯層
3. **消除重複**: 統一 z-index 管理邏輯
4. **易於維護**: 清晰的目錄結構和文件組織

---

## 📁 推薦方案：Feature-Based 結構

### 新的目錄結構

```
frontend/
└── components/
    └── features/
        └── window-manager/              # 窗口管理系統
            ├── components/
            │   ├── Window.tsx           # 窗口 UI 組件
            │   └── WindowContainer.tsx  # 窗口容器（可選）
            ├── hooks/
            │   ├── useWindowManager.ts  # 窗口狀態管理
            │   └── useWindowFocus.ts    # 窗口焦點管理（新增）
            ├── types/
            │   └── index.ts             # 窗口相關類型
            ├── utils/
            │   ├── positioning.ts       # 位置計算工具
            │   └── zIndexManager.ts     # Z-index 管理工具（新增）
            └── index.ts                 # 統一導出
```

### 文件職責劃分

#### 1. **Window.tsx** (UI 組件)
- 職責：窗口的視覺呈現和基礎交互
- 輸入：位置、大小、z-index、回調函數
- 輸出：渲染窗口 DOM

#### 2. **useWindowManager.ts** (狀態管理)
- 職責：全局窗口狀態（位置、大小、打開/關閉）
- 不包含：z-index 邏輯（移至專門的 hook）

#### 3. **useWindowFocus.ts** (焦點管理 - 新增)
```typescript
// 統一的焦點和 z-index 管理
export function useWindowFocus(openWindows: WindowName[]) {
  const [focusOrder, setFocusOrder] = useState<WindowName[]>([]);
  
  const focusWindow = useCallback((name: WindowName) => {
    setFocusOrder(prev => [...prev.filter(n => n !== name), name]);
  }, []);
  
  const getZIndex = useCallback((name: WindowName) => {
    const index = focusOrder.indexOf(name);
    return index === -1 ? 100 : 100 + index;
  }, [focusOrder]);
  
  return { focusOrder, focusWindow, getZIndex };
}
```

#### 4. **zIndexManager.ts** (工具函數)
```typescript
// Z-index 計算邏輯
export const BASE_Z_INDEX = 100;

export function calculateZIndex(
  windowName: WindowName,
  focusOrder: WindowName[]
): number {
  const index = focusOrder.indexOf(windowName);
  return index === -1 ? BASE_Z_INDEX : BASE_Z_INDEX + index;
}
```

---

## 🔄 遷移步驟

### 階段 1: 創建新結構 (30min)

1. **創建目錄**
```bash
mkdir -p frontend/components/features/window-manager/{components,hooks,types,utils}
```

2. **移動文件**
```bash
# 移動 Window 組件
mv frontend/components/common/Window.tsx \
   frontend/components/features/window-manager/components/

# 移動 useWindowManager
mv frontend/hooks/useWindowManager.ts \
   frontend/components/features/window-manager/hooks/

# 複製類型定義（暫時保留原文件以避免破壞）
cp frontend/types/window.ts \
   frontend/components/features/window-manager/types/index.ts
```

3. **創建新的 hook**
```typescript
// frontend/components/features/window-manager/hooks/useWindowFocus.ts
export function useWindowFocus() {
  // 從 page.tsx 提取的 zOrder 邏輯
}
```

4. **創建統一導出**
```typescript
// frontend/components/features/window-manager/index.ts
export { default as Window } from './components/Window';
export { useWindowManager } from './hooks/useWindowManager';
export { useWindowFocus } from './hooks/useWindowFocus';
export * from './types';
```

### 階段 2: 更新引用 (20min)

1. **更新 page.tsx**
```typescript
// 修改前
import { useWindowManager } from '@/hooks/useWindowManager';
import Window from '@/components/common/Window';

// 修改後
import { 
  useWindowManager, 
  useWindowFocus, 
  Window 
} from '@/components/features/window-manager';
```

2. **更新其他引用**
- 搜索所有 `@/hooks/useWindowManager` 並替換
- 搜索所有 `@/components/common/Window` 並替換

### 階段 3: 清理重複邏輯 (30min)

1. **簡化 page.tsx 中的 zOrder 邏輯**
```typescript
// 使用新的 useWindowFocus hook
const { focusOrder, focusWindow, getZIndex } = useWindowFocus(openWindows);

// 移除重複的 activateWindow 和 useEffect
```

2. **簡化 useWindowManager**
```typescript
// 移除 windowZIndexes 和 maxZIndex 相關邏輯
// 這些由 useWindowFocus 統一管理
```

### 階段 4: 刪除遺留代碼 (10min)

1. **刪除舊的 Window 系統**
```bash
rm -rf frontend/components/core/Window/
```

2. **驗證沒有引用**
```bash
grep -r "components/core/Window" frontend/
# 應該沒有結果
```

---

## ✅ 預期效果

### 代碼清晰度
- ✅ 窗口系統代碼集中在一個目錄
- ✅ 文件職責清晰，易於查找
- ✅ 新開發者容易理解結構

### 可維護性
- ✅ 消除重複的 z-index 邏輯
- ✅ 單一真實來源（Single Source of Truth）
- ✅ 修改窗口系統只需關注一個目錄

### 代碼行數
- 📉 **page.tsx**: 241 行 → ~200 行（減少 17%）
- 📉 **重複代碼**: 消除 ~40 行 z-index 管理邏輯

### 文件組織
```
Before: 4 個分散的位置
After:  1 個統一的 feature 目錄
```

---

## 🚀 實施建議

### 推薦順序
1. ✅ **先完成階段 1 (創建新結構)** - 低風險
2. ✅ **然後階段 2 (更新引用)** - 機械式操作
3. ⚠️ **謹慎進行階段 3 (清理重複)** - 需要測試
4. ✅ **最後階段 4 (刪除遺留)** - 確保無引用後執行

### 風險評估
- **低風險**: 移動文件 + 更新 import 路徑
- **中風險**: 重構 z-index 邏輯（需要仔細測試）
- **測試重點**: 
  - 窗口打開/關閉
  - 窗口拖動
  - 窗口焦點切換
  - 多窗口堆疊順序

---

## 📝 後續優化（可選）

### 1. TypeScript 嚴格模式
- 為所有窗口相關函數添加完整的類型註解
- 使用 `readonly` 和 `const assertion` 提高類型安全

### 2. 性能優化
- 使用 `useReducer` 替代複雜的 `useState` 邏輯
- 添加 `React.memo` 優化窗口組件渲染

### 3. 文檔完善
- 添加 JSDoc 註釋
- 創建 `WINDOW_SYSTEM.md` 說明文檔

---

## 📌 結論

**當前問題**:
- ❌ 文件分散在 3 個位置
- ❌ 存在重複的 z-index 邏輯
- ❌ 遺留未使用的舊代碼

**重構後**:
- ✅ 統一的 feature 目錄結構
- ✅ 清晰的職責劃分
- ✅ 消除重複，易於維護

**預計時間**: 1.5 小時
**風險等級**: 低到中（需要全面測試）
**建議優先級**: 中（可以在 Day 4 開始前進行）

