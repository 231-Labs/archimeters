# 🚀 Archimeters Phase 2 部署指南

## 📦 本次部署內容

### 新功能
- ✅ 新增 `atelier_marketplace` 模塊
- ✅ Pool 提取時自動分配創作者版稅（默認 2.5%）
- ✅ 原創者可調整版稅比例（0-50%）
- ✅ Kiosk 市場功能（上架/下架/購買）
- ✅ TransferPolicy 版稅強制執行

### 模塊結構
```
contract/sources/
├── archimeters.move        # 會員系統
├── atelier.move            # Atelier 核心功能
├── atelier_marketplace.move # 市場功能（新增）
├── sculpt.move             # Sculpt 鑄造
└── royalty_rule.move       # 版稅規則
```

---

## 🔧 部署步驟

### 1️⃣ 編譯確認
```bash
cd /Users/harperdelaviga/archimeters-1/contract
sui move build --skip-fetch-latest-git-deps
```

### 2️⃣ 部署合約
```bash
sui client publish --skip-fetch-latest-git-deps --gas-budget 500000000 | tee ../deploy_output.log
```

> 💡 **提示**: 如果 gas-budget 不足，可以增加到 `1000000000` (1 SUI)

### 3️⃣ 提取並更新 ID
```bash
cd /Users/harperdelaviga/archimeters-1
chmod +x extract_ids.sh
./extract_ids.sh deploy_output.log
```

這個腳本會：
- ✅ 自動提取所有物件 ID
- ✅ 備份舊的 `transactions.ts`
- ✅ 更新新的物件 ID 到 `transactions.ts`

### 4️⃣ 驗證更新
```bash
cat frontend/utils/transactions.ts | grep "export const PACKAGE_ID"
```

確認 `PACKAGE_ID` 已更新為新的值。

---

## 📋 需要提取的物件 ID

部署後會創建以下物件，腳本會自動提取：

### 核心物件
- `PACKAGE_ID` - 包 ID
- `STATE_ID` - ArchimetersState
- `ATELIER_STATE_ID` - AtelierState
- `UPGRADE_CAP` - 升級權限

### Display 物件
- `MEMBERSHIP_DISPLAY`
- `ATELIER_DISPLAY`
- `SCULPT_DISPLAY`

### Publisher 物件
- `PUBLISHER_ARCHIMETERS`
- `PUBLISHER_ATELIER`
- `PUBLISHER_SCULPT`

### TransferPolicy
- `ATELIER_TRANSFER_POLICY` ⭐ 新增
- `SCULPT_TRANSFER_POLICY`
- `ATELIER_TRANSFER_POLICY_CAP` ⭐ 新增
- `SCULPT_TRANSFER_POLICY_CAP`

---

## 🧪 E2E 測試檢查清單

部署完成後，請測試以下功能：

### 基礎功能（Phase 1）
- [ ] 鑄造會員（mintMembership）
- [ ] 創建 Atelier（createArtlier）
- [ ] 鑄造 Sculpt（mintSculpt）
- [ ] Pool 提取（withdrawAtelierPool）

### 新功能（Phase 2）
- [ ] 查詢創作者版稅比例（get_creator_royalty_bps）
- [ ] 更新創作者版稅（updateCreatorRoyalty）
- [ ] Atelier 上架（listAtelier）
- [ ] Atelier 下架（delistAtelier）
- [ ] Atelier 購買（purchaseAtelier）
- [ ] Pool 提取版稅分配驗證

### 預期行為
1. **創作者自己提取 Pool**
   - 不分割版稅
   - 收到全額

2. **新擁有者提取 Pool**（Atelier 被轉讓後）
   - 自動分配版稅給原創者（默認 2.5%）
   - 新擁有者收到剩餘 97.5%

3. **版稅調整**
   - 只有原創者可以調整
   - 範圍：0-50%（0-5000 bps）
   - 調整後立即生效

---

## 🔍 手動提取 ID（備用方案）

如果自動腳本失敗，可以手動從 `deploy_output.log` 中提取：

### 查找 Package ID
```bash
grep -A 1 "│ PackageID" deploy_output.log
```

### 查找 State ID
```bash
grep -B 2 "archimeters::ArchimetersState" deploy_output.log | grep ObjectID
```

### 查找 Atelier Transfer Policy
```bash
grep -B 2 "atelier::Atelier<" deploy_output.log | grep -A 10 "TransferPolicy"
```

然後手動更新 `frontend/utils/transactions.ts`。

---

## 🐛 常見問題

### Q: 部署失敗 "insufficient gas"
A: 增加 gas-budget：
```bash
sui client publish --gas-budget 1000000000
```

### Q: 找不到某個物件 ID
A: 查看完整的 deploy_output.log：
```bash
cat deploy_output.log | grep -A 5 "Created Objects"
```

### Q: 舊合約的資料怎麼辦？
A: 本次是新部署，需要：
1. 記錄舊的 PACKAGE_ID（已在 transactions.ts 註解中）
2. 通知用戶遷移到新合約
3. 或者使用 Upgrade 機制（需要 UpgradeCap）

---

## 📞 部署後確認

部署成功後，請執行：

```bash
# 1. 確認合約在鏈上
sui client object $PACKAGE_ID

# 2. 確認 TransferPolicy 存在
sui client object $ATELIER_TRANSFER_POLICY

# 3. 確認版本號
cat frontend/utils/transactions.ts | head -30
```

---

## ✅ 完成標記

- [ ] 合約編譯成功
- [ ] 合約部署成功
- [ ] 物件 ID 已提取
- [ ] `transactions.ts` 已更新
- [ ] 基礎功能測試通過
- [ ] Marketplace 功能測試通過
- [ ] Git commit 完成

---

祝部署順利！🎉

