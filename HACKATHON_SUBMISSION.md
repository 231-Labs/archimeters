# Archimeters - Changelog for Walrus Haulout Hackathon

## 📋 項目概述

Archimeters 是一個基於 Sui 區塊鏈的參數化 3D 設計平台與交易市場。創作者可上傳自定義 `three.js` 3D 演算法，用戶透過參數調整生成個人化設計並 Mint 為 NFT。本次黑客松新增對抽象 3D（不可列印物件）的支持，並實現完整的數據交易與加密保護機制。

### 商業模式

**可重複銷售的設計演算法**：創作者上傳參數化設計演算法（Atelier）後，每次有用戶使用該演算法 Mint Sculpt 時都能獲得收益，實現「一個演算法，多次收益」的可持續商業模式。

**用戶參與創作過程**：用戶透過調整參數主動參與創作，即時預覽效果後再 Mint，實現「共創」而非「被動購買」的體驗。

---

## 📋 改動摘要

本次黑客松實現了：

1. ✅ **Kiosk 標準交易機制**：Sculpt NFT 二級市場，支持版稅自動分配
2. ✅ **Seal 分層加密**：GLB 免費預覽 + STL 加密保護，平衡用戶體驗與 IP 保護
3. ✅ **合約增強**：泛型化類型安全 + 參數範圍驗證，確保設計完整性和安全性
4. ✅ **UI/UX 優化**：簡化 Publisher、重構 Marketplace、完善 Vault 功能

---

## 🎯 本次黑客松期間核心修改（詳細說明）

### 1. Kiosk 標準交易機制 ⭐

**實現內容：**
- 完整整合 Sui Kiosk 協議，實現 Sculpt NFT 的二級市場交易
- 支持上架、購買、取消上架等完整交易流程
- 自動版稅分配（原創者版稅 + 平台手續費）

**未來規劃：**
- 計劃實現 AtelierCap 交易機制，讓 3D 演算法本身也能被交易

---

### 2. Seal 加密機制 🔐

**分層加密策略：**
- **GLB 文件**：未加密存儲於 Walrus，供用戶免費預覽
- **STL 文件**：Seal 加密後存儲，保護商業價值

**解密工作流程：**
1. Sculpt Owner 發布 Printjob 給授權的 Printer
2. Printer 調用 `seal_approve_printer`，Move 合約驗證 Printjob 所有權
3. 通過 Seal Key Servers 獲取解密密鑰
4. 在製造端解密 STL 文件（Demo 中改為下載解密文件以演示）

**創新點：**
- **分層訪問控制**：免費預覽 + 付費收藏，平衡用戶體驗與 IP 保護
- **鏈上授權驗證**：通過 Sui Move 智能合約實現去中心化訪問控制

---

### 3. 合約增強與安全機制 🔒

**泛型化與類型安全：**
- Atelier 和 Sculpt 合約全面泛型化：`Atelier<phantom T>` 和 `Sculpt<phantom ATELIER>`
- 編譯時類型檢查，確保每個 Sculpt 必須對應到正確的 Atelier
- 防止在交易、版稅分配等操作中出現類型不匹配

**參數範圍驗證：**
- 在 `mint_sculpt` 時鏈上驗證所有參數值是否在設計範圍內
- 使用 `ParameterRules` 存儲參數規則（min_value, max_value, default_value）
- 任何參數超出範圍會 abort 交易，防止生成超出設計範圍的 Sculpt

**技術優勢：**
- **類型安全**：編譯時驗證，無法將不同 Atelier 的 Sculpt 混用
- **設計完整性**：確保所有 Mint 的 Sculpt 都在創作者的設計範圍內
- **鏈上保證**：所有驗證在智能合約層執行，無法繞過

---

### 4. UI/UX 優化 🎨

- **Vault 詳情頁**：Atelier/Sculpt 詳情、一鍵 Withdraw、列印派單
- **Publisher 簡化**：多步驟改為單頁式，自動識別可列印物件
- **Marketplace 重構**：雙 Tab 設計（Browse Ateliers / Sculpt Market）、List/Grid 視圖切換
