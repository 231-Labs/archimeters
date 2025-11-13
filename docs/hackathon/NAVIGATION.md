# 🎯 黑客松文檔導航

> Walrus Haulout Hackathon (2025-11-06 ~ 11-16) 的完整文檔索引  
> **當前進度**: Day 6 | **完成度**: 80%+ | **狀態**: 🚧 進行中

---

## ⭐ 必讀文檔

### 1. **[進度追蹤 (progress.md)](./progress.md)** - 每日實時更新

**這是最重要的檔案**，包含：
- 📊 整體進度表（按優先級排列）
- 🎯 今日任務和優先級計劃
- 🚀 最近 5 天完成的工作摘要
- 📞 快速參考（合約地址、部署統計、測試統計）
- ⏰ 日程安排和里程碑

**何時查看**: 每天開始前查看，了解當前優先級

---

### 2. **[功能完成度矩陣 (status/FEATURE_COMPLETION_MATRIX.md)](./status/FEATURE_COMPLETION_MATRIX.md)**

對照原始需求規格，詳細列出：
- ✅ 已完成的功能
- 🔄 需要返工的功能
- ⏳ 未開始的功能
- 📊 按優先級分類統計
- 🎯 優先級建議和執行計劃

**何時查看**: 需要了解功能完成度或評估優先級時

---

### 3. **[Day 1-5 詳細日誌 (status/DAILY_LOGS_ARCHIVE.md)](./status/DAILY_LOGS_ARCHIVE.md)**

每一天的詳細記錄，包括：
- ✅ 完成的事項（含代碼行數、測試統計等）
- 🔧 遇到的問題和解決方案
- 🎯 技術亮點和創新點
- 📈 進度統計和 Gas 消耗

**何時查看**: 需要回顧過去的進度或了解技術細節時

---

## 🛠️ 實施文檔

具體的實現計劃和技術指南：

### [Seal SDK 實施計劃](./implementation/SEAL_IMPLEMENTATION_PLAN.md) 🔐

**内容**: Seal 加密集成的完整實施細節
- Seal SDK 概述和文檔
- 合約層實現 (seal_approve_printer)
- 前端加密流程
- 解密工作流程
- Key Server 配置
- 常見問題和故障排除

**何時使用**: 
- 實施 Seal 加密功能時
- 調試 Seal 相關問題時

---

### [Publisher Retro UI 重設計](./implementation/PUBLISHER_RETRO_UI_REDESIGN.md) 🎨

**内容**: Publisher 窗口 UI 重設計的完整指南
- 單頁面設計方案 (vs 多頁面)
- Retro OS 風格組件列表
- 檔案上傳和參數配置
- 實施步驟和代碼示例
- 驗證和測試清單

**何時使用**:
- 優化 Publisher UI 時
- 添加新的 Retro 組件時

---

### [Pavilion 接入指南](./implementation/PAVILION_IFRAME_INTEGRATION.md) 🌐

**内容**: Pavilion 整合方案的技術細節
- Pavilion 系統概述
- iframe 通信機制 (postMessage)
- URL 參數設置 (embedded, kioskId)
- Archimeters 側的實施步驟
- Pavilion 源碼修改（可選）
- 故障排除和調試

**何時使用**:
- 優化 Pavilion 接入時
- 實施 iframe 通信時

---

### [窗口系統重構](./implementation/WINDOW_SYSTEM_REFACTOR.md) 🪟

**内容**: 窗口管理系統的設計和實現
- 窗口狀態管理
- Z-index 堆疊邏輯
- 拖動行為和焦點管理
- 代碼重構建議
- 性能優化

**何時使用**:
- 修復窗口行為問題時
- 優化窗口渲染性能時

---

### [Day 3 具體任務](./tasks/DAY3_TASKS.md) 📋

**内容**: Day 3 的詳細實施步驟
- Marketplace 重構 (階段 1-4)
- Publisher Retro UI 重設計 (詳細步驟)
- Mint 流程優化和 Dry Run
- 技術研究清單
- 檢查清單

**何時使用**:
- Day 3 的任務已完成，主要供回顧
- 需要重複某個步驟時

---

## 📊 進度統計

### 按優先級

| 優先級 | 完成度 | 模組數 | 狀態 |
|--------|--------|--------|------|
| **P0** | 80% | 8 個 | 🚧 進行中 (Seal 解密待完成) |
| **P1** | 70% | 3 個 | 🔄 需要返工 (Pavilion) |
| **P2** | 50% | 4 個 | ⏳ 未開始 |

### 按模組

| 模組 | 完成度 | 優先級 | 備註 |
|------|--------|--------|------|
| Seal 加密 | 100% | P0 | ✅ 完成 |
| Seal 解密 | 0% | P0 | 🚧 今天進行 |
| Atelier 市場 | 50% | P0 | 🔄 今天返工 |
| Sculpt 市場 | 100% | P0 | ✅ 完成 |
| Vault 詳情 | 90% | P1 | ✅ 基本完成 |
| Marketplace | 85% | P1 | 🔄 需優化 |
| Pavilion | 30% | P1 | 🔄 需優化 |

---

## 🎯 查找指南

### 按任務查找

**「我需要實施 Seal 加密」**
→ [Seal SDK 實施計劃](./implementation/SEAL_IMPLEMENTATION_PLAN.md)

**「我需要修復 Pavilion 接入」**
→ [Pavilion 接入指南](./implementation/PAVILION_IFRAME_INTEGRATION.md)

**「我需要優化 Publisher UI」**
→ [Publisher Retro UI 重設計](./implementation/PUBLISHER_RETRO_UI_REDESIGN.md)

**「我需要了解今日優先級」**
→ [進度追蹤](./progress.md) 中的「🎯 優先級執行計劃」

**「我需要查看功能完成度」**
→ [功能完成度矩陣](./status/FEATURE_COMPLETION_MATRIX.md)

**「我需要了解過去做了什麼」**
→ [Day 1-5 詳細日誌](./status/DAILY_LOGS_ARCHIVE.md)

---

## 📅 日程安排

```
Day 6 (今天 2025-11-10)
├── 🚧 Seal 解密流程驗證 (3-4h) ← 進行中
└── 🔄 Atelier 二級市場返工 (2-3h) ← 準備開始

Day 7 (明天 2025-11-11)
├── Pavilion 接入優化 (2-3h)
└── Marketplace Trending (1-2h)

Day 8 (2025-11-12)
├── 系統測試和 Bug 修復
└── UI Polish

Day 9 (2025-11-13)
├── Demo 準備
└── 最後檢查

Day 10 (2025-11-14~16)
└── 黑客松提交
```

---

## 🔗 快速連結

| 檔案 | 用途 | 更新頻率 |
|------|------|---------|
| [progress.md](./progress.md) | **進度表** ⭐ | 每天 |
| [FEATURE_COMPLETION_MATRIX.md](./status/FEATURE_COMPLETION_MATRIX.md) | 功能對照 | 按需 |
| [DAILY_LOGS_ARCHIVE.md](./status/DAILY_LOGS_ARCHIVE.md) | 歷史日誌 | 不更新 |
| [SEAL_IMPLEMENTATION_PLAN.md](./implementation/SEAL_IMPLEMENTATION_PLAN.md) | Seal 技術 | 按需 |
| [PUBLISHER_RETRO_UI_REDESIGN.md](./implementation/PUBLISHER_RETRO_UI_REDESIGN.md) | Publisher UI | 按需 |
| [PAVILION_IFRAME_INTEGRATION.md](./implementation/PAVILION_IFRAME_INTEGRATION.md) | Pavilion 技術 | 按需 |
| [WINDOW_SYSTEM_REFACTOR.md](./implementation/WINDOW_SYSTEM_REFACTOR.md) | 窗口系統 | 按需 |
| [DAY3_TASKS.md](./tasks/DAY3_TASKS.md) | Day 3 任務 | 不更新 |

---

## 💡 使用建議

### 開始一天的工作

1. 📖 先讀 [progress.md](./progress.md) 的「🎯 優先級執行計劃」
2. 💼 了解今天的任務和時間分配
3. 🛠️ 根據需要查看對應的實施文檔

### 實施新功能

1. 🔍 查找 [功能完成度矩陣](./status/FEATURE_COMPLETION_MATRIX.md) 了解需求
2. 📚 查看對應的實施文檔 (在 `implementation/`)
3. ✅ 完成後更新 [progress.md](./progress.md)

### 遇到問題

1. 🔧 查看對應實施文檔的「故障排除」部分
2. 📖 查看 [Day 1-5 日誌](./status/DAILY_LOGS_ARCHIVE.md) 看是否有類似的問題解決方案
3. 💬 查看 [FAQ](../quickstart/FAQ.md)

---

**Last Updated**: 2025-11-10  
**Next Update**: 每日根據進度更新

🚀 **準備好了嗎？** 從 [progress.md](./progress.md) 開始！

