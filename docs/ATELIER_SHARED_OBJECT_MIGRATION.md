# Atelier 共享對象遷移指南

## 概述

本文檔記錄了將 Atelier 從 **Owned Object** 遷移到 **Shared Object** 的架構變更。

## 背景

### 原始問題

錯誤訊息：
```
Error checking transaction input objects: Transaction was not signed by the correct sender: 
Object 0x7c2ba95... is owned by account address 0x18fef..., 
but given owner/signer address is 0x5989...
```

**根本原因**：Atelier 作為 Owned Object 時，只有所有者可以在交易中使用它，這阻止了其他用戶調用 `mint_sculpt` 函數。

### Party Object 的考慮

我們評估了 [Sui Party Objects](https://docs.sui.io/concepts/object-ownership/party)，但發現：
- ❌ Party Objects 仍然有所有權限制
- ❌ "只有單一所有權模式被支持"
- ❌ 驗證器會確保交易發送者可以訪問對象（僅限所有者）

因此，**Party Object 無法滿足讓任何人都能 mint 的需求**。

## 解決方案：Shared Object

### 架構設計

| 組件 | 對象類型 | 用途 | 訪問權限 |
|------|---------|------|---------|
| **Atelier** | **Shared Object** | 設計模板 | ✅ 任何人可讀取和 mint |
| **AtelierPool** | **Shared Object** | 收集 mint 費用 | ✅ 任何人可支付 |
| **AtelierPoolCap** | **Owned Object** | 提取權限憑證 | ✅ **可交易**，持有者可提取資金 |
| **Sculpt** | **Owned Object** | 鑄造的藝術品 | ✅ 可在 Kiosk 交易 |

### 核心變更

#### 1. 合約變更 - `atelier.move`

**a) Atelier 改為 Shared Object**

```move
// 原本：Atelier 作為 Owned Object 轉移給創建者
transfer::public_transfer(atelier, ctx.sender());

// 修改為：Atelier 作為 Shared Object 共享
transfer::share_object(atelier);
```

**b) PoolCap 改為可交易的 Owned Object**

```move
// 原本：PoolCap 存儲在 Atelier 的 dynamic field 中
sui::dynamic_field::add(&mut atelier_uid, PoolCapKey {}, pool_cap);

// 修改為：PoolCap 直接轉移給創建者，可以被交易
transfer::public_transfer(pool_cap, ctx.sender());
```

**c) 提取資金需要持有 PoolCap**

```move
// 原本：驗證 current_owner
public fun withdraw_pool<T>(
    atelier: &Atelier<T>,
    pool: &mut AtelierPool<T>,
    // ...
) {
    assert!(atelier.current_owner == ctx.sender(), ENO_PERMISSION);
    let cap: &AtelierPoolCap<T> = sui::dynamic_field::borrow(&atelier.id, PoolCapKey {});

// 修改為：驗證 PoolCap 持有者
public fun withdraw_pool<T>(
    pool_cap: &AtelierPoolCap<T>,  // 必須擁有 PoolCap
    atelier: &Atelier<T>,
    pool: &mut AtelierPool<T>,
    // ...
) {
    assert!(pool_cap.pool_id == object::id(pool), ENO_CAP_MISMATCH);
```

**檔案**：`contract/sources/atelier/atelier.move`

#### 2. Marketplace 棄用 - `marketplace.move`

由於 Shared Objects 無法放入 Kiosk，以下 Atelier marketplace 功能已被標記為 DEPRECATED：
- `list_atelier` - 列出 Atelier 銷售
- `delist_atelier` - 取消列出
- `purchase_atelier` - 購買 Atelier
- `purchase_atelier_with_pool` - 帶 pool 轉移的購買
- `take_from_kiosk` - 從 Kiosk 取出

**注意**：Sculpt marketplace 功能完全不受影響，因為 Sculpt 仍是 Owned Object。

#### 3. 前端變更

**a) 獲取 PoolCap - `useAtelierWithdraw.ts`**

```typescript
// 原本：檢查用戶是否擁有 Atelier
const { data: objects } = await suiClient.getOwnedObjects({
  owner: currentAccount.address,
  filter: { StructType: ATELIER_TYPE }
});

// 修改為：查找用戶擁有的 PoolCap
const { data: objects } = await suiClient.getOwnedObjects({
  owner: currentAccount.address,
  filter: {
    StructType: `${PACKAGE_ID}::atelier::AtelierPoolCap<${PACKAGE_ID}::atelier::ATELIER>`
  }
});

// 找到匹配 poolId 的 PoolCap
for (const object of objects) {
  const capPoolId = content.fields?.pool_id;
  if (capPoolId === poolId) {
    return object.data.objectId;
  }
}
```

**b) 更新交易構建 - `transactions.ts`**

```typescript
// 原本
export const withdrawAtelierPool = (
  atelierId: string,
  poolId: string,
  amountInMist: number,
  recipient: string,
) => {
  tx.moveCall({
    arguments: [
      tx.object(atelierId),
      tx.object(poolId),
      tx.pure.u64(amountInMist),
      tx.pure.address(recipient),
    ],
  });
};

// 修改為：添加 PoolCap 參數
export const withdrawAtelierPool = (
  poolCapId: string,  // 新增
  atelierId: string,
  poolId: string,
  amountInMist: number,
  recipient: string,
) => {
  tx.moveCall({
    arguments: [
      tx.object(poolCapId),  // PoolCap 必須是第一個參數
      tx.object(atelierId),
      tx.object(poolId),
      tx.pure.u64(amountInMist),
      tx.pure.address(recipient),
    ],
  });
};
```

**檔案**：
- `frontend/components/features/vault/hooks/useAtelierWithdraw.ts`
- `frontend/components/features/vault/hooks/useWithdrawAll.ts`
- `frontend/utils/transactions.ts`

## 優勢與權衡

### ✅ 優勢

1. **開放訪問** - 任何用戶都可以使用任何 Atelier 來 mint Sculpt
2. **高並發性能** - 多個用戶可以同時 mint，不會互相阻塞
3. **簡化用戶體驗** - 用戶不需要先購買 Atelier 就能使用
4. **收益權可交易** - PoolCap 作為 NFT 可以獨立交易，靈活轉讓收益權
5. **權責分離** - Atelier 訪問權（公共）與收益權（私有）完全分離

### ⚠️ 權衡

1. **Atelier 無法交易** - Atelier 本身不能作為 NFT 交易（但這可能是優勢，因為設計模板應該公開）
2. **PoolCap 管理** - 用戶需要妥善保管 PoolCap，丟失則無法提取收益
3. **Atelier Marketplace 棄用** - Atelier 二級市場功能不再可用（但 PoolCap 可以交易）

## 安全性考慮

### PoolCap 權限保護

通過 PoolCap 機制實現資金提取保護：

```move
public fun withdraw_pool<T>(
    pool_cap: &AtelierPoolCap<T>,
    atelier: &Atelier<T>,
    pool: &mut AtelierPool<T>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext
) {
    // 驗證 PoolCap 是否匹配 Pool
    assert!(pool_cap.pool_id == object::id(pool), ENO_CAP_MISMATCH);
    assert!(pool.atelier_id == object::id(atelier), ENO_POOL_MISMATCH);
    // ...
}
```

**安全機制**：
- ✅ 只有持有正確 PoolCap 的用戶才能提取資金
- ✅ PoolCap 通過區塊鏈級別的所有權驗證（不是邏輯檢查）
- ✅ PoolCap 無法偽造或複製（由 Move 類型系統保證）

### 數據完整性

- ✅ Atelier 的 `parameter_rules`、`price` 等字段仍然不可變
- ✅ `original_creator` 字段永久記錄原始創作者
- ✅ `current_owner` 字段記錄當前收益接收者

## 遷移步驟

### 對於已部署的合約

1. **部署新版本合約**
   ```bash
   sui client publish --gas-budget 500000000
   ```

2. **更新前端配置**
   - 更新 `PACKAGE_ID` 到新的包地址
   - 前端代碼已經兼容新架構

3. **通知用戶**
   - 舊的 Atelier（Owned Object）仍然存在但無法被其他人使用
   - 創建新的 Atelier 會自動使用 Shared Object 模式

### 對於新部署

直接使用更新後的合約代碼即可。

## 未來考慮

### PoolCap 交易市場

由於 PoolCap 是 Owned Object with `store` ability，可以：

**1. 在標準 Kiosk 中交易**

```typescript
// 列出 PoolCap 銷售
tx.moveCall({
  target: '0x2::kiosk::place',
  arguments: [kiosk, kioskCap, poolCap],
  typeArguments: [ATELIER_POOL_CAP_TYPE]
});

tx.moveCall({
  target: '0x2::kiosk::list',
  arguments: [kiosk, kioskCap, poolCapId, price],
  typeArguments: [ATELIER_POOL_CAP_TYPE]
});
```

**2. 直接轉移**

```move
// PoolCap 有 store ability，可以直接轉移
transfer::public_transfer(pool_cap, new_owner);
```

**3. 作為遊戲資產**

PoolCap 可以用於遊戲、DeFi 等場景：
- 作為抵押品
- 作為遊戲獎勵
- 組合到其他 NFT 中

### Atelier 元數據更新

Atelier 的 `current_owner` 字段可以保留用於顯示目的，但提取權限完全由 PoolCap 控制：

```move
public fun update_atelier_owner_display<T>(
    pool_cap: &AtelierPoolCap<T>,
    atelier: &mut Atelier<T>,
    new_display_owner: address,
    ctx: &TxContext
) {
    assert!(pool_cap.pool_id == atelier.pool_id, ENO_CAP_MISMATCH);
    atelier.current_owner = new_display_owner;
}
```

### 自定義 Marketplace

可以為 Shared Object 建立自定義的交易機制：

```move
public struct AtelierListing has key {
    id: UID,
    atelier_id: ID,
    seller: address,
    price: u64,
}

// 列出 Atelier（記錄意圖）
public fun list_shared_atelier<T>(
    atelier: &Atelier<T>,
    price: u64,
    ctx: &mut TxContext
) {
    // 創建 listing 記錄...
}

// 購買（轉移 current_owner）
public fun purchase_shared_atelier<T>(
    atelier: &mut Atelier<T>,
    listing: AtelierListing,
    payment: Coin<SUI>,
    ctx: &mut TxContext
) {
    // 驗證並轉移所有權...
}
```

## 相關文件

- [Sui Object Ownership 文檔](https://docs.sui.io/concepts/object-ownership)
- [Sui Shared Objects](https://docs.sui.io/concepts/object-ownership/shared)
- [Sui Party Objects](https://docs.sui.io/concepts/object-ownership/party)

## 總結

這次架構變更實現了三層權限分離：

```
📐 Atelier (Shared Object)
   ↓ 任何人可讀取和使用
   
💰 AtelierPool (Shared Object)
   ↓ 任何人可支付，只有 PoolCap 持有者可提取
   
🎫 AtelierPoolCap (Owned Object)
   ↓ 可交易的收益權憑證
   
🎨 Sculpt (Owned Object)
   ↓ 可交易的藝術品
```

**核心創新**：
1. ✅ **公共訪問** - Atelier 作為公共資源，任何人都能使用
2. ✅ **收益權交易** - PoolCap 可以獨立交易，實現收益權市場
3. ✅ **權責分離** - 訪問權（公共）與收益權（私有）完全分離
4. ✅ **性能優化** - Shared Object 支持高並發操作

**關鍵要點**：
- ✅ Atelier = 公共設計模板（Shared Object，不可交易）
- ✅ AtelierPoolCap = 收益權憑證（Owned Object，**可交易**）
- ✅ Sculpt = 個人藝術品（Owned Object，可交易）
- ✅ 創作者可以出售 PoolCap 而保留 Atelier 公開使用

