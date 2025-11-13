# Walrus Haulout Hackathon 文檔目錄

這個目錄包含了 Archimeters 參加 Walrus Haulout Hackathon (2025-11-06 ~ 2025-11-16) 的完整開發計劃、進度追蹤和技術筆記。

---

## 📁 文件說明

### 📋 [implementation-plan.md](./implementation-plan.md)
**完整的實施計劃文檔**

包含內容：
- 黑客松評分重點分析
- P0/P1/P2 優先級功能清單
- 詳細的技術實施方案
- 10 天時間線規劃
- 風險評估與應對策略
- 快速恢復記憶用摘要

**使用場景**：
- 新的對話開始時，參考這個文檔快速恢復上下文
- 需要查看某個功能的詳細實施方案
- 向團隊成員說明整體計劃

---

### 📊 [progress.md](./progress.md)
**每日進度追蹤表**

包含內容：
- 整體進度總覽表
- 每日完成事項記錄
- 遇到的問題與解決方案
- 關鍵里程碑檢查清單
- Bug 追蹤表

**使用場景**：
- 每天結束時更新當日進度
- 檢查是否按時間線推進
- 記錄遇到的問題供之後參考

**更新頻率**：每日至少更新一次

---

### 📝 [notes.md](./notes.md)
**開發技術筆記**

包含內容：
- 技術實作細節
- 程式碼片段範例
- 除錯技巧
- 參考資料連結
- 待確認事項

**使用場景**：
- 記錄重要的程式碼片段
- 記錄遇到的技術坑和解決方案
- 收集實用的參考資料
- 記錄設計決策的原因

**更新頻率**：隨時記錄

---

## 🔄 使用流程

### 1️⃣ 開始新的一天
```bash
# 1. 閱讀今日計劃
cat docs/hackathon/implementation-plan.md | grep "Day X"

# 2. 檢視昨日進度
cat docs/hackathon/progress.md | tail -n 20

# 3. 在 Cursor 中開始對話
"今天是 Day X，我要開始做 [功能名稱]，請幫我執行"
```

### 2️⃣ 開發過程中
- 遇到重要技術細節 → 記錄到 `notes.md`
- 完成某個子任務 → 更新 `progress.md` 的 checklist
- 遇到問題 → 記錄到 `progress.md` 的問題區塊

### 3️⃣ 一天結束時
- 更新 `progress.md` 的「完成事項」
- 填寫「遇到的問題」和「明日計劃」
- 更新整體進度表

### 4️⃣ Token 用完或需要新對話時
在新對話中輸入：
```
@implementation-plan.md 
我現在在做 [當前任務]，已經完成了 [已完成部分]，
遇到了 [問題描述]，請幫我繼續
```

或者直接引用快速摘要部分。

---

## 🎯 快速參考

### 關鍵檔案位置

#### 合約
- `contract/sources/atelier.move` - Atelier 核心合約
- `contract/sources/sculpt.move` - Sculpt 核心合約
- `contract/sources/atelier_marketplace.move` - 市場合約

#### 前端核心
- `frontend/components/features/atelier-viewer/hooks/useSculptMint.ts` - Mint 邏輯
- `frontend/components/windows/VaultWindow.tsx` - Vault 窗口
- `frontend/components/windows/BrowseWindow.tsx` - Gallery 窗口
- `frontend/components/layout/Dock.tsx` - Dock 導航

#### 配置
- `frontend/config/windows.ts` - 窗口配置
- `frontend/config/walrus.ts` - Walrus 配置
- `frontend/utils/transactions.ts` - 交易工具函數

### 優先級快速查看

**P0 - 必須完成**
1. Seal SDK 整合（加密上傳）
2. Sculpt 二級市場（Kiosk）
3. Atelier 二級市場

**P1 - 高優先級**
4. Vault Atelier 詳情頁
5. Vault Sculpt 詳情頁
6. Gallery 優化（List 模式、Trending）
7. Pavilion 接入

**P2 - 中優先級**
8. 註冊流程優化
9. 餘額顯示修復

---

## 📞 緊急聯絡

### 當遇到阻塞問題時
1. 檢查 `notes.md` 的「待確認事項」區塊
2. 查看 `implementation-plan.md` 的「風險與應對」部分
3. 考慮降級方案或調整優先級
4. 在 Discord 社群尋求幫助

### 社群資源
- Sui Discord: https://discord.gg/sui
- Walrus Community: https://discord.gg/walrus
- Hackathon 專屬頻道: 待補充

---

## 📈 成功標準

### 必須展示（P0）
- ✅ Walrus 去中心化存儲（演算法 + 3D 模型）
- ✅ Seal 加密保護（STL 檔案加密）
- ✅ 完整的二級市場交易流程

### 加分項（P1）
- ✅ 精美的 Vault 詳情頁面
- ✅ 多種 Mint 頁面樣式
- ✅ Pavilion 整合展示

### 錦上添花（P2）
- ✅ 優化的用戶體驗
- ✅ 完善的錯誤處理

---

## 🔗 相關連結

- [專案 GitHub](https://github.com/231-Labs/archimeters)
- [Live Demo](https://archimeters.vercel.app/)
- [黑客松規則](https://suifoundation.notion.site/Walrus-Haulout-Hackathon-Event-Rules-29437af41c6e808a8acbc35f7a7df86a)
- [Walrus 文檔](https://docs.walrus.site/)
- [Sui 文檔](https://docs.sui.io/)

---

_建立日期: 2025-11-06_  
_維護者: Harper De La Viga_

