# 前端更新指南 - 階段 1.5 泛型化

## 📅 更新日期
2025-11-04

## 🎯 更新概述

由於合約進行了泛型化改造（Atelier 和 Sculpt 都添加了泛型參數），前端需要在交易調用時添加相應的類型參數。

---

## ✅ 已完成的更新

### 1. transactions.ts 更新

#### mint_atelier (createArtlier)
```typescript
// 之前
tx.moveCall({
  target: `${PACKAGE_ID}::atelier::mint_atelier`,
  arguments: [...]
});

// 之後
tx.moveCall({
  target: `${PACKAGE_ID}::atelier::mint_atelier`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],  // ✅ 新增
  arguments: [...]
});
```

#### mint_sculpt (mintSculpt)
```typescript
// 之前
tx.moveCall({
  target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
  arguments: [...]
});

// 之後
tx.moveCall({
  target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],  // ✅ 新增
  arguments: [...]
});
```

#### withdraw_pool (withdrawAtelierPool)
```typescript
// 之前
tx.moveCall({
  target: `${PACKAGE_ID}::atelier::withdraw_pool`,
  arguments: [...]
});

// 之後
tx.moveCall({
  target: `${PACKAGE_ID}::atelier::withdraw_pool`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],  // ✅ 新增
  arguments: [...]
});
```

#### 類型常量更新
```typescript
// 之前
export const ATELIER_TYPE = `${PACKAGE_ID}::atelier::Atelier`;
export const SCULPT_TYPE = `${PACKAGE_ID}::sculpt::Sculpt`;

// 之後
export const ATELIER_TYPE = `${PACKAGE_ID}::atelier::Atelier<${PACKAGE_ID}::atelier::ATELIER>`;
export const SCULPT_TYPE = `${PACKAGE_ID}::sculpt::Sculpt<${PACKAGE_ID}::atelier::ATELIER>`;
```

---

## 📝 TypeScript 接口說明

### 重要：接口本身不需要改變

前端的 TypeScript 接口（如 `Atelier`, `Parameter` 等）**不需要修改**，因為：

1. **數據結構不變**：RPC/GraphQL 返回的 JSON 數據結構保持不變
2. **只在交易時需要類型參數**：泛型只影響 Move 合約調用，不影響數據查詢
3. **類型參數在交易構建時指定**：使用 `typeArguments` 參數

```typescript
// ✅ 接口保持不變
export interface Atelier {
  id: string;
  title: string;
  author: string;
  price: string;
  // ... 其他字段
}

// ✅ 但在交易時需要指定類型參數
tx.moveCall({
  target: `${PACKAGE_ID}::atelier::mint_atelier`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],  // 關鍵！
  arguments: [...]
});
```

---

## 🔍 需要檢查的地方

### 1. 查詢 Atelier/Sculpt 數據
❌ **不需要修改** - 查詢邏輯保持不變
```typescript
// 這些都不需要改
const { data } = useSuiClientQuery('getOwnedObjects', ...);
const atelier = await suiClient.getObject(...);
```

### 2. 顯示 Atelier/Sculpt 信息
❌ **不需要修改** - UI 組件保持不變
```typescript
// 這些都不需要改
<AtelierCard atelier={atelier} />
<SculptViewer sculpt={sculpt} />
```

### 3. 構建交易（重要！）
✅ **需要添加 typeArguments** - 所有 Move 調用都需要
```typescript
// ✅ 需要檢查所有這些地方
tx.moveCall({
  target: `${PACKAGE_ID}::atelier::*`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
  arguments: [...]
});

tx.moveCall({
  target: `${PACKAGE_ID}::sculpt::*`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
  arguments: [...]
});
```

---

## 📋 完整的交易函數檢查清單

### ✅ 已更新
- [x] `mintMembership` - 不需要類型參數（MemberShip 不是泛型）
- [x] `createArtlier` (mint_atelier) - ✅ 已添加 `typeArguments`
- [x] `mintSculpt` - ✅ 已添加 `typeArguments`
- [x] `withdrawAtelierPool` - ✅ 已添加 `typeArguments`
- [x] `printSculpt` - 不需要修改（調用外部 Eureka 合約）

### 🔍 需要檢查的其他函數
如果項目中還有其他與 Atelier 或 Sculpt 交互的函數，也需要添加類型參數：

```typescript
// 例如：如果有這些函數（示例）
export const updateAtelier = async (...) => {
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::update_*`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],  // 需要添加
    arguments: [...]
  });
};

export const transferSculpt = async (...) => {
  tx.moveCall({
    target: `${PACKAGE_ID}::sculpt::transfer_*`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],  // 需要添加
    arguments: [...]
  });
};
```

---

## 🚀 部署後驗證

部署新合約後，需要驗證以下功能：

### 1. Mint Atelier
```typescript
// 測試步驟
1. 登入並確認有 Membership
2. 填寫 Atelier 信息（名稱、價格、參數等）
3. 點擊發布
4. 確認交易成功
5. 驗證 Atelier 出現在列表中
```

### 2. Mint Sculpt
```typescript
// 測試步驟
1. 選擇一個 Atelier
2. 調整參數
3. 輸入 Sculpt 名稱
4. 點擊 Mint
5. 確認交易成功
6. 驗證 Sculpt 出現在 Kiosk 中
```

### 3. Withdraw Pool
```typescript
// 測試步驟
1. 打開有資金的 Atelier
2. 點擊提取資金
3. 輸入金額和接收地址
4. 確認交易成功
5. 驗證餘額變化
```

---

## ⚠️ 常見錯誤

### 錯誤 1：缺少類型參數
```typescript
// ❌ 錯誤
tx.moveCall({
  target: `${PACKAGE_ID}::atelier::mint_atelier`,
  arguments: [...]  // 缺少 typeArguments
});

// ✅ 正確
tx.moveCall({
  target: `${PACKAGE_ID}::atelier::mint_atelier`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
  arguments: [...]
});
```

**錯誤信息：**
```
Error: Too few type arguments
Expected 1 type argument(s) but got 0
```

### 錯誤 2：類型參數錯誤
```typescript
// ❌ 錯誤 - 使用了錯誤的類型
tx.moveCall({
  target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
  typeArguments: [`${PACKAGE_ID}::sculpt::SCULPT`],  // 錯誤！
  arguments: [...]
});

// ✅ 正確 - 應該使用 ATELIER
tx.moveCall({
  target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
  arguments: [...]
});
```

### 錯誤 3：參數順序錯誤
```typescript
// ✅ 確保參數順序正確
// Atelier 參數必須是 &mut Atelier<T> 類型
tx.moveCall({
  target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
  typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
  arguments: [
    tx.object(atelierId),      // 第一個：Atelier
    tx.object(membershipId),   // 第二個：MemberShip
    // ... 其他參數
  ]
});
```

---

## 📚 相關文檔

- [階段 1.5 技術文檔](./PHASE1.5_ATELIER_GENERIC.md)
- [重構計劃](./REFACTORING_PLAN.md)
- [合約 API 文檔](./contract/sources/)

---

## 🔧 開發技巧

### 1. 使用 TypeScript 類型提示
```typescript
// 定義類型常量方便復用
const ATELIER_GENERIC_TYPE = `${PACKAGE_ID}::atelier::ATELIER`;

// 使用時
tx.moveCall({
  typeArguments: [ATELIER_GENERIC_TYPE],
  // ...
});
```

### 2. 創建工具函數
```typescript
// 創建一個輔助函數來構建帶類型參數的交易
export const createAtelierTransaction = (
  target: string,
  args: any[]
) => {
  return {
    target: `${PACKAGE_ID}::atelier::${target}`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: args
  };
};

// 使用
tx.moveCall(createAtelierTransaction('mint_atelier', [...]));
```

### 3. 測試腳本
```typescript
// 創建測試腳本來驗證交易構建
const testTransaction = () => {
  const tx = new Transaction();
  
  // 測試 mint_atelier
  tx.moveCall({
    target: `${PACKAGE_ID}::atelier::mint_atelier`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [/* ... */]
  });
  
  console.log('Transaction built successfully');
  console.log(tx.getData());
};
```

---

## ✅ 總結

1. ✅ **transactions.ts 已完全更新**
   - mint_atelier 添加 typeArguments
   - mint_sculpt 添加 typeArguments
   - withdraw_pool 添加 typeArguments
   - 類型常量已更新

2. ✅ **TypeScript 接口無需修改**
   - 數據結構保持不變
   - 只在交易構建時需要類型參數

3. ✅ **部署後需要完整測試**
   - Mint Atelier 流程
   - Mint Sculpt 流程
   - Withdraw Pool 功能

---

**更新者：** AI Assistant  
**狀態：** ✅ 完成  
**下一步：** 部署並測試

