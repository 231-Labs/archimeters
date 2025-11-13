# 每日行動指南 - 剩餘 6 天衝刺

> **當前**: Day 6/10  
> **目標**: 完成所有 P0/P1 功能，準備提交

---

## 📋 快速參考

### 核心任務優先級
```
🔴 P0 - 必須完成 (9-12h)
├─ Seal 解密流程 (4-5h)
├─ Atelier List 功能 (3-4h)
└─ Atelier Marketplace 整合 (2-3h)

🟡 P1 - 高優先級 (3-5h)
├─ Pavilion 集成 (2-3h)
└─ Marketplace 優化 (1-2h)

🟢 P2 - 錦上添花 (12-16h)
├─ E2E 測試 (4-6h)
├─ Demo 準備 (4-5h)
└─ 文檔撰寫 (4-5h)
```

---

## 🎯 Day 6 - 今天 (2025-11-10)

### 目標
- ✅ 完成 Seal 解密功能
- ✅ 完成 Atelier List 功能

### 上午 4 小時 (9:00-13:00)

#### ⏰ 9:00-10:30 | Seal 解密研究與實現 (1.5h)

**文件**: `frontend/utils/seal.ts`

```typescript
// 需要實現的函數
export async function decryptModelFile(
  encryptedBlob: Blob,
  resourceId: string,
  walletAddress: string
): Promise<Blob> {
  // 1. 解析 resourceId
  // 2. 獲取 SealClient
  // 3. 調用 decrypt API
  // 4. 返回解密後的 Blob
}
```

**步驟**:
1. 閱讀 Seal SDK 文檔的 decrypt 部分
2. 理解參數需求（packageId, id, encryptedObject）
3. 實現完整的解密邏輯
4. 添加錯誤處理

**檢查點**: 函數編譯通過，邏輯正確

---

#### ⏰ 10:30-12:00 | Seal 解密 UI 整合 (1.5h)

**文件**: `frontend/components/features/vault/components/SculptDetailModal.tsx`

**需要添加**:
```typescript
// 1. 解密按鈕（僅 encrypted=true 時顯示）
// 2. handleTestDecrypt 函數
// 3. Loading 狀態
// 4. 下載解密後的文件
```

**步驟**:
1. 在 UI 中添加「Test Decrypt」按鈕
2. 實現點擊處理函數
3. 從 Walrus 獲取加密文件
4. 調用解密函數
5. 觸發下載

**檢查點**: 按鈕顯示，點擊可觸發解密

---

#### ⏰ 12:00-13:00 | Seal 測試 (1h)

**測試場景**:
1. 創建一個帶 STL 的 Sculpt
2. 驗證 STL 已加密上傳
3. 嘗試解密（應該失敗，未授權）
4. 添加當前地址到白名單
5. 再次嘗試解密（應該成功）
6. 下載並檢查 STL 文件

**檢查點**: 完整流程走通，解密成功

---

### 下午 4 小時 (14:00-18:00)

#### ⏰ 14:00-15:00 | 檢查 Atelier Marketplace 合約 (1h)

**文件**: `contract/sources/atelier/marketplace.move`

**需要確認**:
- ✅ `list_atelier` 函數存在
- ✅ `delist_atelier` 函數存在
- ✅ `purchase_atelier_with_pool` 函數存在
- ✅ 參數正確

**如果有問題**: 需要修改合約並重新部署（風險高，慎重考慮）

**檢查點**: 合約函數完整，參數正確

---

#### ⏰ 15:00-17:00 | 實現 Atelier List Hook (2h)

**文件**: `frontend/components/features/vault/hooks/useAtelierMarketplace.ts`

**需要實現**:
```typescript
const listAtelier = async (
  atelierId: string,
  kioskId: string,
  kioskCapId: string,
  price: number,
  onSuccessCallback?: () => void
) => {
  // 1. 獲取 KioskClient
  // 2. 獲取 KioskOwnerCap
  // 3. 創建 Transaction
  // 4. 調用 kioskTx.list()
  // 5. 執行交易
}
```

**步驟**:
1. 參考 `useSculptMarketplace.ts` 的實現
2. 修改 itemType 為 ATELIER_TYPE
3. 處理交易成功/失敗
4. 添加錯誤處理

**檢查點**: 函數編譯通過，邏輯正確

---

#### ⏰ 17:00-18:00 | Atelier List UI (1h)

**文件**: `frontend/components/features/vault/components/AtelierDetailModal.tsx`

**需要添加**:
```typescript
// 1. List section UI
// 2. 價格輸入框
// 3. List 按鈕
// 4. Loading 狀態
// 5. 成功/失敗提示
```

**檢查點**: UI 完整，可以輸入價格並點擊 List

---

### 晚上檢查

#### ✅ 今日成果檢查清單
- [ ] Seal 解密函數實現完成
- [ ] Seal 解密 UI 整合完成
- [ ] 解密測試通過
- [ ] Atelier List Hook 實現完成
- [ ] Atelier List UI 完成

#### 📝 更新文檔
- [ ] 更新 `progress.md` 進度
- [ ] 提交今日代碼到 git
- [ ] 記錄遇到的問題

---

## 🎯 Day 7 - 明天 (2025-11-11)

### 目標
- ✅ 完成 Atelier Marketplace 整合
- ✅ 完成 Pavilion 基礎集成
- ✅ 完成 Marketplace 優化

### 上午 4 小時

#### ⏰ 9:00-10:00 | Atelier List 測試 (1h)
- 在 Vault 中測試 List 功能
- 檢查交易是否成功
- 驗證 Atelier 狀態更新

#### ⏰ 10:00-13:00 | Atelier Marketplace 數據查詢和顯示 (3h)
- 修改 `useMarketplaceData.ts` 查詢 Atelier
- 創建 `AtelierMarketplaceCard` 組件
- 在 Marketplace 中顯示掛售的 Atelier

### 下午 4 小時

#### ⏰ 14:00-14:30 | Atelier 購買流程測試 (0.5h)
- E2E 測試購買流程
- 驗證 Pool 轉移
- 驗證 Ownership 更新

#### ⏰ 14:30-16:30 | Pavilion 集成 (2h)
- 實現 postMessage 通信
- 測試錢包地址傳遞
- 配置真實 Pavilion Kiosk

#### ⏰ 16:30-18:00 | Marketplace 優化 (1.5h)
- 實現 Trending 排序
- 添加排序 UI
- 添加空狀態處理

---

## 🎯 Day 8 (2025-11-12) - E2E 測試日

### 全天 8 小時 - 測試與修復

#### 上午 4 小時
- 完整 Mint 流程測試（含加密）
- Sculpt 二級市場測試
- Atelier 二級市場測試

#### 下午 4 小時
- Seal 解密流程測試
- Pavilion 集成測試
- Bug 修復

### 預期成果
- 所有功能穩定運行
- 無嚴重 Bug
- 性能良好

---

## 🎯 Day 9 (2025-11-13) - Demo 準備日

### 上午 4 小時
- 準備 3-5 個精美的 Demo Atelier
- 錄製 Demo 影片前半部分

### 下午 4 小時
- 完成 Demo 影片錄製
- 最後優化和部署檢查
- Buffer 時間

---

## 🎯 Day 10 (2025-11-14) - 提交日

### 上午 4 小時
- 撰寫完整的 README
- 準備 Pitch Deck（如果需要）
- 最終檢查

### 下午 2 小時
- 提交黑客松
- 慶祝 🎉

---

## 📊 時間分配統計

```
Day 6: P0 任務            8h  ████████░░
Day 7: P0+P1 任務         8h  ████████░░
Day 8: 測試               8h  ████████░░
Day 9: Demo               8h  ████████░░
Day 10: 提交              6h  ██████░░░░
                        ─────
總計:                    38h

可用時間: 36-40h
Buffer: 2-4h
```

---

## ⚠️ 每日風險檢查

### 🔴 高風險項目（每日必檢）
- [ ] Seal SDK API 是否正常工作
- [ ] 合約交易是否成功
- [ ] Walrus 文件上傳是否穩定

### 🟡 中風險項目（每 2 天檢查）
- [ ] Pavilion 集成進度
- [ ] UI 性能
- [ ] 瀏覽器兼容性

### 降級方案（如果時間不足）
1. 砍掉 Pavilion 集成（說明為未來功能）
2. 砍掉 Marketplace Trending
3. 砍掉部分測試（但保留核心流程測試）

---

## 📞 快速行動指令

### 開始新的任務
```bash
# 1. 切換到對應分支（可選）
git checkout -b feature/seal-decrypt

# 2. 定位到文件
code frontend/utils/seal.ts

# 3. 開始計時
# 設置番茄鐘 25 分鐘
```

### 完成任務後
```bash
# 1. 測試
npm run dev  # 啟動開發服務器測試

# 2. 提交
git add .
git commit -m "feat: implement seal decryption"
git push

# 3. 更新進度
# 更新 progress.md 和 TODO list
```

### 遇到阻塞
```bash
# 1. 記錄問題
echo "問題: ..." >> docs/hackathon/BLOCKED.md

# 2. 跳過到下一個任務

# 3. 晚上集中處理阻塞問題
```

---

## 🎯 成功標準

### Day 6 結束時
- ✅ Seal 解密可用
- ✅ Atelier List UI 完成

### Day 7 結束時
- ✅ Atelier Marketplace 完整
- ✅ Pavilion 基本可用
- ✅ 所有 P0/P1 完成

### Day 8 結束時
- ✅ 所有功能測試通過
- ✅ 無嚴重 Bug

### Day 9 結束時
- ✅ Demo 影片完成
- ✅ 項目可展示

### Day 10
- ✅ 提交成功 🎉

---

## 💪 每日激勵

### 進度追蹤
```
Day 6  ████░░░░░░  40% ← YOU ARE HERE
Day 7  ████████░░  80%
Day 8  █████████░  90%
Day 9  ██████████  100%
Day 10 🎉 SUBMIT!
```

### 記住
- 專注當下任務，不要多線程
- 每完成一個任務就打勾 ✅
- 遇到問題先記錄，不要陷入兔子洞
- 保持節奏，不要熬夜
- 相信自己，你可以的！💪

---

**最後更新**: 2025-11-10  
**下次更新**: 今晚睡前


