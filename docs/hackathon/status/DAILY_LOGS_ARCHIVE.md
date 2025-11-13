# 黑客松每日詳細日誌 - 存檔

> 此檔案保存 Day 1-5 的詳細日誌，供歷史參考  
> 最新進度請查看 [progress.md](./progress.md)

## 目錄

- [Day 1 - 2025-11-06](#day-1--2025-11-06-wed) (Wed)
- [Day 2 - 2025-11-07](#day-2--2025-11-07-thu) (Thu)
- [Day 3 - 2025-11-08](#day-3--2025-11-08-fri) (Fri)
- [Day 4 - 2025-11-09](#day-4--2025-11-09-sat) (Sat)
- [Day 5 - 2025-11-10](#day-5--2025-11-10-sun) (Sun)

---

## Day 1 - 2025-11-06 (Wed)

### 完成事項

**合約開發**
- ✅ Seal 授權機制（sculpt.move）- printer_whitelist
- ✅ Atelier 池子轉移（atelier.move）- withdraw_pool_on_sale
- ✅ Atelier Marketplace 增強 - purchase_atelier_with_pool

**前端核心功能**
- ✅ Seal SDK 整合架構（utils/seal.ts）
- ✅ 格式化工具（utils/formatters.ts）
- ✅ Sculpt 二級市場 Hook（useSculptMarketplace.ts）
- ✅ Atelier 二級市場 Hook（useAtelierMarketplace.ts）
- ✅ Withdraw All 功能（useWithdrawAll.ts）- PTB 批量提取

**Vault 詳情頁面**
- ✅ Atelier 詳情 Modal - 顯示統計、Withdraw、List 功能
- ✅ Sculpt 詳情 Modal - 3D 預覽準備、Print、List 功能
- ✅ 移除 hover 交互，改為點擊打開詳情

**Pavilion 整合**
- ✅ Pavilion 窗口組件（PavilionWindow.tsx）
- ✅ Pavilion 配置（pavilion.ts）
- ✅ Dock Icon 和路由整合
- ✅ 更新域名為 pavilion-231.vercel.app

**UI/UX 優化**
- ✅ 簡化 Entry 註冊流程提示語
- ✅ 修復 Vault 餘額 < 1 SUI 顯示問題
- ✅ 代碼清理

### 遇到的問題

- ⚠️ TypeScript 類型衝突：`@mysten/sui` 和 `@mysten/dapp-kit` 的 Transaction 類型
  - ✅ 解決：使用 `as any` 類型斷言
- ⚠️ npm 安裝權限問題
  - ✅ 解決：使用 `--legacy-peer-deps` 標誌

---

## Day 2 - 2025-11-07 (Thu)

### 完成事項

**文件夾重構**
- ✅ 移動 marketplace/hooks 到 vault/hooks
- ✅ 刪除 features/marketplace 文件夾
- ✅ 更新所有 import 路徑

**合約測試**
- ✅ 21 個測試全部通過
- ✅ 測試 Seal 授權、Pool 轉移、Marketplace 購買

**合約部署 (Phase 2.5)**
- ✅ 首次部署: 0x8b6bd5537cf68ba37e05cadeef6dbd9ef7939c0747f03f8ed4e402263dec8d94
- ✅ 修復後重新部署: 0xb1c35c962187b1b2eebe934b69300fba986efb187297b2abfaff7f1711275dd3
- ✅ Gas 消耗: 301.59 SUI (兩次部署)

**Bug 修復：參數驗證**
- ✅ 新增合約錯誤碼：ENO_EMPTY_PARAMETERS
- ✅ 修正前端參數讀取
- ✅ 4 個參數驗證測試全部通過
- ✅ 修復參數輸入框 bug

### 遇到的問題

- ⚠️ 傳送超出範圍的參數仍可成功 mint
  - ✅ 根本原因：前端沒有讀取參數
  - ✅ 解決：修改讀取順序和添加驗證

---

## Day 3 - 2025-11-08 (Fri)

### 完成事項

**Marketplace 重構（階段 1-3）**
- ✅ 重命名文件與 Hook
- ✅ 安裝並配置 Kiosk SDK
- ✅ 使用 ItemListed 事件索引已上架的 Sculpts
- ✅ 集成 RetroTabs 和復古 UI
- ✅ 實現 Grid / List 視圖切換

**Publisher Retro UI 重設計**
- ✅ 創建 PublisherMintLayout.tsx（535 行）
- ✅ 標題輸入移至 Sticky Header
- ✅ 優化 Cover Image 和 Description 高度
- ✅ 添加 UploadStatusPage 組件
- ✅ 創建 RetroProgressStep.tsx 進度步驟組件
- ✅ 重新設計 RetroConsole.tsx
- ✅ 添加成功訊息導航按鈕

**代碼清理**
- ✅ 刪除 2196 行已廢棄代碼
- ✅ 移除分頁導航邏輯
- ✅ 所有功能保留，代碼庫更簡潔

**UI/UX 精修**
- ✅ 14 項 UI/UX 改進完成
- ✅ 添加 RetroEmptyState、RetroListItem、RetroPrinterCard 組件
- ✅ 修復窗口 z-index 堆疊問題
- ✅ 重構窗口系統代碼
- ✅ 修復窗口頭部拖動行為
- ✅ 修復 Vault Kiosk 信息查詢
- ✅ 修復 3D 模型加載錯誤

**Atelier Viewer Retro UI 重構**
- ✅ 創建 RetroCard、RetroHeading、RetroPreview 組件
- ✅ BaseTemplate 重構
- ✅ DefaultTemplate 重構
- ✅ 實現模態框模式（AtelierMintModal）
- ✅ 代碼重構優化（減少 30%）

### 技術亮點

- 參數布局 2 列優化
- Atelier Viewer 完全 Retro OS 風格化
- 模態框 Modal 模式集成
- 復古票據樣式 Mint 狀態通知

---

## Day 4 - 2025-11-09 (Sat)

### 完成事項

**Seal 整合 - Phase 1: 合約層**
- ✅ Sculpt 結構修改
  - 新增 `glb_file: String` 字段
  - 修改 `structure: Option<String>` 為可選
  - 新增 `printer_whitelist: VecSet<address>`
- ✅ 實現 `seal_approve_printer` 函數
- ✅ 編譯測試通過

**Seal 整合 - Phase 1B: 合約測試**
- ✅ 創建 seal_unit_tests.move
- ✅ 5 個新的 Seal 測試
- ✅ **24/24 測試全部通過** ✅

**合約架構重構**
- ✅ 創建 printer.move 模組
- ✅ 定義 Printer NFT 結構
- ✅ 修改白名單機制使用 Printer ID
- ✅ **30/30 測試全部通過** ✅

**合約代碼優化**
- ✅ 創建 atelier_validation.move 模組
- ✅ 提取驗證邏輯
- ✅ 減少代碼重複

**合約模組化重構**
- ✅ 資料夾結構優化（sources/ 下創建子資料夾）
- ✅ atelier/, sculpt/, rules/, test_utils/ 組織
- ✅ **30/30 測試全部通過** ✅

**Seal 前端整合 Phase 2A**
- ✅ 配置 Seal Testnet Key Servers
- ✅ 重設計 UI Toggle (StlToggle)
- ✅ 重構 Mint 流程
  - Step 2: 始終導出 GLB
  - Step 3: 上傳 GLB 到 Walrus
  - Step 4: 根據 toggle 生成 STL 並加密

**Seal 前端整合 Phase 2B**
- ✅ 更新 mintSculpt 交易函數
  - 新增 glbFile 參數（必選）
  - 新增 structure 參數（可選 STL）
  - 實現 Option<String> 序列化

**合約重新部署**
- ✅ 新合約部署成功
- ✅ 更新所有合約 ID
- ✅ Gas 消耗：159.8 SUI

**前端參數傳遞修復**
- ✅ 問題診斷：參數未正確傳遞
- ✅ 根本原因：useSculptMint 未接收已解析的參數
- ✅ 修復方案：傳遞 previewParams

**Vault 3D 模型顯示修復**
- ✅ 使用 glb_file 字段代替 structure
- ✅ 處理 Option<String> 字段格式

**Seal SDK 兼容性修復**
- ✅ 問題：Cannot read properties of undefined (reading 'getObject')
- ✅ 根本原因：Seal SDK 使用舊版 API
- ✅ 解決：在 getSealClient 內部創建獨立 SuiClient

**Seal SDK PackageId 修復**
- ✅ 問題：InvalidPackageError
- ✅ 根本原因：使用 atelierId 而非 PACKAGE_ID
- ✅ 解決：使用合約 PACKAGE_ID

**E2E 測試：Seal 加密驗證成功**
- ✅ Mint 成功
- ✅ GLB 上傳成功
- ✅ STL 加密成功
- ✅ 加密文件驗證通過
  - 無 STL 關鍵字
  - 檔頭包含 Package ID
  - 加密開銷 0.47%

### 技術亮點

- Identity-Based Encryption (IBE) - BLS12-381
- AES-GCM-256 對稱加密
- Seal 加密整個工作流程完成
- 優雅的 fallback 機制

---

## Day 5 - 2025-11-10 (Sun)

### 完成事項

**Seal 整合 Phase 1: 合約層完成**
- ✅ 創建實施計劃文檔
- ✅ 修改 Sculpt 結構
  - 新增 glb_file: String
  - 修改 structure: Option<String>
  - 修改 printer_whitelist: VecSet<address>
- ✅ 實現 seal_approve_printer 函數
- ✅ 編譯測試通過

### 進行中

- Seal 整合 Phase 2: 前端實現

---

## 關鍵統計

| 指標 | 數值 |
|------|------|
| 總測試數 | 30 個 |
| 測試通過率 | 100% |
| 合約部署次數 | 3 次 |
| 總 Gas 消耗 | 611.37 SUI |
| 新增組件數 | 8 個 |
| 代碼優化減少率 | 30% |
| UI 精修完成度 | 18 項 |

---

## 下一步方向

見 [progress.md](./progress.md) 的「未完成任務」部分

