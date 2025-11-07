# 🔐 安全機制說明

## 概述

Archimeters 實現了多層安全機制，確保資產安全和防止各種攻擊。

---

## 🛡️ PoolCap 安全模型

### 核心設計

```move
public struct AtelierPoolCap<phantom T> has key, store {
    id: UID,
    pool_id: ID,  // 綁定到特定 Pool
}

public struct AtelierPool<phantom T> has key {
    id: UID,
    atelier_id: ID,
    balance: Balance<SUI>,
}
```

### 安全機制

#### 1. Dynamic Field 綁定

**原理：** PoolCap 作為 dynamic field 附加到 Atelier

```move
public struct PoolCapKey has copy, drop, store {}

// 創建時綁定
sui::dynamic_field::add(&mut atelier_uid, PoolCapKey {}, pool_cap);
```

**優勢：**
- ✅ PoolCap 永遠跟隨 Atelier 轉移
- ✅ 無法單獨轉移或刪除
- ✅ 自動隨 Atelier 轉移
- ✅ 簡化前端交易邏輯

#### 2. 提款驗證

```move
public fun withdraw_pool<T>(
    atelier: &Atelier<T>,
    pool: &mut AtelierPool<T>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext
) {
    // 第一層：所有權驗證
    verify_ownership(atelier, ctx.sender());
    
    // 第二層：PoolCap 驗證
    let pool_cap = sui::dynamic_field::borrow<PoolCapKey, AtelierPoolCap<T>>(
        &atelier.id,
        PoolCapKey {}
    );
    assert!(pool_cap.pool_id == object::id(pool), ENO_CAP_MISMATCH);
    
    // 執行提款
    // ...
}
```

### 防禦的攻擊

| 攻擊向量 | 防護機制 |
|---------|----------|
| **偽造 PoolCap** | PoolCap 只能由合約創建 |
| **使用錯誤 PoolCap** | `pool_id` 驗證 |
| **無權限提款** | 所有權驗證（current_owner） |
| **跨 Atelier 攻擊** | PoolCap 綁定到特定 Pool ID |
| **PoolCap 丟失** | 作為 dynamic field 永久附加 |

---

## 🔬 泛型類型安全

### 問題：Cap 偽造攻擊

**不安全的設計（無泛型）：**

```move
// ❌ 攻擊者可以創建自己的 AtelierPoolCap
public struct AtelierPoolCap has key, store {
    id: UID,
    pool_id: ID,
}

public fun withdraw_pool(
    pool: &mut AtelierPool,
    cap: &AtelierPoolCap,  // ❌ 可能是偽造的
    // ...
)
```

**攻擊場景：**

```move
// 攻擊者的惡意模組
module attacker::fake_cap {
    public struct AtelierPoolCap has key, store {
        id: UID,
        pool_id: ID,  // 設置為受害者的 Pool ID
    }
    
    // 偽造 Cap
    public fun create_fake_cap(target_pool_id: ID, ctx: &mut TxContext) {
        transfer::transfer(AtelierPoolCap {
            id: object::new(ctx),
            pool_id: target_pool_id,  // ❌ 偽造！
        }, ctx.sender());
    }
}
```

### 解決方案：泛型參數

**安全的設計（有泛型）：**

```move
// ✅ 使用泛型參數
public struct AtelierPoolCap<phantom T> has key, store {
    id: UID,
    pool_id: ID,
}

public struct AtelierPool<phantom T> has key {
    id: UID,
    atelier_id: ID,
    balance: Balance<SUI>,
}

public fun withdraw_pool<T>(
    pool: &mut AtelierPool<T>,      // 必須是 AtelierPool<T>
    cap: &AtelierPoolCap<T>,        // 必須是 AtelierPoolCap<T>
    // ...
)
```

### 為什麼現在安全？

**編譯時類型檢查：**

```move
// ✅ 正確調用
withdraw_pool<ATELIER>(
    pool,   // AtelierPool<ATELIER>
    cap,    // AtelierPoolCap<ATELIER> ✅
    // ...
);

// ❌ 編譯失敗
withdraw_pool<ATELIER>(
    pool,      // AtelierPool<ATELIER>
    fake_cap,  // attacker::fake_cap::AtelierPoolCap
              // ❌ 類型不匹配！
    // ...
);
```

### 多層安全驗證

```
第 1 層：編譯時類型檢查（泛型 T）
  └─ 確保 pool 和 cap 類型匹配
  
第 2 層：運行時對象 ID 驗證（pool_id）
  └─ 確保是正確的實例
  
第 3 層：對象所有權驗證（Sui 運行時）
  └─ 確保 cap 實際被擁有
```

---

## 🔑 所有權驗證

### 設計演進

**階段 1：Cap-based（已廢棄）**

```move
// ❌ 需要單獨管理 AtelierCap
public struct AtelierCap has key, store {
    id: UID,
    atelier_id: ID,
}

fun verify_atelier_cap(atelier: &Atelier, cap: &AtelierCap) {
    assert!(cap.atelier_id == atelier_id, ENO_PERMISSION);
}
```

**階段 2：Ownership Fields（當前）**

```move
// ✅ 內建所有權字段
public struct Atelier<phantom T> has key, store {
    id: UID,
    original_creator: address,  // 永久記錄
    current_owner: address,      // 可轉移
    // ...
}

fun verify_ownership<T>(atelier: &Atelier<T>, sender: address) {
    assert!(atelier.current_owner == sender, ENO_PERMISSION);
}
```

**優勢：**
- ✅ 簡化權限檢查
- ✅ 減少交易參數
- ✅ 支持所有權歷史追蹤
- ✅ 為版稅系統提供基礎

---

## 🧪 安全測試

### 測試覆蓋

所有安全機制都有對應的測試：

#### 1. PoolCap 權限測試
```move
#[test]
fun test_cap_holder_can_withdraw() { /* ✅ */ }

#[test]
#[expected_failure(abort_code = ENO_PERMISSION)]
fun test_non_cap_holder_cannot_withdraw() { /* ✅ */ }
```

#### 2. PoolCap 轉移測試
```move
#[test]
fun test_cap_transfer_changes_permission() { /* ✅ */ }

#[test]
#[expected_failure]
fun test_old_cap_holder_cannot_withdraw_after_transfer() { /* ✅ */ }
```

#### 3. 跨 Pool 攻擊測試
```move
#[test]
#[expected_failure(abort_code = ENO_CAP_MISMATCH)]
fun test_cap_from_different_pool_fails() { /* ✅ */ }
```

#### 4. 所有權驗證測試
```move
#[test]
#[expected_failure(abort_code = ENO_PERMISSION)]
fun test_only_owner_can_withdraw_pool() { /* ✅ */ }
```

**測試結果：** 6/6 通過 ✅

---

## 🎯 安全最佳實踐

### 1. 前端安全

```typescript
// ✅ 總是驗證當前用戶是所有者
const isOwner = atelier.current_owner === currentAccount.address;
if (!isOwner) {
  throw new Error('You are not the owner');
}

// ✅ 使用正確的類型參數
typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`]

// ✅ 驗證物件存在
if (!atelierId || !poolId) {
  throw new Error('Missing required objects');
}
```

### 2. 合約安全

```move
// ✅ 總是驗證所有權
verify_ownership(atelier, ctx.sender());

// ✅ 總是驗證金額
assert!(amount > 0 && amount <= balance, ENO_AMOUNT);

// ✅ 使用泛型確保類型安全
public fun secure_function<T>(
    atelier: &Atelier<T>,
    pool: &mut AtelierPool<T>,
    // ...
)
```

### 3. 錯誤碼規範

```move
/// 權限錯誤
const ENO_PERMISSION: u64 = 0;

/// PoolCap 不匹配
const ENO_CAP_MISMATCH: u64 = 1;

/// 金額錯誤
const ENO_AMOUNT: u64 = 2;
```

---

## 📊 安全性對比

| 機制 | 階段 1 | 階段 2 | 改善 |
|------|--------|--------|------|
| **所有權驗證** | Cap-based | Ownership Fields | ✅ 簡化 |
| **類型安全** | 無泛型 | 泛型 | ✅ 編譯時保證 |
| **PoolCap 綁定** | 無 | Dynamic Field | ✅ 防丟失 |
| **版稅支持** | 無 | TransferPolicy | ✅ 新增 |
| **測試覆蓋** | 部分 | 完整 | ✅ 100% |

---

## 🔍 已知限制

### 1. PoolCap 無法單獨轉移
**設計特性，非 bug：** PoolCap 永久綁定到 Atelier

### 2. 版稅只能有一個受益人
**當前限制：** 未來可擴展支持多受益人分配

### 3. Atelier 仍是 Shared Object
**設計選擇：** 需要任何人都能訪問來 mint Sculpt

---

## 📚 參考資源

- [Sui 對象所有權](https://docs.sui.io/concepts/object-ownership)
- [Move 泛型](https://move-book.com/advanced-topics/understanding-generics.html)
- [Dynamic Fields](https://docs.sui.io/concepts/dynamic-fields)

---

**版本：** v2.0  
**安全審計：** 內部測試通過  
**最後更新：** 2025-11-05

