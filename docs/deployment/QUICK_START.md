# 🚀 快速部署指南

## 一鍵部署流程

### 前置要求

- 安裝 Sui CLI
- 配置錢包和網絡
- 確保有足夠的 gas

### 步驟 1: 部署合約

在專案根目錄執行：

```bash
cd /Users/harperdelaviga/archimeters-1
./deploy.sh
```

或手動執行：

```bash
cd contract
sui client publish --skip-fetch-latest-git-deps --gas-budget 500000000 > ../deploy_output.log 2>&1
```

### 步驟 2: 檢查部署結果

```bash
cat deploy_output.log | grep "Status"
```

如果看到 `Status : Success`，代表部署成功！

### 步驟 3: 自動更新前端 ID

```bash
cd /Users/harperdelaviga/archimeters-1
./extract_ids.sh deploy_output.log
```

這個腳本會自動：
- ✅ 提取 Package ID
- ✅ 提取所有 State 和 Policy ID
- ✅ 更新 `frontend/utils/transactions.ts`
- ✅ 備份舊版本配置

### 步驟 4: 驗證更新

```bash
cat frontend/utils/transactions.ts | head -30
```

檢查 `PACKAGE_ID` 和其他 ID 是否已更新。

---

## ⚡ 完整部署命令（複製即用）

```bash
# 進入專案目錄
cd /Users/harperdelaviga/archimeters-1

# 部署合約
cd contract && \
sui client publish --skip-fetch-latest-git-deps --gas-budget 500000000 > ../deploy_output.log 2>&1

# 更新前端 ID
cd .. && ./extract_ids.sh deploy_output.log

# 檢查結果
cat frontend/utils/transactions.ts | head -30
```

---

## 📝 部署後驗證

### 1. 檢查部署狀態

```bash
# 查看部署日誌
cat deploy_output.log

# 確認所有物件都已創建
grep "Created Objects" deploy_output.log -A 20
```

### 2. 手動測試流程

依序測試以下功能：

1. **鑄造會員 (Mint Membership)**
   ```bash
   # 在前端操作或使用 sui client call
   ```

2. **創建 Atelier**
   ```bash
   # 需要先有 Membership
   ```

3. **鑄造 Sculpt**
   ```bash
   # 需要先有 Atelier 和 Membership
   ```

4. **提取 Pool (測試版稅)**
   ```bash
   # 提款測試
   ```

---

## 🆘 常見問題

### Q: 部署失敗怎麼辦？

**A:** 檢查以下項目：
1. Gas 是否足夠（建議 >= 500000000 MIST）
2. 網絡配置是否正確
3. 查看 `deploy_output.log` 錯誤信息

### Q: extract_ids.sh 腳本失敗？

**A:** 可以手動更新，參考 [DEPLOY_SCRIPTS.md](./DEPLOY_SCRIPTS.md#手動更新-id)

### Q: 前端連不上新合約？

**A:** 確認：
1. `frontend/utils/transactions.ts` 中的 `PACKAGE_ID` 已更新
2. 重啟前端開發服務器
3. 清除瀏覽器緩存

---

## 📚 更多資訊

- [部署腳本詳細說明](./DEPLOY_SCRIPTS.md)
- [架構文檔](../architecture/)
- [開發日誌](../archive/development-logs/)

---

**提示：** 首次部署建議在測試網進行完整測試後再部署到主網。

**最後更新：** 2025-11-05

