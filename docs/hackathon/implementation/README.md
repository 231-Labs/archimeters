# 🛠️ 黑客松實施文檔

> 具體的實現計劃和技術指南

## 📋 實施文檔清單

### 1. [Seal SDK 實施計劃](./SEAL_IMPLEMENTATION_PLAN.md) 🔐

完整的 Seal 加密集成指南，包括：

- **合約層設計** - seal_approve_printer 函數實現
- **前端加密** - STL 文件加密流程
- **Key Server 配置** - Testnet 和 Mainnet 設置
- **解密工作流程** - Seal Rust SDK 解密步驟
- **常見問題** - 故障排除和 FAQ

**適用於**: 
- Seal 加密功能實施
- 調試加密相關問題
- 理解整個工作流程

---

### 2. [Publisher Retro UI 重設計](./PUBLISHER_RETRO_UI_REDESIGN.md) 🎨

Publisher 窗口 UI 的完整重設計指南，包括：

- **設計方案** - 從多頁面改為單頁面
- **組件系統** - Retro OS 風格組件
- **佈局設計** - 左右兩欄設計
- **實施步驟** - 分階段實施 (Phase 1-4)
- **驗證清單** - 功能和 UI/UX 測試

**適用於**:
- Publisher UI 優化
- 新增 Retro 組件
- 理解設計系統

---

### 3. [Pavilion 接入指南](./PAVILION_IFRAME_INTEGRATION.md) 🌐

Pavilion iframe 整合的完整技術方案，包括：

- **系統概述** - Pavilion 的作用和架構
- **iframe 通信** - postMessage 實現
- **URL 參數** - embedded 模式設置
- **Archimeters 側** - 具體實施步驟
- **Pavilion 源碼** - 可選的修改方案
- **故障排除** - CORS 和通信問題

**適用於**:
- Pavilion 接入優化
- iframe 通信調試
- 理解嵌入式集成

---

### 4. [窗口系統重構](./WINDOW_SYSTEM_REFACTOR.md) 🪟

窗口管理系統的設計和優化指南，包括：

- **狀態管理** - 窗口位置、大小、焦點
- **Z-index 邏輯** - 窗口堆疊管理
- **拖動行為** - 平滑的拖動交互
- **焦點管理** - 點擊激活窗口
- **代碼重構** - 優化和簡化
- **性能優化** - 減少重新渲染

**適用於**:
- 窗口行為優化
- 窗口系統重構
- 性能調優

---

## 🎯 按任務查找

### 「我需要實施 Seal 加密」
→ [Seal SDK 實施計劃](./SEAL_IMPLEMENTATION_PLAN.md)

### 「我需要優化 Publisher UI」
→ [Publisher Retro UI 重設計](./PUBLISHER_RETRO_UI_REDESIGN.md)

### 「我需要修復 Pavilion 接入」
→ [Pavilion 接入指南](./PAVILION_IFRAME_INTEGRATION.md)

### 「我需要優化窗口系統」
→ [窗口系統重構](./WINDOW_SYSTEM_REFACTOR.md)

---

## 📊 文檔統計

| 文檔 | 行數 | 複雜度 | 預計閱讀時間 |
|------|------|--------|------------|
| Seal 實施計劃 | 433 | ⭐⭐⭐⭐ | 30 分鐘 |
| Publisher UI 重設計 | 800+ | ⭐⭐⭐ | 30 分鐘 |
| Pavilion 接入指南 | - | ⭐⭐ | 20 分鐘 |
| 窗口系統重構 | - | ⭐⭐ | 20 分鐘 |

---

## 🔗 相關文檔

- 📖 [進度追蹤](../progress.md) - 實時進度表
- 📊 [功能完成度](../status/FEATURE_COMPLETION_MATRIX.md) - 功能對照
- 📅 [Day 3 任務](../tasks/DAY3_TASKS.md) - 具體任務步驟

---

## 💡 使用建議

### 開始實施時

1. **閱讀概述** - 先讀對應文檔的開頭
2. **理解設計** - 了解整體方案
3. **按步驟實施** - 逐步跟著步驟做
4. **參考代碼示例** - 看文檔中的具體代碼
5. **驗證功能** - 檢查清單測試

### 遇到問題時

1. **查看故障排除** - 大多數文檔都有 Q&A 部分
2. **檢查常見錯誤** - 看是否有相同的問題
3. **查看相關日誌** - 在 [Day 1-5 日誌](../status/DAILY_LOGS_ARCHIVE.md) 找答案

---

**Last Updated**: 2025-11-10  
**Maintenance**: 按需更新

