# 📦 部署腳本說明

## 腳本總覽

專案提供兩個主要的部署相關腳本：

1. **`deploy.sh`** - 部署合約
2. **`extract_ids.sh`** - 提取和更新物件 ID

---

## 🚀 deploy.sh

### 功能

自動化部署 Move 合約到 Sui 網絡。

### 使用方式

```bash
cd /Users/harperdelaviga/archimeters-1
./deploy.sh
```

### 腳本內容

```bash
#!/bin/bash
cd contract
sui client publish --skip-fetch-latest-git-deps --gas-budget 500000000 > ../deploy_output.log 2>&1
echo "部署完成，結果已儲存至 deploy_output.log"
```

### 參數說明

- `--skip-fetch-latest-git-deps`: 跳過 git 依賴更新（加快部署速度）
- `--gas-budget 500000000`: 設置 gas 預算為 500M MIST
- `> deploy_output.log 2>&1`: 將輸出和錯誤都重定向到日誌文件

---

## 🔍 extract_ids.sh

### 功能

從部署日誌中提取所有重要的物件 ID，並自動更新前端配置文件。

### 使用方式

```bash
./extract_ids.sh deploy_output.log
```

### 提取的物件 ID

腳本會自動提取以下 ID：

#### 核心物件
- **Package ID** - 合約套件 ID
- **Upgrade Cap** - 升級權限

#### State 物件
- **ArchimetersState** - 主狀態物件
- **AtelierState** - Atelier 狀態物件

#### Transfer Policy（版稅系統）
- **Atelier Transfer Policy** - Atelier 的轉移策略
- **Atelier Transfer Policy Cap** - 策略管理權限
- **Sculpt Transfer Policy** - Sculpt 的轉移策略  
- **Sculpt Transfer Policy Cap** - 策略管理權限

#### Display 物件
- **Membership Display**
- **Atelier Display**
- **Sculpt Display**

#### Publisher 物件
- **Publisher (Archimeters)**
- **Publisher (Atelier)**
- **Publisher (Sculpt)**

### 自動化流程

1. ✅ 解析 `deploy_output.log`
2. ✅ 使用正則表達式提取所有 ID
3. ✅ 備份舊的 `transactions.ts`（加上時間戳）
4. ✅ 更新 `frontend/utils/transactions.ts`
5. ✅ 添加版本註釋和時間戳

### 更新格式

```typescript
// ============================================================================
// CURRENT VERSION - Deployment: [PackageID 前 8 碼]
// Deployed: 2025-11-05, Epoch: [區塊高度]
// Changes: [變更說明]
// ============================================================================

export const PACKAGE_ID = '0x...';
export const STATE_ID = '0x...';
// ... 其他 ID
```

---

## 🛠️ 手動更新 ID

如果自動腳本失敗，可以手動更新：

### 步驟 1: 打開部署日誌

```bash
cat deploy_output.log
```

### 步驟 2: 找到 Package ID

搜索：
```
│ PackageID
```

下一行就是 Package ID。

### 步驟 3: 找到各種物件 ID

搜索關鍵字：

```bash
# ArchimetersState
grep "archimeters::ArchimetersState" deploy_output.log -B 5

# AtelierState  
grep "archimeters::atelier::AtelierState" deploy_output.log -B 5

# Transfer Policy (Atelier)
grep "atelier::Atelier<" deploy_output.log -B 5 | grep "TransferPolicy"

# Transfer Policy (Sculpt)
grep "sculpt::Sculpt<" deploy_output.log -B 5 | grep "TransferPolicy"
```

### 步驟 4: 編輯 transactions.ts

```bash
# 打開文件
code frontend/utils/transactions.ts

# 或用 vim
vim frontend/utils/transactions.ts
```

找到對應的常量並更新：

```typescript
export const PACKAGE_ID = '0x你的新PackageID';
export const STATE_ID = '0x你的新StateID';
// ... 依此類推
```

### 步驟 5: 驗證

```bash
# 檢查文件內容
cat frontend/utils/transactions.ts | head -50

# 確保所有 ID 都是 0x 開頭的 64 位十六進制
```

---

## 📋 常見問題

### Q: 為什麼需要提取這麼多 ID？

**A:** 不同的功能需要不同的物件 ID：
- `PACKAGE_ID`: 所有 move call 都需要
- `STATE_ID`: 讀取合約狀態
- `TRANSFER_POLICY`: Kiosk 交易和版稅
- `DISPLAY`: NFT 在錢包中的顯示

### Q: 腳本找不到某個 ID 怎麼辦？

**A:** 可能的原因：
1. 合約結構有變化
2. 部署日誌格式改變
3. 某個物件沒有正確創建

解決方法：
- 手動在日誌中搜索
- 檢查合約的 `init` 函數
- 確認部署是否成功

### Q: 可以跳過某些 ID 嗎？

**A:** 不建議。所有 ID 都有其用途：
- 缺少 State ID → 無法讀取狀態
- 缺少 Policy ID → Kiosk 交易失敗
- 缺少 Display ID → NFT 顯示異常

---

## 🔐 安全提示

### ID 備份

腳本會自動備份舊配置：

```bash
# 備份文件格式
frontend/utils/transactions.ts.backup.YYYYMMDD_HHMMSS
```

### 回滾方法

如果新部署有問題，可以快速回滾：

```bash
# 找到備份文件
ls -la frontend/utils/transactions.ts.backup.*

# 恢復備份
cp frontend/utils/transactions.ts.backup.20251105_143022 frontend/utils/transactions.ts
```

---

## 📝 腳本維護

### 修改提取規則

如果合約結構變化，需要更新 `extract_ids.sh` 中的正則表達式：

```bash
# 編輯腳本
vim extract_ids.sh

# 找到對應的 grep/sed 命令
# 修改匹配模式
```

### 添加新的 ID 提取

```bash
# 1. 在 extract_ids.sh 中添加提取邏輯
NEW_ID=$(grep "關鍵字" "$LOG_FILE" | ...)

# 2. 添加到輸出
echo "export const NEW_ID = '$NEW_ID';" >> "$TRANSACTIONS_FILE"
```

---

**提示：** 建議在部署前先在測試網驗證腳本是否正常工作。

**最後更新：** 2025-11-05

