# 🎉 Phase 2.2 部署成功 - Enhanced Event System

## ✅ 部署信息

- **Transaction Digest**: `5egVS4LZiZkpUe6vaWUymzY7BjXaKBnYPD4hih8Tu3LP`
- **Status**: ✅ Success
- **Deployed Date**: 2025-11-05
- **Epoch**: 909
- **Gas Used**: 142,647,880 MIST (~0.143 SUI)

---

## 📦 已部署的物件 ID

### 核心物件
```typescript
PACKAGE_ID = '0x148ead9fea7de10ecbface9344b1c2338f3ac0f9b83478090cb3f9deaf8f84ec'
STATE_ID = '0xe2d25dec910ddd47f4a043cdf30cf453b9e95e27da518e74d1e3f0a6d0c7c0e3'
ATELIER_STATE_ID = '0xabbab36e9c7de8905262b21d7229ca9a3bfeca4baaad4fdb5f1af3c2f7976eea'
UPGRADE_CAP = '0x096baad2417d9c1f827a020d6264e5509933b75de2072932191f05a90a82ab32'
```

### Transfer Policies
```typescript
ATELIER_TRANSFER_POLICY = '0xa1cf59779fcf6dfbef99c06d5a0f49e229d914786470a2dbbe3e1b58569af06b'
SCULPT_TRANSFER_POLICY = '0x1c3897dac263e8aeb6a1f7ee80c4c3bb1e957019148d4b2509dd071eec2fb221'
```

### Transfer Policy Caps
```typescript
ATELIER_TRANSFER_POLICY_CAP = '0x28a45cf3e8f19d79b79def3821239bbcae7290a5661fedc05c238633135c4507'
SCULPT_TRANSFER_POLICY_CAP = '0x62f9c3ae556fc7ce7ca6017d5ba620d40457c97391de28be1370779acfb522ac'
```

### Display 物件
```typescript
MEMBERSHIP_DISPLAY = '0x69dfd8b1965eecaa68815015b76a768e1142a367c542bd840ec2d34baeff3f04'
ATELIER_DISPLAY = '0x6759e63e9fcf4c2c7808a7516b7db7d4a58a6ba826ddb2f5172d27aee915b46f'
SCULPT_DISPLAY = '0xb00d2aeceec3eec36910baf2944aae7c03e65f52a6fc968b7d4208a1843e5f3e'
```

### Publisher 物件
```typescript
PUBLISHER_ARCHIMETERS = '0x4e200cdd5d1884bb3d1ce14f4ca534892c206cd96a91b311c69aa75ae9f721c0'
PUBLISHER_ATELIER = '0xd2aa7c493c8f69e12ee402a39f168c41a28477b9ae7aee4c6100e5f5379cab27'
PUBLISHER_SCULPT = '0xdde6222b841e5a137aa7649c8c67ff4179ab056e48053520ba7e0bfb6fa4426d'
```

---

## 🆕 本次部署新增功能

### 1. 增強事件系統 📡
**問題**：Atelier 在 Kiosk 中無法直接查詢，導致 Gallery 窗口無法加載

**解決方案**：增強 `New_atelier` 事件，包含完整元數據

```move
public struct New_atelier has copy, drop {
    id: ID,
    pool_id: ID,
    pool_cap_id: ID,
    name: String,              // ✅ 新增
    photo: String,             // ✅ 新增
    algorithm: String,         // ✅ 新增
    data: String,             // ✅ 新增
    original_creator: address, // ✅ 新增
    price: u64,               // ✅ 新增
    publish_time: u64,        // ✅ 新增
}
```

### 2. Gallery 從事件讀取 🖼️
不再嘗試直接查詢 Kiosk 中的對象，而是從事件中讀取：

```typescript
const events = await suiClient.queryEvents({
  query: {
    MoveEventType: `${PACKAGE_ID}::atelier::New_atelier`
  },
  limit: 50,
  order: 'descending'
});

// 直接從事件構建數據
const atelierImages = events.data.map((eventData) => {
  const event = eventData.parsedJson;
  return {
    id: event.id,
    photoBlobId: event.photo,
    algorithmBlobId: event.algorithm,
    dataBlobId: event.data,
    // ... 其他字段
  };
});
```

### 3. 統一 Walrus 配置 🐋
創建 `frontend/config/walrus.ts` 統一管理 Walrus URL：

```typescript
export const WALRUS_CONFIG = {
  AGGREGATOR_URL: 'https://aggregator.testnet.walrus.atalma.io/v1/blobs',
  getBlobUrl: (blobId: string) => `.../${blobId}`,
};
```

---

## 🔧 修復的問題

### 問題 1: Gallery 無法加載 Atelier
- ❌ **錯誤**: `ERR_CONNECTION_REFUSED` 和 `TypeError: Failed to fetch`
- ✅ **原因**: Atelier 在 Kiosk 中，無法直接通過 `multiGetObjects` 查詢
- ✅ **修復**: 從事件讀取完整元數據

### 問題 2: 重複的 API 代理
- ❌ **問題**: 多個地方使用本地 `/api/walrus/blob/` 代理
- ✅ **修復**: 統一直接訪問 Walrus 聚合器

### 問題 3: Design Publisher Kiosk 參數缺失
- ❌ **問題**: `useTransaction` hook 沒有接收 `kioskId` 和 `kioskCapId`
- ✅ **修復**: 從 `useKiosk` hook 傳遞參數

---

## 🎯 E2E 測試清單

### ✅ 基礎功能（必須通過）
- [ ] **Mint Membership** - 創建新會員
- [ ] **Mint Atelier** - 發布設計（需要 Kiosk）
- [ ] **Gallery 加載** - 查看所有 Atelier（從事件讀取）
- [ ] **點擊 Atelier** - 進入 Atelier Viewer
- [ ] **Mint Sculpt** - 鑄造作品
- [ ] **Pool 提取** - 提取收益（含版稅分配）

### 🆕 新功能測試
- [ ] **Gallery 事件讀取**
  ```
  1. 打開 Gallery 窗口
  2. 應該看到所有已發布的 Atelier
  3. 圖片、名稱、價格正確顯示
  ```

- [ ] **Atelier Viewer 數據加載**
  ```
  1. 從 Gallery 點擊 Atelier
  2. 應該正確加載算法和配置
  3. 參數預覽正常工作
  ```

- [ ] **Design Publisher with Kiosk**
  ```
  1. 確保已選擇 Kiosk（在 Entry Window）
  2. 上傳設計並發布
  3. 交易成功，Atelier 放入 Kiosk
  4. Gallery 中立即可見
  ```

---

## 🔗 區塊鏈瀏覽器鏈接

### 查看部署交易
```
https://suiscan.xyz/testnet/tx/5egVS4LZiZkpUe6vaWUymzY7BjXaKBnYPD4hih8Tu3LP
```

### 查看合約
```
https://suiscan.xyz/testnet/object/0x148ead9fea7de10ecbface9344b1c2338f3ac0f9b83478090cb3f9deaf8f84ec
```

### 查看 TransferPolicy
```
Atelier: https://suiscan.xyz/testnet/object/0xa1cf59779fcf6dfbef99c06d5a0f49e229d914786470a2dbbe3e1b58569af06b
Sculpt: https://suiscan.xyz/testnet/object/0x1c3897dac263e8aeb6a1f7ee80c4c3bb1e957019148d4b2509dd071eec2fb221
```

---

## 📋 修改的檔案

### 合約 (contract/)
1. ✅ `sources/atelier.move`
   - 增強 `New_atelier` 事件結構
   - 在 `finalize_atelier_mint` 中發出完整事件

### 前端 (frontend/)
1. ✅ `utils/transactions.ts` - 更新所有物件 ID
2. ✅ `config/walrus.ts` - 新建統一配置
3. ✅ `components/features/gallery/hooks/useSeriesImages.ts` - 從事件讀取
4. ✅ `components/features/atelier-viewer/hooks/useAtelierData.ts` - 直接訪問 Walrus
5. ✅ `components/features/entry/index.tsx` - 直接訪問 Walrus
6. ✅ `components/features/design-publisher/hooks/useDesignPublisherForm.ts` - 添加 Kiosk 參數
7. ✅ `components/features/design-publisher/hooks/useTransaction.ts` - Kiosk 驗證

---

## 🎊 部署完成！

✅ 合約已成功部署到 Testnet
✅ 前端配置已更新
✅ Gallery 現在從事件讀取數據
✅ 與 Kiosk 架構完全兼容

**現在可以開始 E2E 測試了！** 🚀

測試重點：
1. Gallery 能否正確加載所有 Atelier
2. 點擊 Atelier 能否正確進入 Viewer
3. Design Publisher 能否正常發布（需要 Kiosk）
4. Sculpt Mint 功能是否正常

---

## 🔄 回滾方案（如需要）

如果遇到問題，可以回滾到上一版本：

```typescript
// 在 transactions.ts 中，取消註解舊版本：
export const PACKAGE_ID = '0x36331d1d938c0534867d22a741bd5376297df12e0ca594a78dea409fd4d57f28';
// ... 其他舊 ID
```

舊版本資訊：
- Deployment: `HpqpQQ2oDNozMyMaoLk7oieUQY7gXDoB7VtebT2XLbit`
- Epoch: 909

