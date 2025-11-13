# Archimeters 部署記錄

## 📅 最新部署 - 階段 1.5 泛型化

### 部署信息
- **日期：** 2025-11-04
- **Epoch：** 908
- **Transaction Digest：** `DaXkXPwpUqsCk7ybSRn9hx4JMUFgCrKTakFMoPthfQLG`
- **網絡：** Sui Testnet
- **Gas Used：** 93.83 SUI (93,828,680 MIST)

### 核心改動
✅ **階段 1.5 - Atelier & Sculpt 泛型化**
- `Atelier` → `Atelier<phantom ATELIER>`
- `Sculpt` → `Sculpt<phantom ATELIER>`
- 編譯時類型安全保證
- 防止類型混淆攻擊

### Package ID
```
0x80e08281d763b4f020c106e1a6a10108058bef89c3054cb85fa894a3bc4c3f09
```

### 核心物件 ID

#### State Objects (Shared)
```typescript
STATE_ID                = '0x192bd3eb1fc09c0e9815bf39549807c00456fdd018e5765c7c5904db78f7e2e4'
ATELIER_STATE_ID        = '0xce5b9be03c5bfe7b5f5625575826ecef4a3f166fdb87370e8f453e7a146f5b88'
SCULPT_TRANSFER_POLICY  = '0x7142c6057e2c765ef16d37dd6e0f41be8000d2f558ee5d8109dd080a71c65ca5'
```

#### Display Objects
```typescript
MEMBERSHIP_DISPLAY = '0xae9617ae3ab3b00164b9b384b3640ed310dbd1afdcbdbf99fa2c612b6de8d8c1'
ATELIER_DISPLAY    = '0x005b63266359c357bd504fc56627b666c1fb204cd6e9ba4ddc24b068b898a5ea'
SCULPT_DISPLAY     = '0x0016bc6fae9142ec9ad4fca65308cc0c49dfc3a65c4e4244e231b382ee517e9d'
```

#### Publisher Objects
```typescript
PUBLISHER_ARCHIMETERS = '0xd2f7de8e7de73295893a72910deaa628b877a3071ef9c9c2a40cca013b3ee85e'
PUBLISHER_ATELIER     = '0xa13518f50b1bed6cd7352f4bacfdbca83f4fd0bd74d094ec4b202b4a8c15a782'
PUBLISHER_SCULPT      = '0x5e1b4ecc5a504d033d3599afeb4b00cd292df8ff51a6a729b8f8315423bf8c14'
```

#### Capability Objects
```typescript
SCULPT_TRANSFER_POLICY_CAP = '0x3080943a4fac94da1cf90c7d9853b23abe48372357ea4fc9d3d8af4cb2c11546'
UPGRADE_CAP                = '0x834963d39f4006761ee4e50d3f610af7f17159e8ac2ac5c808994f3fc9056e98'
```

### 類型定義
```typescript
MEMBERSHIP_TYPE = '0x80e08281d763b4f020c106e1a6a10108058bef89c3054cb85fa894a3bc4c3f09::archimeters::MemberShip'
ATELIER_TYPE    = '0x80e08281d763b4f020c106e1a6a10108058bef89c3054cb85fa894a3bc4c3f09::atelier::Atelier<0x80e08281d763b4f020c106e1a6a10108058bef89c3054cb85fa894a3bc4c3f09::atelier::ATELIER>'
SCULPT_TYPE     = '0x80e08281d763b4f020c106e1a6a10108058bef89c3054cb85fa894a3bc4c3f09::sculpt::Sculpt<0x80e08281d763b4f020c106e1a6a10108058bef89c3054cb85fa894a3bc4c3f09::atelier::ATELIER>'
```

### 驗證 Explorer 鏈接
- **Package:** https://testnet.suivision.xyz/package/0x80e08281d763b4f020c106e1a6a10108058bef89c3054cb85fa894a3bc4c3f09
- **Transaction:** https://testnet.suivision.xyz/txblock/DaXkXPwpUqsCk7ybSRn9hx4JMUFgCrKTakFMoPthfQLG
- **State Object:** https://testnet.suivision.xyz/object/0x192bd3eb1fc09c0e9815bf39549807c00456fdd018e5765c7c5904db78f7e2e4
- **Atelier State:** https://testnet.suivision.xyz/object/0xce5b9be03c5bfe7b5f5625575826ecef4a3f166fdb87370e8f453e7a146f5b88
- **Transfer Policy:** https://testnet.suivision.xyz/object/0x7142c6057e2c765ef16d37dd6e0f41be8000d2f558ee5d8109dd080a71c65ca5

---

## 📋 前端整合測試清單

### ✅ 準備工作
- [x] 部署合約到測試網
- [x] 更新 `frontend/utils/transactions.ts` 中的所有 ID
- [ ] 重啟前端開發服務器

### 🧪 測試項目

#### 1. Mint Membership
- [ ] 連接錢包
- [ ] 輸入用戶名和描述
- [ ] 提交交易
- [ ] 確認 MemberShip NFT 出現在錢包

#### 2. Mint Atelier（設計模板）
- [ ] 確認已有 Membership
- [ ] 填寫 Atelier 信息：
  - [ ] 名稱
  - [ ] 價格（SUI）
  - [ ] 圖片（上傳到 Walrus）
  - [ ] 算法文件
  - [ ] 參數定義（名稱、類型、範圍）
- [ ] 提交交易（應該包含 `typeArguments: [ATELIER]`）
- [ ] 確認 Atelier 創建成功
- [ ] 驗證 Atelier 出現在列表中

#### 3. Mint Sculpt（作品）
- [ ] 選擇一個已創建的 Atelier
- [ ] 調整參數（應在定義的範圍內）
- [ ] 預覽 3D 模型
- [ ] 輸入 Sculpt 名稱
- [ ] 提交交易（應該包含 `typeArguments: [ATELIER]`）
- [ ] 確認 Sculpt 創建成功
- [ ] 驗證 Sculpt 在 Kiosk 中
- [ ] 確認 TransferPolicy 生效

#### 4. Withdraw Pool
- [ ] 作為 Atelier 創建者
- [ ] 查看 Pool 餘額
- [ ] 輸入提取金額
- [ ] 提交交易
- [ ] 確認資金到賬

### 🐛 已知問題檢查
- [ ] 參數驗證：確保超出範圍的參數被拒絕
- [ ] 支付驗證：確保支付不足時交易失敗
- [ ] Kiosk 整合：確認 Sculpt 正確放入 Kiosk
- [ ] TransferPolicy：確認交易需要遵守 Policy

---

## 🔄 歷史部署記錄

### 2025-11-02 - 階段 1 初版
- **Epoch:** 906
- **Transaction:** FE8qibrcLuq4zUc7hstrHNF3JV8a4WWHW8AX3zcvqbC9
- **Package ID:** 0x5712bc99406bf71c386f4641f7fc31e67de74b12a4fceb569325bf29e09c614c
- **Changes:** 
  - Sculpt 泛型化 `Sculpt<ATELIER>`
  - 添加 `atelier_id` 字段
  - TransferPolicy 初始化

### 更早版本
- **Package ID:** 0x64ec0abe4f0c79ab509fe2eb61c37e584ed1681d274926216bfe5113a07f5d33
- **Changes:** 原始版本

---

## 📊 Gas 分析

### 當前部署成本
```
Storage Cost:       93.81 SUI
Computation Cost:    1.00 SUI
Storage Rebate:      0.98 SUI
─────────────────────────────
Net Cost:          ~93.83 SUI
```

### 預期交易成本
- **Mint Membership:** ~0.01-0.02 SUI
- **Mint Atelier:** ~0.02-0.05 SUI
- **Mint Sculpt:** ~0.02-0.03 SUI + Atelier 價格
- **Withdraw Pool:** ~0.01 SUI

---

## 🔧 故障排除

### 常見錯誤

#### 錯誤 1：Too few type arguments
```
Error: Expected 1 type argument(s) but got 0
```
**解決：** 確保所有 Atelier/Sculpt 相關的 moveCall 都包含 `typeArguments`

#### 錯誤 2：Invalid instantiation
```
Error: Invalid instantiation of 'Atelier'. Expected 1 type argument
```
**解決：** 檢查查詢時使用的類型字符串，確保包含完整的泛型類型

#### 錯誤 3：Insufficient balance
```
Error: Coin balance not sufficient
```
**解決：** 
1. 確保錢包有足夠的 SUI
2. 確認 gas budget 設置合理
3. 確認 Atelier 價格設置正確（MIST 單位）

### 調試技巧

1. **檢查交易參數：**
   ```typescript
   console.log('Transaction target:', target);
   console.log('Type arguments:', typeArguments);
   console.log('Arguments:', arguments);
   ```

2. **驗證物件 ID：**
   - 在 Sui Explorer 確認物件存在
   - 確認物件類型匹配
   - 確認物件所有權正確

3. **測試網水龍頭：**
   - Discord: #testnet-faucet
   - 或使用 CLI: `sui client faucet`

---

## 📝 更新記錄

### 2025-11-04
- ✅ 部署階段 1.5 版本
- ✅ 更新所有物件 ID
- ✅ 創建部署日誌
- ⏳ 等待前端整合測試

---

**維護者：** Development Team  
**最後更新：** 2025-11-04  
**狀態：** ✅ 部署完成，等待測試

