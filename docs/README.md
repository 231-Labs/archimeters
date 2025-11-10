# 📚 Archimeters 文檔索引

> 完整的系統文檔導航，包括架構、快速開始、黑客松進度和歷史檔案

---

## 🚀 快速開始 (3 分鐘)

新手入門？從這裡開始：

- **[本地開發環境設置](./quickstart/LOCAL_SETUP.md)** - 設置開發環境
- **[部署指南](./quickstart/DEPLOYMENT.md)** - 部署到 Testnet
- **[常見問題](./quickstart/FAQ.md)** - 常見問題解答

---

## 🎯 黑客松進度 (Walrus Haulout 2025-11-06 ~ 11-16)

**當前狀態**: 🚧 進行中 (Day 6)

### 📊 進度與計劃

- **[進度追蹤](./hackathon/progress.md)** ⭐ **每日實時更新**
  - 當前完成度：80%+
  - 優先級任務確認
  - 時間線規劃

- **[功能完成度矩陣](./hackathon/status/FEATURE_COMPLETION_MATRIX.md)** 📊
  - 對標原始需求規格
  - 每個功能的完成狀態
  - 優先級排序

### 📋 實施文檔

具體的實現計劃和技術細節：

- **[Seal SDK 實施計劃](./hackathon/implementation/SEAL_IMPLEMENTATION_PLAN.md)** 🔐
  - Seal 加密集成
  - 合約層實現
  - 前端加密流程

- **[Publisher Retro UI 重設計](./hackathon/implementation/PUBLISHER_RETRO_UI_REDESIGN.md)** 🎨
  - UI 設計方案
  - Retro OS 風格組件
  - 實施步驟

- **[Pavilion 接入指南](./hackathon/implementation/PAVILION_IFRAME_INTEGRATION.md)** 🌐
  - Pavilion 整合方案
  - iframe 通信機制
  - URL 參數設置

- **[窗口系統重構](./hackathon/implementation/WINDOW_SYSTEM_REFACTOR.md)** 🪟
  - 窗口管理架構
  - Z-index 管理
  - 拖動和焦點行為

### 📅 日誌存檔

- **[Day 1-5 詳細日誌](./hackathon/status/DAILY_LOGS_ARCHIVE.md)** 📖
  - 歷史進度記錄
  - 每天的完成項目
  - 技術亮點和問題解決

---

## 🏗️ 系統架構

了解 Archimeters 的整體設計：

- **[架構概述](./architecture/README.md)** 📐
  - 系統設計原則
  - 主要模塊概述
  - 技術棧

- **[Marketplace 架構](./architecture/MARKETPLACE.md)** 🛍️
  - 二級市場設計
  - Kiosk SDK 整合
  - TransferPolicy 機制

- **[安全設計](./architecture/SECURITY.md)** 🔒
  - 合約安全性
  - 白名單機制
  - Seal 加密方案

- **[組件文檔](./architecture/COMPONENTS.md)** 🧩
  - Retro UI 組件系統
  - 可復用組件清單
  - 使用示例

---

## 📦 歷史版本和存檔

之前版本的開發文檔（已完成或過時）：

### Phase 1 (初始開發)

- **[Phase 1 總結](./archive/phase1/PHASE1_SUMMARY.md)**
- **[開發日誌](./archive/phase1/development-logs/)**
- **[遷移指南](./archive/phase1/GENERIC_TYPE_SAFETY.md)**

### Phase 2 (市場和優化)

- **[Phase 2 總結](./archive/phase2/PHASE2_SUMMARY.md)**
- **[部署摘要](./archive/phase2/DEPLOYMENT_SUMMARY_PHASE2.4.md)**
- **[測試摘要](./archive/phase2/development-logs/TESTING_SUMMARY.md)**

### 完整的存檔文檔

- **[存檔索引](./archive/README.md)** - 所有歷史文檔的完整列表

---

## 🗂️ 文件結構

```
docs/
├── README.md ⭐ 你在這裡
├── quickstart/
│   ├── README.md
│   ├── LOCAL_SETUP.md
│   ├── DEPLOYMENT.md
│   └── FAQ.md
├── architecture/
│   ├── README.md
│   ├── MARKETPLACE.md
│   ├── SECURITY.md
│   └── COMPONENTS.md
├── hackathon/
│   ├── README.md (黑客松概述)
│   ├── progress.md ⭐ (進度表)
│   ├── status/
│   │   ├── FEATURE_COMPLETION_MATRIX.md
│   │   └── DAILY_LOGS_ARCHIVE.md
│   ├── implementation/
│   │   ├── SEAL_IMPLEMENTATION_PLAN.md
│   │   ├── PUBLISHER_RETRO_UI_REDESIGN.md
│   │   ├── PAVILION_IFRAME_INTEGRATION.md
│   │   └── WINDOW_SYSTEM_REFACTOR.md
│   └── tasks/
│       └── DAY3_TASKS.md
├── archive/
│   ├── README.md
│   ├── phase1/
│   └── phase2/
└── deprecated/
    └── deployment/ (已過時的部署文檔)
```

---

## 🔍 按用途查找文檔

### 我想...

**快速開始編碼**
→ [本地開發環境設置](./quickstart/LOCAL_SETUP.md)

**部署到測試網**
→ [部署指南](./quickstart/DEPLOYMENT.md)

**了解系統架構**
→ [架構概述](./architecture/README.md)

**查看黑客松進度**
→ [進度追蹤](./hackathon/progress.md)

**了解功能完成度**
→ [功能完成度矩陣](./hackathon/status/FEATURE_COMPLETION_MATRIX.md)

**學習 Seal 加密實現**
→ [Seal SDK 實施計劃](./hackathon/implementation/SEAL_IMPLEMENTATION_PLAN.md)

**查看過去的開發記錄**
→ [存檔文檔](./archive/README.md)

**查找特定的 Retro UI 組件**
→ [組件文檔](./architecture/COMPONENTS.md)

---

## 📝 文檔維護

### 每日更新

- ⭐ **progress.md** - 黑客松每日實時更新
- 📊 **FEATURE_COMPLETION_MATRIX.md** - 根據完成情況更新

### 按需更新

- 實施文檔 - 當實現新功能時更新
- 架構文檔 - 當設計變更時更新
- FAQ - 當出現新的常見問題時更新

### 歷史保留

- 所有完成的項目都移到 `archive/`
- 過時的文檔移到 `deprecated/`
- 保留完整的歷史記錄供參考

---

## 🎯 文檔優先級

| 優先級 | 檔案 | 更新頻率 |
|--------|------|---------|
| ⭐⭐⭐ | progress.md | 每天 |
| ⭐⭐⭐ | FEATURE_COMPLETION_MATRIX.md | 按需 |
| ⭐⭐ | 黑客松實施文檔 | 按需 |
| ⭐⭐ | 架構文檔 | 按需 |
| ⭐ | 存檔文檔 | 不更新 |

---

## 🔗 相關連結

- 🌐 [Live Demo](https://archimeters.vercel.app/)
- 📦 [GitHub Repository](https://github.com/231-Labs/archimeters)
- 🔍 [Sui Explorer (Testnet)](https://suiexplorer.com/?network=testnet)
- 📋 [Hackathon Rules](https://suifoundation.notion.site/Walrus-Haulout-Hackathon-Event-Rules-29437af41c6e808a8acbc35f7a7df86a)

---

## ❓ 無法找到你要的文檔?

1. 使用頁面頂部的搜索功能
2. 查看 [存檔索引](./archive/README.md)
3. 查看 [文件結構](#文件結構) 部分
4. 提交 Issue 到 GitHub

---

**最後更新**: 2025-11-10  
**下次更新**: 每日根據進度更新
