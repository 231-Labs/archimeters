# 🎉 部署成功！Phase 2 - Marketplace Integration

## ✅ 部署信息

- **Transaction Digest**: `F35rFpfg7xDSKgXSgWkmfMEkv3h1WncRTLjDVcNAASNy`
- **Status**: ✅ Success
- **Deployed Date**: 2025-11-05
- **Epoch**: 909
- **Gas Used**: 141,074,680 MIST (~0.141 SUI)

---

## 📦 已部署的物件 ID

### 核心物件
```typescript
PACKAGE_ID = '0x1d97a384a6b79a31bb41091b805aae1eb6536c83be56f6f345fc74f8b2f959cb'
STATE_ID = '0xcab90c664ccf4ea54f3fff4782496c2f50a84eb5e16bbfc70682630febf762a4'
ATELIER_STATE_ID = '0xb7cc66912818fe1080829a4941a172a59c857d0f14480c9a5fd334ce4aca5d43'
UPGRADE_CAP = '0x6d013bf6894ec2ba92421294a2a45e8bcf1c4e47203cf30650767c37e1a0e9ee'
```

### Transfer Policies ⭐ (新增)
```typescript
ATELIER_TRANSFER_POLICY = '0x6d83c78a64577b25057dc0bf8703f91486814fce0641cbf6cbc45436aa9ac50f'
SCULPT_TRANSFER_POLICY = '0xe4c28bd2105f21958be26c656cb23d2ac68be3bb66d31098044fbdc84ab3de70'
```

### Transfer Policy Caps ⭐ (新增)
```typescript
ATELIER_TRANSFER_POLICY_CAP = '0x1da25e2759e8de3ac690c80fdd1af73145007623bd0a4f7580684c9ca559a411'
SCULPT_TRANSFER_POLICY_CAP = '0x5b8a470f9c74870be77e36d3cc9f9f0261f770b5b4c298ba34071158d19f85af'
```

### Display 物件
```typescript
MEMBERSHIP_DISPLAY = '0x5cf24fdf558fb4d1a860caa34720156f44126e0fc29f29b598ade729c6dd76d4'
ATELIER_DISPLAY = '0xf2ac2570d5df115a9be6315551ecb1250d3281c8875efe7268165ff6ba65acbd'
SCULPT_DISPLAY = '0x99dd08220df57f2e4117e325314a11239a960bd9274fd9c42b8304e43770b2e6'
```

### Publisher 物件
```typescript
PUBLISHER_ARCHIMETERS = '0x6ee31d3e098df36ae66291eb4336b85f8dcbabf22eb32e0d77274f49bfeb3bcd'
PUBLISHER_ATELIER = '0xe7259583cc865cbec485ab60584daf54493df499d99f09b64010294db2127299'
PUBLISHER_SCULPT = '0xe9d7a3582b1e270da9363b7e34232d904f19ad1e42c8069e63d7aa3410c649d9'
```

---

## 🆕 本次部署新增功能

### 1. 獨立的 Marketplace 模塊
- ✅ `atelier_marketplace.move` (150 行)
- 清晰的關注點分離
- 專門處理市場交易邏輯

### 2. Pool 提取自動版稅 💰
```move
// 默認 2.5% 給原創者
const DEFAULT_CREATOR_ROYALTY_BPS: u64 = 250;

// 轉讓後自動分配
if (atelier.current_owner != atelier.original_creator) {
    creator_royalty = (amount * atelier.creator_royalty_bps) / BPS_BASE;
    // 自動轉給原創者
}
```

### 3. 可調整的創作者版稅 🎛️
```typescript
// 前端 API
updateCreatorRoyalty(atelierId, newRoyaltyBps)

// 範圍：0-50% (0-5000 bps)
// 只有原創者可調整
// 立即生效
```

### 4. Kiosk 市場功能 🏪
```typescript
// 上架
listAtelier(kioskId, kioskCapId, atelierId, priceInMist)

// 下架
delistAtelier(kioskId, kioskCapId, atelierId)

// 購買（含版稅）
purchaseAtelier(kioskId, atelierId, priceInMist, royaltyInMist)

// 取回
takeAtelierFromKiosk(kioskId, kioskCapId, atelierId, recipient)
```

### 5. TransferPolicy 集成 🔐
- Atelier 和 Sculpt 各自的 TransferPolicy
- 版稅強制執行
- 符合 Sui Kiosk 標準

---

## 🧪 E2E 測試清單

### ✅ 基礎功能（Phase 1）- 必須通過
- [ ] 鑄造會員 (`mintMembership`)
- [ ] 創建 Atelier (`createArtlier`)
- [ ] 鑄造 Sculpt (`mintSculpt`)
- [ ] Pool 提取 (`withdrawAtelierPool`)

### 🆕 新功能（Phase 2）- 本次測試重點
- [ ] **查詢版稅比例**
  ```typescript
  // 調用 get_creator_royalty_bps
  // 應該返回 250 (2.5%)
  ```

- [ ] **更新創作者版稅**
  ```typescript
  updateCreatorRoyalty(atelierId, 500) // 改為 5%
  // 只有原創者可以調用
  ```

- [ ] **Pool 提取版稅分配**
  ```typescript
  // 場景 1: 創作者提取
  withdrawAtelierPool(atelierId, poolId, amount, creator)
  // 預期：創作者收到全額

  // 場景 2: 新擁有者提取（轉讓後）
  withdrawAtelierPool(atelierId, poolId, 1000000000, newOwner)
  // 預期：原創者收到 25000000 (2.5%)
  //       新擁有者收到 975000000 (97.5%)
  ```

- [ ] **Atelier 上架**
  ```typescript
  listAtelier(kioskId, kioskCapId, atelierId, 10_000_000_000)
  // 10 SUI 上架
  ```

- [ ] **Atelier 下架**
  ```typescript
  delistAtelier(kioskId, kioskCapId, atelierId)
  ```

- [ ] **Atelier 購買**
  ```typescript
  const price = 10_000_000_000; // 10 SUI
  const royalty = calculateRoyalty(price, 500); // 5% = 500000000
  purchaseAtelier(sellerKioskId, atelierId, price, royalty)
  ```

---

## 📊 版稅測試案例

### 案例 1: 默認版稅 2.5%
```typescript
Pool 餘額: 10 SUI
創作者: Alice
擁有者: Bob (購買後)

Bob 提取 10 SUI:
- Alice 自動收到: 0.25 SUI (2.5%)
- Bob 收到: 9.75 SUI (97.5%)
```

### 案例 2: 調整版稅為 10%
```typescript
Alice 調用:
updateCreatorRoyalty(atelierId, 1000) // 10%

Bob 提取 10 SUI:
- Alice 自動收到: 1 SUI (10%)
- Bob 收到: 9 SUI (90%)
```

### 案例 3: 創作者自己提取
```typescript
Alice 提取 10 SUI:
- Alice 收到: 10 SUI (100%)
- 不分割版稅
```

---

## 🔗 區塊鏈瀏覽器鏈接

### 查看部署交易
```
https://suiscan.xyz/testnet/tx/F35rFpfg7xDSKgXSgWkmfMEkv3h1WncRTLjDVcNAASNy
```

### 查看合約
```
https://suiscan.xyz/testnet/object/0x1d97a384a6b79a31bb41091b805aae1eb6536c83be56f6f345fc74f8b2f959cb
```

### 查看 TransferPolicy
```
Atelier: https://suiscan.xyz/testnet/object/0x6d83c78a64577b25057dc0bf8703f91486814fce0641cbf6cbc45436aa9ac50f
Sculpt: https://suiscan.xyz/testnet/object/0xe4c28bd2105f21958be26c656cb23d2ac68be3bb66d31098044fbdc84ab3de70
```

---

## 💻 快速測試命令

### 驗證合約已部署
```bash
sui client object $PACKAGE_ID
```

### 驗證 TransferPolicy
```bash
sui client object 0x6d83c78a64577b25057dc0bf8703f91486814fce0641cbf6cbc45436aa9ac50f
```

### 檢查版本
```bash
cat frontend/utils/transactions.ts | grep "PACKAGE_ID"
```

---

## 📋 合約模塊列表

本次部署包含 5 個模塊：

1. **archimeters** - 會員系統
2. **atelier** - Atelier 核心功能
3. **atelier_marketplace** ⭐ - 市場功能（新增）
4. **royalty_rule** - 版稅規則
5. **sculpt** - Sculpt 鑄造

---

## 🎯 下一步

1. ✅ **測試基礎功能** - 確保沒有 breaking changes
2. ✅ **測試版稅分配** - 驗證自動分潤邏輯
3. ✅ **測試版稅調整** - 確認權限控制
4. 🔲 **開發 Marketplace UI** - 前端介面整合
5. 🔲 **用戶測試** - Beta 測試
6. 🔲 **正式上線** - Mainnet 部署

---

## 🔄 回滾方案（如需要）

如果遇到問題，可以回滾到上一版本：

```typescript
// 在 transactions.ts 中，取消註解舊版本：
export const PACKAGE_ID = '0x80e08281d763b4f020c106e1a6a10108058bef89c3054cb85fa894a3bc4c3f09';
// ... 其他舊 ID
```

舊版本資訊：
- Deployment: `DaXkXPwpUqsCk7ybSRn9hx4JMUFgCrKTakFMoPthfQLG`
- Epoch: 908

---

## ✅ 部署完成檢查清單

- [x] 合約編譯成功
- [x] 合約部署成功（Epoch 909）
- [x] 物件 ID 已提取
- [x] `transactions.ts` 已更新
- [x] 舊版本已備份
- [ ] 基礎功能測試通過
- [ ] Marketplace 功能測試通過
- [ ] 版稅分配測試通過
- [ ] Git commit 完成

---

🎊 **部署成功！現在可以開始 E2E 測試了！** 🚀

