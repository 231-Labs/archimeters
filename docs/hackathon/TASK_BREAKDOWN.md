# 黑客松任務分解與工時評估

> **當前日期**: 2025-11-10 (Day 6)  
> **剩餘時間**: 6 天 (144 小時)  
> **實際開發時間**: ~4.5 天 (考慮測試、文檔、休息)

---

## 📊 當前狀態總覽

### ✅ 已完成的功能 (100%)

| 模組 | 狀態 | 代碼位置 | 備註 |
|------|------|----------|------|
| Seal SDK 整合 - 合約層 | ✅ | `contract/sources/sculpt/sculpt.move` | `seal_approve_printer` 已實現 |
| Seal SDK 整合 - 前端層 | ✅ | `frontend/utils/seal.ts` | 加密功能完整 |
| Sculpt Mint 流程 | ✅ | `frontend/components/features/atelier-viewer/` | 含 STL 加密選項 |
| Sculpt 二級市場 - List | ✅ | `frontend/components/features/vault/hooks/useSculptMarketplace.ts` | 使用 Kiosk SDK |
| Sculpt 二級市場 - Purchase | ✅ | `frontend/components/features/marketplace/hooks/useMarketplacePurchase.ts` | 含版稅邏輯 |
| Vault - Atelier 詳情頁 | ✅ | `frontend/components/features/vault/components/AtelierDetailModal.tsx` | UI 完整 |
| Vault - Sculpt 詳情頁 | ✅ | `frontend/components/features/vault/components/SculptDetailModal.tsx` | 含白名單管理 |
| Marketplace 重構 | ✅ | `frontend/components/windows/MarketplaceWindow.tsx` | 雙 Tab 設計 |

### 🚧 需要完成的功能

| 優先級 | 模組 | 當前狀態 | 完成度 | 預計工時 |
|--------|------|----------|--------|----------|
| **P0** | Seal 解密流程驗證 | 未開始 | 0% | 4-5 小時 |
| **P0** | Atelier 二級市場 - List 功能 | 未實現 | 30% | 3-4 小時 |
| **P0** | Atelier 二級市場 - 前端整合 | 未實現 | 30% | 2-3 小時 |
| **P1** | Pavilion 基礎集成 | 部分完成 | 50% | 2-3 小時 |
| **P1** | Marketplace 優化 | 未開始 | 0% | 1-2 小時 |
| **P2** | E2E 測試與 Bug 修復 | 未開始 | 0% | 4-6 小時 |
| **P2** | Demo 準備與文檔 | 未開始 | 0% | 4-5 小時 |

---

## 🎯 P0 任務分解（必須完成）

### Task 1: Seal 解密流程驗證

**目標**: 實現並驗證 Printer 解密 STL 文件的完整流程

#### 子任務清單

| # | 子任務 | 描述 | 複雜度 | 工時 | 依賴 |
|---|--------|------|--------|------|------|
| 1.1 | 研究 Seal SDK 解密 API | 閱讀文檔，理解 `decrypt()` 方法 | 低 | 0.5h | - |
| 1.2 | 實現 `decryptModelFile()` 函數 | 在 `utils/seal.ts` 添加解密函數 | 中 | 1.5h | 1.1 |
| 1.3 | 創建解密測試頁面/組件 | 簡單的 UI 測試解密功能 | 低 | 1h | 1.2 |
| 1.4 | 測試白名單授權流程 | 測試 `seal_approve_printer` 合約函數 | 中 | 1h | 1.2 |
| 1.5 | E2E 測試完整流程 | Mint 加密 → 添加 Printer → 解密 | 高 | 1h | 1.4 |

**總工時**: 4-5 小時  
**優先級**: 🔴 P0 - 最高（黑客松核心賣點）  
**風險**: 中 - Seal SDK 解密 API 可能有兼容性問題

#### 詳細實施計劃

**1.1 研究 Seal SDK 解密 API** (0.5h)
```typescript
// 需要了解的內容：
// - SealClient.decrypt() 方法簽名
// - 需要哪些參數 (packageId, id, encryptedData)
// - 如何處理返回的解密數據
// - 錯誤處理機制
```

**1.2 實現 decryptModelFile() 函數** (1.5h)

文件位置: `frontend/utils/seal.ts`

```typescript
/**
 * Decrypt an encrypted model file using Seal SDK
 * @param encryptedBlob - The encrypted blob from Walrus
 * @param resourceId - The resource ID (packageId:id)
 * @param walletAddress - The wallet address attempting to decrypt
 * @returns Decrypted file blob
 */
export async function decryptModelFile(
  encryptedBlob: Blob,
  resourceId: string,
  walletAddress: string,
  network: 'testnet' | 'mainnet' = 'testnet'
): Promise<Blob> {
  // 1. 解析 resourceId (packageId:id)
  const [packageId, id] = resourceId.split(':');
  
  // 2. 獲取 SealClient
  const sealClient = getSealClient(network);
  
  // 3. 將 Blob 轉為 Uint8Array
  const encryptedData = new Uint8Array(await encryptedBlob.arrayBuffer());
  
  // 4. 調用解密 API
  const decryptedData = await sealClient.decrypt({
    packageId,
    id,
    encryptedObject: encryptedData,
    // 可能需要提供 proof 或其他參數
  });
  
  // 5. 轉回 Blob
  return new Blob([decryptedData], { type: 'application/octet-stream' });
}
```

**1.3 創建解密測試頁面** (1h)

位置: `frontend/components/features/vault/components/SculptDetailModal.tsx`

在 Sculpt 詳情頁添加「測試解密」按鈕（僅在 encrypted=true 時顯示）

```typescript
// 在 SculptDetailModal.tsx 中添加
const handleTestDecrypt = async () => {
  if (!sculpt.structure) return;
  
  try {
    // 1. 從 Walrus 獲取加密文件
    const encryptedBlob = await fetch(
      `https://aggregator.walrus-testnet.walrus.space/v1/${sculpt.structure}`
    ).then(r => r.blob());
    
    // 2. 嘗試解密
    const decryptedBlob = await decryptModelFile(
      encryptedBlob,
      resourceId,
      currentAccount.address
    );
    
    // 3. 下載解密後的文件
    const url = URL.createObjectURL(decryptedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decrypted_model.stl';
    a.click();
  } catch (error) {
    console.error('Decryption failed:', error);
  }
};
```

**1.4 測試白名單授權流程** (1h)

需要驗證：
- 未授權的地址無法解密（應該拋出錯誤）
- 添加到白名單後可以解密
- `seal_approve_printer` 函數正確工作

**1.5 E2E 測試** (1h)

完整流程測試：
1. 創建 Atelier
2. Mint Sculpt（勾選 Generate STL）
3. 驗證 STL 已加密上傳
4. 添加測試地址到白名單
5. 嘗試解密並下載
6. 移除白名單，驗證無法解密

---

### Task 2: Atelier 二級市場 - List 功能

**目標**: 用戶可以在 Vault 中將自己的 Atelier 上架出售

#### 子任務清單

| # | 子任務 | 描述 | 複雜度 | 工時 | 依賴 |
|---|--------|------|--------|------|------|
| 2.1 | 檢查合約函數 | 確認 `list_atelier` 函數已存在 | 低 | 0.5h | - |
| 2.2 | 實現 `listAtelier()` hook | 在 `useAtelierMarketplace.ts` 中實現 | 中 | 1.5h | 2.1 |
| 2.3 | 添加 List UI | 在 AtelierDetailModal 添加 List 按鈕和價格輸入 | 低 | 1h | 2.2 |
| 2.4 | 測試 List 流程 | 測試上架和狀態更新 | 低 | 1h | 2.3 |

**總工時**: 3-4 小時  
**優先級**: 🔴 P0  
**風險**: 低 - 合約已實現，主要是前端整合

#### 詳細實施計劃

**2.1 檢查合約函數** (0.5h)

文件: `contract/sources/atelier/marketplace.move`

確認已有函數：
```move
public fun list_atelier<T>(
    kiosk: &mut Kiosk,
    kiosk_cap: &KioskOwnerCap,
    atelier: Atelier<T>,
    price: u64,
    ctx: &TxContext
)
```

**2.2 實現 listAtelier() hook** (1.5h)

文件: `frontend/components/features/vault/hooks/useAtelierMarketplace.ts`

當前狀態：該文件已存在但 `listAtelier` 函數未實現

需要添加：
```typescript
const listAtelier = async (
  atelierId: string,
  kioskId: string,
  kioskCapId: string,
  price: number,
  onSuccessCallback?: () => void
) => {
  // 1. 獲取 KioskClient
  const kioskClient = new KioskClient({
    client: suiClient as any,
    network: Network.TESTNET,
  });

  // 2. 獲取用戶的 KioskOwnerCap
  const { kioskOwnerCaps } = await kioskClient.getOwnedKiosks({
    address: currentAccount.address,
  });

  // 3. 找到對應的 Cap
  const cap = kioskOwnerCaps.find(c => c.kioskId === kioskId);

  // 4. 創建交易
  const tx = new Transaction();
  const kioskTx = new KioskTransaction({
    transaction: tx,
    kioskClient,
    cap,
  });

  // 5. 調用 list
  kioskTx.list({
    itemId: atelierId,
    itemType: ATELIER_TYPE,
    price: BigInt(price),
  });

  kioskTx.finalize();

  // 6. 執行交易
  signAndExecuteTransaction(...);
};
```

**2.3 添加 List UI** (1h)

文件: `frontend/components/features/vault/components/AtelierDetailModal.tsx`

添加元素：
```typescript
// 在 modal 中添加 List section
{atelier.owner === currentAccount?.address && (
  <div className="border-t border-neutral-700 pt-4">
    <h3>List for Sale</h3>
    <input 
      type="number"
      placeholder="Price in SUI"
      value={listPrice}
      onChange={(e) => setListPrice(e.target.value)}
    />
    <button onClick={handleList}>
      List on Marketplace
    </button>
  </div>
)}
```

**2.4 測試 List 流程** (1h)

測試場景：
1. 在 Vault 中選擇自己的 Atelier
2. 點擊 List 按鈕
3. 輸入價格並確認
4. 檢查交易成功
5. 在 Marketplace 中看到該 Atelier
6. 測試 Delist 功能

---

### Task 3: Atelier 二級市場 - 前端整合

**目標**: 在 Marketplace 中顯示掛售的 Atelier，並支持購買

#### 子任務清單

| # | 子任務 | 描述 | 複雜度 | 工時 | 依賴 |
|---|--------|------|--------|------|------|
| 3.1 | 修改 Marketplace 數據查詢 | 查詢 Kiosk 中的 Atelier | 中 | 1h | 2.4 |
| 3.2 | 創建 Atelier Marketplace Card | 顯示掛售中的 Atelier | 低 | 0.5h | 3.1 |
| 3.3 | 實現購買流程 | 調用 `purchase_atelier_with_pool` | 中 | 1h | 3.2 |
| 3.4 | 測試購買流程 | E2E 測試 | 低 | 0.5h | 3.3 |

**總工時**: 2-3 小時  
**優先級**: 🔴 P0  
**風險**: 低 - 購買函數已在 `useAtelierMarketplace.ts` 中實現

#### 詳細實施計劃

**3.1 修改 Marketplace 數據查詢** (1h)

文件: `frontend/components/features/marketplace/hooks/useMarketplaceData.ts`

需要添加查詢掛售中的 Atelier：
```typescript
// 查詢所有 Kiosk 中的 Atelier
const fetchListedAteliers = async () => {
  // 使用 Kiosk SDK 查詢
  const listedAteliers = await kioskClient.getKiosks({
    filter: {
      itemType: ATELIER_TYPE,
      hasListing: true,
    }
  });
  
  return listedAteliers;
};
```

**3.2 創建 Atelier Marketplace Card** (0.5h)

文件: `frontend/components/features/marketplace/components/AtelierMarketplaceCard.tsx`

類似於 `SculptMarketplaceCard`，但顯示：
- Atelier 名稱
- 原創作者
- 當前擁有者
- 價格
- 已 Mint 的 Sculpt 數量

**3.3 實現購買流程** (1h)

文件: `frontend/components/features/marketplace/hooks/useAtelierPurchase.ts`

該 hook 已經存在於 `useAtelierMarketplace.ts`，只需要在前端調用：

```typescript
const handlePurchase = async () => {
  await purchaseAtelier(
    atelier.id,
    atelier.kioskId,
    atelier.poolId,
    atelier.originalOwner,
    price,
    royaltyAmount,
    ATELIER_TRANSFER_POLICY
  );
};
```

**3.4 測試購買流程** (0.5h)

測試：
1. 用戶 A List Atelier
2. 用戶 B 在 Marketplace 中看到
3. 用戶 B 購買
4. Pool 中的餘額轉給用戶 A
5. Ownership 轉給用戶 B

---

## 🎯 P1 任務分解（高優先級）

### Task 4: Pavilion 基礎集成

**目標**: 修復 iframe 集成問題，實現基本的錢包信息傳遞

#### 子任務清單

| # | 子任務 | 描述 | 複雜度 | 工時 | 依賴 |
|---|--------|------|--------|------|------|
| 4.1 | 修復 Pavilion embedded 模式 | 在 Pavilion 中讀取 `embedded` 參數 | 低 | 0.5h | - |
| 4.2 | 實現 postMessage 通信 | 父子窗口通信機制 | 中 | 1.5h | 4.1 |
| 4.3 | 測試錢包地址傳遞 | 驗證通信正常 | 低 | 0.5h | 4.2 |
| 4.4 | 配置真實的 Pavilion Kiosk | 更新 `pavilion.ts` 配置 | 低 | 0.5h | - |

**總工時**: 2-3 小時  
**優先級**: 🟡 P1  
**風險**: 中 - Pavilion 是獨立專案，需要協調

#### 詳細實施計劃

**4.1 修復 Pavilion embedded 模式** (0.5h)

這需要在 Pavilion 專案中修改，如果你有權限：

```typescript
// 在 Pavilion 的主組件中
const isEmbedded = new URLSearchParams(window.location.search)
  .get('embedded') === 'true';

// 條件渲染
{!isEmbedded && (
  <BackToHomeButton />
)}
```

**4.2 實現 postMessage 通信** (1.5h)

文件: `frontend/components/windows/PavilionWindow.tsx`

添加監聽器：
```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // 安全檢查
    if (!event.origin.includes('pavilion-231.vercel.app')) return;
    
    if (event.data.type === 'REQUEST_WALLET_INFO') {
      // 回傳錢包信息
      iframeRef.current?.contentWindow?.postMessage({
        type: 'WALLET_INFO',
        address: currentAccount?.address,
      }, '*');
    }
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [currentAccount]);
```

在 Pavilion 中（如果可以修改）：
```typescript
// 請求錢包信息
window.parent.postMessage({
  type: 'REQUEST_WALLET_INFO',
  source: 'pavilion'
}, '*');

// 監聽回應
window.addEventListener('message', (event) => {
  if (event.data.type === 'WALLET_INFO') {
    setWalletAddress(event.data.address);
  }
});
```

**4.3 測試通信** (0.5h)

驗證：
- iframe 成功載入
- 錢包地址正確傳遞
- Pavilion 能顯示錢包地址

**4.4 配置真實 Pavilion Kiosk** (0.5h)

文件: `frontend/config/pavilion.ts`

更新 `PAVILION_KIOSKS` 數組，添加真實的 Pavilion：
```typescript
{
  id: 'archimeters-showcase',
  name: 'Archimeters Showcase',
  kioskId: '0x...', // 真實的 Kiosk ID
  description: 'Official Archimeters 3D design showcase',
  category: '3D Design',
},
```

---

### Task 5: Marketplace 優化

**目標**: 添加 Trending 排序和 UI 優化

#### 子任務清單

| # | 子任務 | 描述 | 複雜度 | 工時 | 依賴 |
|---|--------|------|--------|------|------|
| 5.1 | 實現 Trending 排序 | 按 Sculpt 數量排序 Atelier | 低 | 0.5h | 3.4 |
| 5.2 | 添加排序 UI | 排序按鈕和選項 | 低 | 0.5h | 5.1 |
| 5.3 | 添加空狀態處理 | 無數據時的提示 | 低 | 0.5h | - |

**總工時**: 1-2 小時  
**優先級**: 🟡 P1  
**風險**: 低

---

## 🎯 P2 任務分解（錦上添花）

### Task 6: E2E 測試與 Bug 修復

**目標**: 完整測試所有功能，修復發現的問題

#### 測試清單

| # | 測試場景 | 預計時間 | 優先級 |
|---|----------|----------|--------|
| 6.1 | 完整 Mint 流程（含加密） | 1h | P0 |
| 6.2 | Sculpt 二級市場 List/Buy | 1h | P0 |
| 6.3 | Atelier 二級市場 List/Buy | 1h | P0 |
| 6.4 | Seal 解密流程 | 1h | P0 |
| 6.5 | Pavilion 集成 | 0.5h | P1 |
| 6.6 | 各種邊緣情況 | 1.5h | P1 |

**總工時**: 4-6 小時  
**優先級**: 🟢 P2（但非常重要）  

---

### Task 7: Demo 準備與文檔

**目標**: 準備黑客松提交材料

#### 子任務清單

| # | 子任務 | 描述 | 工時 |
|---|--------|------|------|
| 7.1 | 準備 Demo Ateliers | 創建 3-5 個精美的 Atelier | 1.5h |
| 7.2 | 錄製 Demo 影片 | 5-10 分鐘演示影片 | 2h |
| 7.3 | 撰寫 README | 項目介紹、功能說明、安裝指南 | 1h |
| 7.4 | 準備 Pitch Deck | PPT/簡報（如果需要） | 1.5h |

**總工時**: 4-5 小時  
**優先級**: 🟢 P2  

---

## 📅 時間規劃建議

### Day 6 (今天) - 8 小時

**上午 (4h)**
- [x] 任務分析完成 ✓
- [ ] Task 1.1-1.3: Seal 解密實現 (3h)

**下午 (4h)**
- [ ] Task 1.4-1.5: Seal 測試完成 (1h)
- [ ] Task 2.1-2.3: Atelier List 功能 (3h)

**預期成果**: Seal 解密可用、Atelier List 功能完成

---

### Day 7 - 8 小時

**上午 (4h)**
- [ ] Task 2.4: Atelier List 測試 (1h)
- [ ] Task 3.1-3.3: Marketplace 整合 (3h)

**下午 (4h)**
- [ ] Task 3.4: 購買流程測試 (0.5h)
- [ ] Task 4.1-4.3: Pavilion 集成 (2h)
- [ ] Task 5.1-5.3: Marketplace 優化 (1.5h)

**預期成果**: 所有 P0/P1 功能完成

---

### Day 8 - 8 小時

**全天**
- [ ] Task 6: E2E 測試 (6h)
- [ ] Bug 修復 (2h)

**預期成果**: 所有功能穩定運行

---

### Day 9 - 8 小時

**全天**
- [ ] Task 7.1-7.2: Demo 準備 (3.5h)
- [ ] 最後優化 (2h)
- [ ] 部署檢查 (1h)
- [ ] Buffer 時間 (1.5h)

**預期成果**: Demo 就緒

---

### Day 10 - 6 小時

**上午 (4h)**
- [ ] Task 7.3-7.4: 文檔和 Pitch (2.5h)
- [ ] 最終檢查 (1.5h)

**下午 (2h)**
- [ ] 提交黑客松 (1h)
- [ ] Buffer (1h)

**預期成果**: 提交完成 🎉

---

## 📊 工時統計

| 優先級 | 任務數 | 總工時 | 百分比 |
|--------|--------|--------|--------|
| P0 | 3 | 9-12h | 33% |
| P1 | 2 | 3-5h | 14% |
| P2 | 2 | 8-11h | 30% |
| Testing | 1 | 4-6h | 16% |
| Buffer | - | 6-8h | 20% |
| **總計** | **8** | **30-42h** | **100%** |

**可用時間**: 4.5 天 × 8 小時 = 36 小時  
**計劃時間**: 30-42 小時  
**結論**: ✅ 時間充足，但需要嚴格執行

---

## 🔗 任務依賴關係圖

```
Task 1 (Seal 解密) ─────────────┐
                                 │
Task 2 (Atelier List) ──────────┼─→ Task 6 (E2E 測試)
                                 │        │
Task 3 (Atelier Purchase) ──────┤        │
                                 │        ↓
Task 4 (Pavilion) ───────────────┤   Task 7 (Demo)
                                 │
Task 5 (Marketplace) ────────────┘
```

**關鍵路徑**: Task 2 → Task 3 → Task 6 → Task 7

**並行任務**:
- Task 1 和 Task 2 可以並行開發
- Task 4 和 Task 5 可以並行開發

---

## ⚠️ 風險評估

| 風險 | 可能性 | 影響 | 應對策略 |
|------|--------|------|----------|
| Seal 解密 API 不兼容 | 中 | 高 | 降級方案：展示加密功能，解密作為「未來功能」 |
| Pavilion 修改無法完成 | 高 | 低 | 保持 iframe，在文檔中說明限制 |
| 合約 Bug | 低 | 高 | 已經過測試，風險低 |
| 時間不足 | 中 | 中 | 砍掉 P2 任務，專注 P0/P1 |

---

## 📝 每日檢查清單

### 每天開始前
- [ ] 查看今日任務清單
- [ ] 準備好開發環境
- [ ] 查看昨日的 Bug 記錄

### 每天結束時
- [ ] 更新 progress.md
- [ ] 提交代碼到 git
- [ ] 記錄遇到的問題
- [ ] 規劃明日任務

---

## 🎯 成功標準

### 必須達成 (P0)
- ✅ Seal 加密功能演示
- ✅ Seal 解密流程演示
- ✅ Sculpt 二級市場完整流程
- ✅ Atelier 二級市場完整流程

### 期望達成 (P1)
- ✅ Pavilion 基礎展示
- ✅ 精美的 UI 和 UX
- ✅ 完整的 Demo 影片

### 加分項 (P2)
- ✅ 詳細的技術文檔
- ✅ 多個 Demo Atelier
- ✅ 完善的錯誤處理

---

**最後更新**: 2025-11-10  
**下次更新**: 每日任務完成後


