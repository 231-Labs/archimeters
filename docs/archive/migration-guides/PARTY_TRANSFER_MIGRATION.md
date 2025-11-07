# Party Transfer Migration - Atelier 架構重構

## 日期
2025-11-04

## 問題背景

原先的設計將 `Atelier` 放入 Kiosk 中管理，這導致了一個嚴重的問題：

```move
public fun mint_sculpt<T>(
    atelier_kiosk: &mut Kiosk,
    atelier_kiosk_cap: &KioskOwnerCap,  // ❌ 需要所有者的 Cap！
    ...
)
```

**問題**：其他用戶無法從 Atelier 派生 Sculpt，因為他們沒有 `KioskOwnerCap`！

## 解決方案

### 核心改變：使用 Party Transfer

將 `Atelier` 改為 **party object**，直接轉移給創建者：

```move
// 原來的方式（錯誤）
kiosk::place(kiosk, kiosk_cap, atelier);

// 新的方式（正確）
transfer::public_transfer(atelier, ctx.sender());
```

### 架構優勢

1. **任何人都可以使用 Atelier**
   - Atelier 是公開可讀的對象
   - 任何用戶都可以在交易中傳入 Atelier 的引用來 mint Sculpt

2. **獨立的 Pool 設計**
   - `AtelierPool` 是 Shared Object
   - 收款獨立於 Atelier 所有權
   - 支持安全的資金管理

3. **靈活的所有權**
   - Atelier 可以自由轉移
   - 可以選擇性地放入 Kiosk（用戶自己決定）
   - 支持二級市場交易

## 合約修改

### 1. `atelier.move`

#### 修改前
```move
public fun mint_atelier<T>(
    atelier_state: &mut AtelierState,
    membership: &mut MemberShip,
    kiosk: &mut Kiosk,              // ❌ 需要 Kiosk
    kiosk_cap: &KioskOwnerCap,      // ❌ 需要 Cap
    ...
)
```

#### 修改後
```move
public fun mint_atelier<T>(
    atelier_state: &mut AtelierState,
    membership: &mut MemberShip,
    // ✅ 移除 Kiosk 參數
    ...
) {
    // ...
    // ✅ 直接轉移給創建者
    transfer::public_transfer(atelier, ctx.sender());
}
```

### 2. `sculpt.move`

#### 修改前
```move
public fun mint_sculpt<T>(
    atelier_kiosk: &mut Kiosk,          // ❌ 需要 Atelier 的 Kiosk
    atelier_kiosk_cap: &KioskOwnerCap,  // ❌ 需要所有者的 Cap
    atelier_id: ID,
    pool: &mut AtelierPool,
    ...
)
```

#### 修改後
```move
public fun mint_sculpt<T>(
    atelier: &Atelier<T>,    // ✅ 直接傳入 Atelier 引用
    pool: &mut AtelierPool,
    ...
) {
    let atelier_id = object::id(atelier);
    // ✅ 任何人都可以調用
}
```

## 前端修改

### 1. 交易函數更新

#### `createArtlier` (transactions.ts)
```typescript
// ✅ 移除了 Kiosk 參數
export const createArtlier = async (
  artlierState: string,
  membershipId: string,
  // 移除：kioskId, kioskCapId
  name: string,
  ...
)
```

#### `mintSculpt` (transactions.ts)
```typescript
// ✅ 添加 poolId 參數
export const mintSculpt = async (
  artlierId: string,
  poolId: string,        // ✅ 新增
  membershipId: string,
  kioskId: string,       // Sculpt 的 Kiosk（保留）
  kioskCapId: string,
  ...
)
```

### 2. 類型定義更新

所有 `Atelier` 接口都添加了 `poolId` 字段：

```typescript
export interface Atelier {
  id: string;
  poolId: string;  // ✅ 新增
  // ...其他字段
}
```

更新的文件：
- `frontend/components/features/atelier-viewer/types/index.ts`
- `frontend/components/features/gallery/hooks/useSeriesImages.ts`
- `frontend/components/windows/BrowseWindow.tsx`

### 3. Hook 更新

#### `useSculptMint.ts`
```typescript
const tx = await mintSculpt(
  atelier.id,
  atelier.poolId,  // ✅ 使用 poolId
  membershipId,
  kioskId,
  kioskCapId,
  ...
);
```

## 測試更新

### 修改前
```move
#[test]
fun test_atelier_mint_to_kiosk() {
    // 創建 Kiosk
    let (kiosk, kiosk_cap) = kiosk::new(ctx);
    
    // Mint 到 Kiosk
    atelier::mint_atelier<ATELIER>(
        &mut atelier_state,
        &mut membership,
        &mut kiosk,      // ❌ 需要 Kiosk
        &kiosk_cap,      // ❌ 需要 Cap
        ...
    );
}
```

### 修改後
```move
#[test]
fun test_atelier_mint_as_party_object() {
    // ✅ 直接 mint
    atelier::mint_atelier<ATELIER>(
        &mut atelier_state,
        &mut membership,
        // 移除 Kiosk 參數
        ...
    );
    
    // ✅ 驗證 Atelier 歸創建者所有
    assert!(ts::has_most_recent_for_sender<Atelier<ATELIER>>(&scenario), 0);
}
```

## 數據流

### Atelier 創建流程
```
用戶 mint Atelier
    ↓
創建 Atelier 對象 + AtelierPool
    ↓
Pool → share_object (任何人可訪問)
    ↓
Atelier → public_transfer 給創建者 ✅
```

### Sculpt 鑄造流程
```
用戶選擇 Atelier (公開可讀)
    ↓
獲取 Atelier 引用 + Pool 引用
    ↓
驗證參數 + 支付到 Pool
    ↓
創建 Sculpt → 放入用戶的 Kiosk
```

## 優勢總結

### ✅ 解決的問題
1. **可組合性**：任何用戶都可以從任何 Atelier mint Sculpt
2. **去中心化**：不需要 Atelier 所有者的許可
3. **靈活性**：Atelier 可以自由轉移和交易

### ✅ 保持的優勢
1. **安全支付**：獨立的 Pool 確保收款安全
2. **版稅支持**：仍然支持 TransferPolicy
3. **Sculpt 管理**：Sculpt 仍然可以放入 Kiosk 管理

### ✅ 符合 Sui 最佳實踐
- Party object 用於可轉移的 NFT
- Shared object 用於共享資源（Pool）
- 清晰的所有權模型

## 編譯和測試結果

```bash
$ sui move build
✅ BUILDING archimeters
✅ Total number of linter warnings suppressed: 4 (unique lints: 2)

$ sui move test
✅ [ PASS ] archimeters::integration_tests::test_atelier_mint_as_party_object
✅ [ PASS ] archimeters::integration_tests::test_membership_registration
✅ Test result: OK. Total tests: 2; passed: 2; failed: 0
```

## 下一步

### 建議的後續工作
1. **部署到測試網**：驗證實際使用體驗
2. **前端完整測試**：確保所有 UI 流程正常
3. **添加更多測試**：完整的 Sculpt mint 測試
4. **文檔更新**：更新用戶文檔和開發文檔

### 可選的增強
1. **批量操作**：支持批量 mint Sculpt
2. **參數預設**：允許用戶保存常用參數組合
3. **Atelier 元數據**：豐富 Atelier 的展示信息

## 影響評估

### Breaking Changes
- ✅ 合約 API 已更改（需要重新部署）
- ✅ 前端需要更新（已完成）
- ✅ 測試需要更新（已完成）

### 向後兼容性
- ❌ 無法與舊版本兼容
- ✅ 但架構更合理，值得升級

## 總結

這次重構從根本上解決了 Atelier 架構的問題，使其真正成為一個**可組合的設計模板系統**。通過使用 party transfer，我們實現了：

1. **真正的去中心化**：任何人都可以使用任何 Atelier
2. **清晰的所有權**：Atelier 直接歸創建者所有
3. **靈活的架構**：支持各種使用場景

這是一個重要的里程碑，為 Archimeters 未來的發展奠定了堅實的基礎。🎉

