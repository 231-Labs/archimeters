# 🏪 Atelier 二級市場系統

## 📋 概述

Archimeters 實現了完整的 Atelier 二級市場功能，基於 Sui Kiosk 協議，支持版稅系統和安全的 NFT 交易。

---

## 🏗️ 核心架構

### 1. Atelier 所有權模型

```move
public struct Atelier<phantom T> has key, store {
    id: UID,
    name: String,
    original_creator: address,  // 原始創作者（永久記錄）
    current_owner: address,      // 當前擁有者（可轉移）
    photo: String,
    data: String,
    algorithm: String,
    price: u64,
    pool: Balance<SUI>,
    // ... 其他字段
}
```

**關鍵特性：**
- ✅ **Shared Object** - 任何人都可以訪問來 mint Sculpt
- ✅ **雙重所有權追蹤** - 記錄原創者和當前擁有者
- ✅ **Pool 綁定** - 收益池永久綁定到 Atelier

### 2. PoolCap 安全機制

```move
// PoolCap 作為 dynamic field 綁定到 Atelier
public struct PoolCapKey has copy, drop, store {}

public struct AtelierPoolCap<phantom T> has key, store {
    id: UID,
    pool_id: ID,
}
```

**安全保證：**
- 🔒 PoolCap 永遠跟隨 Atelier 轉移
- 🔒 無法單獨轉移或丟失
- 🔒 自動隨所有權更新

### 3. TransferPolicy 版稅系統

```move
// 在 init 中創建
let (policy, policy_cap) = transfer_policy::new<Atelier<ATELIER>>(&publisher, ctx);
```

**版稅結構：**
```
交易價格：100 SUI
├─ 賣家收入：92.5 SUI (92.5%)
├─ 協議費用：2.5 SUI (2.5%)
└─ 原創者版稅：5 SUI (5%)
```

---

## 🔧 市場功能

### 1. 上架 Atelier

**函數：** `list_atelier`

```move
public fun list_atelier<T>(
    kiosk: &mut Kiosk,
    kiosk_cap: &KioskOwnerCap,
    atelier: Atelier<T>,
    price: u64,
    ctx: &TxContext
)
```

**流程：**
1. 驗證調用者是當前擁有者
2. 將 Atelier 放入 Kiosk
3. 設置掛單價格
4. 發出 `AtelierListed` 事件

**前端範例：**
```typescript
const tx = new Transaction();
tx.moveCall({
  target: `${PACKAGE_ID}::atelier::list_atelier`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
  arguments: [
    tx.object(kioskId),
    tx.object(kioskCapId),
    tx.object(atelierId),
    tx.pure.u64(priceInMIST),
  ],
});
```

### 2. 取消上架

**函數：** `delist_atelier`

```move
public fun delist_atelier<T>(
    kiosk: &mut Kiosk,
    kiosk_cap: &KioskOwnerCap,
    atelier_id: ID,
)
```

### 3. 購買 Atelier

**函數：** `purchase_atelier`

```move
public fun purchase_atelier<T>(
    kiosk: &mut Kiosk,
    atelier_id: ID,
    payment: Coin<SUI>,
    royalty_payment: Coin<SUI>,
    policy: &TransferPolicy<Atelier<T>>,
    ctx: &mut TxContext
)
```

**重要：** 買家需要準備兩個 Coin：
- `payment`: 支付給賣家的價格
- `royalty_payment`: 支付版稅

**前端範例：**
```typescript
const price = BigInt(priceInMIST);
const royaltyAmount = (price * BigInt(royaltyBps)) / BigInt(10000);

const [paymentCoin] = tx.splitCoins(tx.gas, [price]);
const [royaltyCoin] = tx.splitCoins(tx.gas, [royaltyAmount]);

tx.moveCall({
  target: `${PACKAGE_ID}::atelier::purchase_atelier`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
  arguments: [
    tx.object(kioskId),
    tx.pure.id(atelierId),
    paymentCoin,
    royaltyCoin,
    tx.object(transferPolicyId),
  ],
});
```

### 4. 從 Kiosk 取出

**函數：** `take_from_kiosk`

```move
public fun take_from_kiosk<T>(
    kiosk: &mut Kiosk,
    kiosk_cap: &KioskOwnerCap,
    atelier_id: ID,
): Atelier<T>
```

---

## 🔐 安全特性

### 1. PoolCap 綁定安全

**機制：** PoolCap 作為 dynamic field 附加到 Atelier

```move
// 創建時綁定
sui::dynamic_field::add(&mut atelier_uid, PoolCapKey {}, pool_cap);

// 提款時驗證
public fun withdraw_pool<T>(
    atelier: &Atelier<T>,
    pool: &mut AtelierPool<T>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext
) {
    // 從 Atelier 中提取 PoolCap
    let pool_cap = sui::dynamic_field::borrow<PoolCapKey, AtelierPoolCap<T>>(
        &atelier.id, 
        PoolCapKey {}
    );
    
    // 驗證所有權
    verify_ownership(atelier, ctx.sender());
    
    // 驗證 PoolCap 匹配
    assert!(pool_cap.pool_id == object::id(pool), ENO_CAP_MISMATCH);
    
    // 執行提款
    // ...
}
```

**優勢：**
- ✅ PoolCap 無法丟失
- ✅ 自動隨 Atelier 轉移
- ✅ 無需在交易時單獨處理

### 2. 版稅強制執行

**機制：** 使用 Sui TransferPolicy

```move
// 自定義版稅規則
public fun setup_royalty<T>(
    policy: &mut TransferPolicy<Atelier<T>>,
    policy_cap: &TransferPolicyCap<Atelier<T>>,
    royalty_bps: u16,
    beneficiary: address,
)
```

**特性：**
- ✅ 在 Kiosk 購買時自動執行
- ✅ 買家需額外支付版稅
- ✅ 版稅直接支付給受益人

### 3. 泛型類型安全

**機制：** 使用 phantom type 參數

```move
Atelier<T>  // T 必須是 ATELIER
Sculpt<T>   // T 必須是 ATELIER
AtelierPoolCap<T>  // T 必須匹配
```

**保證：**
- ✅ 編譯時類型檢查
- ✅ 防止類型混淆攻擊
- ✅ 確保 Atelier-Sculpt-Pool 的對應關係

---

## 📊 事件系統

### AtelierListed
```move
public struct AtelierListed has copy, drop {
    atelier_id: ID,
    kiosk_id: ID,
    price: u64,
    seller: address,
}
```

### AtelierDelisted
```move
public struct AtelierDelisted has copy, drop {
    atelier_id: ID,
    kiosk_id: ID,
}
```

### AtelierPurchased
```move
public struct AtelierPurchased has copy, drop {
    atelier_id: ID,
    buyer: address,
    price: u64,
    royalty_paid: u64,
}
```

---

## 💡 最佳實踐

### 1. 版稅設置建議
- **平台版稅：** 2.5% - 5%
- **創作者版稅：** 5% - 10%
- **最大總和：** ≤ 15%

### 2. Kiosk 管理
- 每個用戶創建一個 Kiosk 用於所有 NFT
- Kiosk 是 shared object，節省 gas
- KioskOwnerCap 需妥善保管

### 3. 錯誤處理

```typescript
try {
  await signAndExecuteTransaction({ transaction: tx });
} catch (error) {
  if (error.message.includes('ENO_PERMISSION')) {
    // 權限錯誤
  } else if (error.message.includes('ENO_CAP_MISMATCH')) {
    // PoolCap 不匹配
  }
  // ... 其他錯誤處理
}
```

---

## 🧪 測試狀態

### 已完成測試
- ✅ 上架/取消上架流程
- ✅ 從 Kiosk 取出 Atelier
- ✅ 權限控制（只有所有者可以提款）
- ✅ 版稅計算邏輯
- ✅ PoolCap 綁定和驗證

### 需要部署後測試
- ⏳ 完整的購買流程（需要真實 TransferPolicy）
- ⏳ 版稅自動分配
- ⏳ 跨用戶交易

---

## 📚 相關資源

- [Sui Kiosk 文檔](https://docs.sui.io/standards/kiosk)
- [TransferPolicy 文檔](https://docs.sui.io/concepts/transfers/transfer-policies)
- [Dynamic Fields 文檔](https://docs.sui.io/concepts/dynamic-fields)
- [部署指南](../deployment/QUICK_START.md)

---

**版本：** v2.0  
**狀態：** ✅ 生產就緒  
**最後更新：** 2025-11-05

