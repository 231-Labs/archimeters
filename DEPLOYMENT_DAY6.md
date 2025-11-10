# 部署總結 - Day 6 (2025-11-10)

## 🎉 部署成功

**Transaction Digest**: `HyhgVhAWqcwEVBZpo4H7Zk8vKseCqPr3SuJ9xcYk3nBv`

**部署時間**: 2025-11-10

**Gas 費用**: 159.64 SUI (159,641,480 MIST)

---

## 🔑 核心合約地址

### 主要包和狀態

```typescript
PACKAGE_ID = '0x8c902302be5b2cb272aa26d9486439caaab1fdd306610df473d7ebf5802c4165'
STATE_ID = '0xd4ba9ad12cdc47fb99b69edc0634cb8357d50d953a3ca6e718325f8112ff0452'
ATELIER_STATE_ID = '0xc9c059ea80f51ab23fbbe835377ff629c5a7dce26e70487a86cf7d73a641c249'
UPGRADE_CAP = '0xcd085845e5135e2f9837b0f557ae5caf1cb36b9f7d9f8edf4386c5e3372f8b8c'
```

### Transfer Policies

```typescript
// Atelier Transfer Policy (Shared Object)
ATELIER_TRANSFER_POLICY = '0x653303deeee38f47636d923d9cef0c3a766f81572b6c76a727b775a9bd7a5f81'
ATELIER_TRANSFER_POLICY_CAP = '0x24546343bf83b978324cd7a7e0cc14a6860e0338d9bd21f41fc4275007fab735'

// Sculpt Transfer Policy (Shared Object)
SCULPT_TRANSFER_POLICY = '0x73a8e4cb4b7e3675f30a4f8636dd14d8b22adb3607e9f9a56f4be459f55fec0c'
SCULPT_TRANSFER_POLICY_CAP = '0xfb60c2a6c8ed45a7c6cc3bc0f14d87da126868dcef2e6fc82d9bb87b7c8d7b17'
```

### Display Objects

```typescript
MEMBERSHIP_DISPLAY = '0x4563db890232f0b08ffcb6ee9a2f4ae520ceb905c9192aefea2fb565b6d4f0a3'
ATELIER_DISPLAY = '0x3116df5a28b90a195a5af618d8b1d07828b20ce5d188242419ab140453549742'
SCULPT_DISPLAY = '0x29c207e121a2129b05cef6d3bd70aa25734c461e2dc2ca8dba3a8acf5e304c94'
```

### Publishers

```typescript
PUBLISHER_ARCHIMETERS = '0x68c566f51a71bc15bd93fb315580ff0adc88bcf286f4d8e117a5ccd27bbde6a2'
PUBLISHER_ATELIER = '0x6a509f7d21710531a2870f429d31e73d4576427353266db4b8069badeaadedeb'
PUBLISHER_SCULPT = '0x8636dd103fa1c432fcb2ceb650ba354985a5522c9082d251246291708ed0b72f'
```

---

## 📐 架構變更

### 核心創新：PoolCap 可交易架構

```
📐 Atelier (Shared Object)
   ↓ 任何人可讀取和 mint
   
💰 AtelierPool (Shared Object)
   ↓ 收集 mint 費用
   
🎫 AtelierPoolCap (Owned Object)
   ↓ **可交易的收益權憑證**
   
🎨 Sculpt (Owned Object)
   ↓ 可交易的藝術品
```

### 關鍵特性

1. ✅ **Atelier 是 Shared Object** - 任何人都能訪問和 mint
2. ✅ **PoolCap 是 Owned Object** - 可以被交易/轉移
3. ✅ **收益權與訪問權分離** - 持有 PoolCap 才能提取資金
4. ✅ **高並發性能** - Shared Object 支持多用戶同時操作

---

## 🔄 與上一版本的差異

### 主要變更

| 功能 | Day 5 版本 | Day 6 版本 |
|------|-----------|-----------|
| Atelier 類型 | Owned Object | **Shared Object** |
| PoolCap 存儲 | Dynamic Field | **獨立 Owned Object** |
| 訪問控制 | 只有所有者 | **任何人** |
| 提取權限 | current_owner | **PoolCap 持有者** |
| PoolCap 交易 | ❌ 不支持 | ✅ **完全支持** |

### 合約變更

```move
// 1. PoolCap 不再存儲在 dynamic field
// 舊版: sui::dynamic_field::add(&mut atelier_uid, PoolCapKey {}, pool_cap);
// 新版: transfer::public_transfer(pool_cap, ctx.sender());

// 2. Atelier 改為 Shared Object
// 舊版: transfer::public_transfer(atelier, ctx.sender());
// 新版: transfer::share_object(atelier);

// 3. withdraw_pool 需要提供 PoolCap
// 舊版: withdraw_pool(atelier, pool, amount, recipient, ctx)
// 新版: withdraw_pool(pool_cap, atelier, pool, amount, recipient, ctx)
```

---

## 🧪 E2E 測試指南

### 測試場景 1：創建 Atelier 並獲得 PoolCap

```typescript
// 1. Mint Membership (如果還沒有)
const membershipTx = mintMembership("test_user", "Test User");

// 2. 創建 Atelier
const atelierTx = createArtlier(
  membershipId,
  "Test Atelier",
  photoBlobId,
  dataBlobId,
  algorithmBlobId,
  1000000000, // 1 SUI
  parameters
);

// 3. 檢查結果
// - 應該獲得一個 Atelier (Shared Object)
// - 應該獲得一個 AtelierPoolCap (Owned Object)
// - 可以在 Sui Explorer 查看對象類型
```

### 測試場景 2：其他用戶 Mint Sculpt

```typescript
// 使用另一個錢包
// 1. 確保有 Membership
// 2. 直接訪問 Shared Atelier 進行 mint
const sculptTx = mintSculpt(
  sharedAtelierId, // 任何人都可以訪問
  poolId,
  membershipId,
  kioskId,
  kioskCapId,
  alias,
  blueprint,
  glbFile,
  structure,
  sealResourceId,
  paramKeys,
  paramValues,
  price
);

// 3. 驗證
// - 費用應該進入 AtelierPool
// - Sculpt 應該屬於 mint 者
// - 原創建者仍持有 PoolCap
```

### 測試場景 3：提取資金需要 PoolCap

```typescript
// 使用 PoolCap 持有者的錢包
const withdrawTx = withdrawAtelierPool(
  poolCapId,    // 必須擁有這個 PoolCap
  atelierId,
  poolId,
  amountInMist,
  recipientAddress
);

// 如果使用非 PoolCap 持有者的錢包，交易會失敗
```

### 測試場景 4：轉移 PoolCap（收益權交易）

```typescript
// 方案 A：直接轉移
const transferTx = new Transaction();
transferTx.transferObjects([poolCapId], recipientAddress);

// 方案 B：在 Kiosk 出售
const listTx = new Transaction();
listTx.moveCall({
  target: '0x2::kiosk::place',
  arguments: [kioskId, kioskCapId, poolCapId],
  typeArguments: [
    `${PACKAGE_ID}::atelier::AtelierPoolCap<${PACKAGE_ID}::atelier::ATELIER>`
  ]
});

// 之後新持有者可以提取資金
// Atelier 仍然是 Shared Object，任何人都能 mint
```

---

## 📊 類型定義

### 重要類型

```typescript
// Atelier (Shared Object)
ATELIER_TYPE = `${PACKAGE_ID}::atelier::Atelier<${PACKAGE_ID}::atelier::ATELIER>`

// AtelierPoolCap (Owned Object - 可交易)
ATELIER_POOL_CAP_TYPE = `${PACKAGE_ID}::atelier::AtelierPoolCap<${PACKAGE_ID}::atelier::ATELIER>`

// Sculpt (Owned Object)
SCULPT_TYPE = `${PACKAGE_ID}::sculpt::Sculpt<${PACKAGE_ID}::atelier::ATELIER>`

// Membership (Owned Object)
MEMBERSHIP_TYPE = `${PACKAGE_ID}::archimeters::MemberShip`
```

---

## 🔗 有用的鏈接

- **Transaction**: https://testnet.suivision.xyz/txblock/HyhgVhAWqcwEVBZpo4H7Zk8vKseCqPr3SuJ9xcYk3nBv
- **Package**: https://testnet.suivision.xyz/package/${PACKAGE_ID}
- **State**: https://testnet.suivision.xyz/object/${STATE_ID}
- **Atelier State**: https://testnet.suivision.xyz/object/${ATELIER_STATE_ID}

---

## ⚠️ 注意事項

1. **Atelier 不能在 Kiosk 交易** - 因為它是 Shared Object
2. **但 PoolCap 可以交易** - 這是收益權的憑證
3. **前端需要更新** - 已在 `transactions.ts` 中更新所有地址
4. **提取資金需要 PoolCap** - 不再檢查 current_owner
5. **任何人都能 mint** - 只要有 Membership 就能使用任何 Atelier

---

## ✅ 部署後檢查清單

- [x] 合約構建成功
- [x] 合約部署成功
- [x] transactions.ts 已更新
- [ ] 前端 E2E 測試通過
- [ ] 創建 Atelier 測試
- [ ] 跨用戶 Mint 測試
- [ ] 提取資金測試
- [ ] PoolCap 轉移測試

---

## 📝 相關文檔

- [架構遷移指南](./docs/ATELIER_SHARED_OBJECT_MIGRATION.md)
- [合約源碼](./contract/sources/atelier/atelier.move)
- [前端交易工具](./frontend/utils/transactions.ts)

---

**部署者**: 0x598928d17a9a5dadfaffdaca2e5d2315bd2e9387d73c8a63488a1a0f4d73ffbd

**網絡**: Sui Testnet

**Epoch**: 914

