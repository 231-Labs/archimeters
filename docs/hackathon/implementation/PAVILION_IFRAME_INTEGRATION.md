# Pavilion iframe 集成問題與解決方案

## 問題概述

當 Pavilion 在 Archimeters 的 iframe 中嵌入時，存在以下問題：

### 1. ❌ Share Pavilion 按鈕沒有 tooltip
- **現象**: 在 iframe 中點擊 "Share Pavilion" 沒有 tooltip 提示
- **原因**: 可能是 iframe 的 CSS 隔離或 z-index 問題
- **狀態**: **需要在 Pavilion 源碼中修復**

### 2. ✅ 隱藏 Back to Home 按鈕（已處理）
- **現象**: iframe 中的 "Back to Home" 按鈕應該隱藏
- **解決方案**: Archimeters 已添加 `?embedded=true` URL 參數
- **狀態**: **需要在 Pavilion 源碼中讀取此參數並隱藏按鈕**

### 3. ❌ 錢包無法連接
- **現象**: iframe 內無法連接錢包，Archimeters 的錢包信息沒有傳遞進去
- **原因**: iframe sandbox 限制，無法訪問父窗口的 WalletProvider 上下文
- **狀態**: **需要實現跨 iframe 通信機制**

---

## Archimeters 側已完成的修改

### ✅ 1. 移除 Chrome Dots
```tsx
// 已移除紅黃綠裝飾點
```

### ✅ 2. 添加 URL 參數支持
```typescript
// frontend/config/pavilion.ts
export function getPavilionUrl(kioskId: string, embedded: boolean = false): string {
  const params = new URLSearchParams({
    kioskId,
    ...(embedded && { embedded: 'true' })
  });
  return `${PAVILION_BASE_URL}?${params.toString()}`;
}
```

### ✅ 3. iframe 配置
```tsx
<iframe
  src={getPavilionUrl(selectedPavilion.kioskId, true)}
  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
/>
```

---

## Pavilion 源碼需要的修改

### 🔧 1. 檢測嵌入模式並隱藏按鈕

```typescript
// 在 Pavilion 的主組件中
const isEmbedded = new URLSearchParams(window.location.search).get('embedded') === 'true';

// 條件渲染 Back to Home 按鈕
{!isEmbedded && (
  <button onClick={handleBackToHome}>
    Back to Home
  </button>
)}
```

### 🔧 2. 修復 Share Pavilion Tooltip

```typescript
// 檢查 tooltip 的 CSS
// 確保在 iframe 中也能正確顯示
.share-tooltip {
  position: absolute;
  z-index: 9999; // 確保足夠高
  pointer-events: none; // 不阻擋點擊
}

// 或使用 portal 來渲染 tooltip
import { createPortal } from 'react-dom';
{showTooltip && createPortal(
  <div className="tooltip">Copied!</div>,
  document.body
)}
```

### 🔧 3. 錢包連接方案

#### 方案 A: postMessage 通信（推薦）

**Pavilion 端 (iframe 內)**:
```typescript
// 請求父窗口的錢包地址
window.parent.postMessage({
  type: 'REQUEST_WALLET_INFO',
  source: 'pavilion'
}, '*');

// 監聽父窗口的回應
window.addEventListener('message', (event) => {
  if (event.data.type === 'WALLET_INFO') {
    const { address, publicKey } = event.data;
    // 使用錢包信息
  }
});

// 請求簽名交易
window.parent.postMessage({
  type: 'REQUEST_SIGN_TRANSACTION',
  transaction: txData
}, '*');
```

**Archimeters 端 (父窗口)**:
```typescript
// 在 PavilionWindow.tsx 中添加
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // 安全檢查
    if (event.origin !== 'https://pavilion-231.vercel.app') return;
    
    if (event.data.type === 'REQUEST_WALLET_INFO') {
      // 回傳錢包信息
      iframeRef.current?.contentWindow?.postMessage({
        type: 'WALLET_INFO',
        address: currentAccount?.address,
        publicKey: currentAccount?.publicKey
      }, '*');
    }
    
    if (event.data.type === 'REQUEST_SIGN_TRANSACTION') {
      // 處理交易簽名
      signTransaction(event.data.transaction);
    }
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [currentAccount]);
```

#### 方案 B: 獨立錢包連接

```typescript
// Pavilion 自己實現錢包連接
// 需要在 iframe 中包含完整的 @mysten/dapp-kit
<WalletProvider>
  <PavilionContent />
</WalletProvider>

// 缺點：用戶需要再次連接錢包
```

---

## 實現順序建議

### Phase 1: 基礎集成 ✅
- [x] Archimeters 添加 `embedded=true` 參數
- [x] 移除 Chrome dots

### Phase 2: Pavilion 源碼修改（需要進行）
- [ ] 讀取 `embedded` 參數並隱藏 Back to Home
- [ ] 修復 Share Pavilion tooltip 在 iframe 中的顯示

### Phase 3: 錢包集成（需要進行）
- [ ] 實現 postMessage 通信機制
- [ ] 在 Archimeters 添加消息監聽器
- [ ] 在 Pavilion 添加錢包請求邏輯
- [ ] 測試交易簽名流程

---

## 安全考慮

1. **Origin 驗證**: 必須驗證 postMessage 的來源
2. **數據驗證**: 驗證傳遞的交易數據格式
3. **用戶確認**: 交易簽名前顯示確認對話框
4. **Sandbox 限制**: 保持必要的 iframe sandbox 限制

---

## 測試清單

- [ ] `embedded=true` 參數正確傳遞
- [ ] Back to Home 按鈕在 iframe 中隱藏
- [ ] Share Pavilion tooltip 正確顯示
- [ ] 父窗口和 iframe 之間的 postMessage 通信
- [ ] 錢包地址正確傳遞到 iframe
- [ ] 交易簽名流程正常工作
- [ ] 在正常瀏覽器中功能不受影響

---

## 相關文件

### Archimeters
- `frontend/components/windows/PavilionWindow.tsx` - iframe 容器
- `frontend/config/pavilion.ts` - URL 生成函數

### Pavilion（需要修改）
- Share Pavilion 按鈕組件
- 主導航組件（Back to Home）
- 錢包連接邏輯

---

## 結論

- **問題 1 (Share tooltip)**: 需要在 Pavilion 源碼中修復 CSS
- **問題 2 (Back to Home)**: Archimeters 已完成，Pavilion 需要讀取參數
- **問題 3 (錢包連接)**: 需要雙方協作實現 postMessage 通信

建議優先實現 Phase 2，錢包集成可以作為後續優化。

