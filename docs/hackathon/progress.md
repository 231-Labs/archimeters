# Walrus Haulout Hackathon 進度追蹤

> 更新日期: 2025-11-06  
> 黑客松期間: 2025-11-06 ~ 2025-11-16 (共 10 天)

---

## 📊 整體進度

| 優先級 | 模組 | 狀態 | 完成度 |
|--------|------|------|--------|
| P0 | Seal SDK 整合 | ✅ 已完成 | 100% |
| P0 | Sculpt 二級市場 | ✅ 已完成 | 100% |
| P0 | Atelier 二級市場 | ✅ 已完成 | 100% |
| P1 | Vault - Atelier 詳情頁 | ✅ 已完成 | 100% |
| P1 | Vault - Sculpt 詳情頁 | ✅ 已完成 | 100% |
| P1 | Marketplace 重構 | ⏳ 未開始 | 0% |
| P1 | Pavilion 接入 | ✅ 已完成 | 100% |
| P2 | 其他優化 | ✅ 已完成 | 100% |

**圖例**: ✅ 已完成 | 🚧 進行中 | ⏳ 未開始 | ⚠️ 遇到問題 | 🔄 需要返工

---

## 📅 每日進度記錄

### Day 1 - 2025-11-06 (Wed)

#### 完成事項
- [x] 建立專案文檔結構
- [x] 完成實施計劃文檔
- [x] **合約開發**
  - [x] Seal 授權機制（sculpt.move）- printer_whitelist, add_printer_to_whitelist
  - [x] Atelier 池子轉移（atelier.move）- withdraw_pool_on_sale
  - [x] Atelier Marketplace 增強（atelier_marketplace.move）- purchase_atelier_with_pool
- [x] **前端核心功能**
  - [x] Seal SDK 整合架構（utils/seal.ts）- 加密檔案上傳
  - [x] 格式化工具（utils/formatters.ts）- SUI 金額、地址格式化
  - [x] Sculpt 二級市場 Hook（useSculptMarketplace.ts）
  - [x] Atelier 二級市場 Hook（useAtelierMarketplace.ts）
  - [x] Withdraw All 功能（useWithdrawAll.ts）- PTB 批量提取
- [x] **Vault 詳情頁面**
  - [x] Atelier 詳情 Modal - 顯示統計、Withdraw、List 功能
  - [x] Sculpt 詳情 Modal - 3D 預覽準備、Print、List 功能
  - [x] 移除 hover 交互，改為點擊打開詳情
- [x] **Pavilion 整合**
  - [x] Pavilion 窗口組件（PavilionWindow.tsx）
  - [x] Pavilion 配置（pavilion.ts）
  - [x] Dock Icon 和路由整合
  - [x] 更新域名為 pavilion-231.vercel.app
- [x] **UI/UX 優化**
  - [x] 簡化 Entry 註冊流程提示語
  - [x] 修復 Vault 餘額 < 1 SUI 顯示問題
  - [x] 代碼清理 - 移除未使用的導入和 props

#### 進行中
- 無

#### 遇到的問題
- TypeScript 類型衝突：`@mysten/sui` 和 `@mysten/dapp-kit` 的 Transaction 類型不匹配
  - **解決方案**: 使用 `as any` 類型斷言暫時繞過
- npm 安裝權限問題
  - **解決方案**: 使用 `--legacy-peer-deps` 標誌

#### 明日計劃
- [Ｘ] Gallery List/Gallery 模式切換
- [ ] Gallery Trending 排序功能
- [Ｘ] 合約測試與部署到 testnet 

---

### Day 2 - 2025-11-07 (Thu)

#### 完成事項
- [x] **文件夾重構**
  - [x] 移動 marketplace/hooks/useAtelierMarketplace.ts 到 vault/hooks/
  - [x] 刪除 features/marketplace/ 文件夾
  - [x] 更新 import 路徑
- [x] **合約測試**
  - [x] 運行所有 21 個測試 - 全部通過 ✅
  - [x] 測試 Seal 授權功能 (printer_whitelist)
  - [x] 測試 Pool 轉移功能 (withdraw_pool_on_sale)
  - [x] 測試 Marketplace 購買功能 (purchase_atelier_with_pool)
- [x] **合約部署 (Phase 2.5)**
  - [x] 首次部署: 0x8b6bd5537cf68ba37e05cadeef6dbd9ef7939c0747f03f8ed4e402263dec8d94
  - [x] 修復後重新部署: 0xb1c35c962187b1b2eebe934b69300fba986efb187297b2abfaff7f1711275dd3
  - [x] 更新 frontend/utils/transactions.ts 中所有合約地址
  - [x] Gas 消耗: 150.42 SUI + 151.17 SUI = 301.59 SUI (兩次部署)
- [x] **Bug 修復：參數驗證**
  - [x] 新增合約錯誤碼：ENO_EMPTY_PARAMETERS
  - [x] 新增合約檢查：不允許空參數數組
  - [x] 修正前端：從 configData.parameters 讀取參數
  - [x] 新增 4 個參數驗證測試 - 全部通過 ✅
  - [x] 修復參數輸入框 bug：
    - [x] 添加 min/max 屬性限制輸入範圍
    - [x] 添加自動 clamp 邏輯防止超出範圍
    - [x] 修復第一位數無法刪除的問題
    - [x] 修復小數點輸入問題（允許輸入 0.、0.5 等中間狀態）

#### 進行中
- [X] E2E 測試準備中

#### 遇到的問題
- ✅ **已解決**: 傳送超出範圍的參數仍可成功 mint
  - **根本原因**: 前端沒有讀取參數！空數組導致合約無參數驗證
  - **調查過程**: 
    - 合約測試確認驗證邏輯正確 ✅
    - 檢查 transaction 參數發現 `param_keys=[]`, `param_values=[]`
    - 發現 `useSculptMint` 讀取錯誤字段：`metadata` 而非 `configData`
  - **修復方案**: 
    - 修改讀取順序：`configData.parameters` → `metadata.parameters`
    - 添加警告日誌提示參數為空
    - 添加調試日誌輸出參數信息
  - **測試建議**: 重新測試 mint 功能，檢查 console 確認參數正確傳遞

#### UI/UX 改進計劃 🎨
- [x] **Iframe 功能改進** ✅（Archimeters 側完成，Pavilion 側暫時擱置）
  - [x] 添加 URL Copy 按鈕 + tooltip（Archimeters 側）
  - [x] 添加返回按鈕（記住導航歷史）
  - [x] 移除 Chrome dots 裝飾
  - [x] 添加 `embedded=true` URL 參數
  - [⏸] **Pavilion 源碼修改（暫時擱置）**:
    - Share Pavilion 按鈕 tooltip 在 iframe 中顯示
    - 讀取 `embedded` 參數並隱藏 Back to Home 按鈕
    - 實現 postMessage 錢包通信機制
    - 📄 詳見 `docs/hackathon/PAVILION_IFRAME_INTEGRATION.md`
  
- [x] **Vault 側邊欄優化** ✅
  - [x] 修復側邊欄遮擋窗口 Header 的問題（從 fixed 改為 absolute 定位）
  - [x] 重新設計符合暗色系宇宙復古 web 風格的展開方式
    - 蓋滿整個窗口內容區域（從 header 下方到底部）
    - 使用 `absolute inset-0` 定位
    - 暗色背景 (#0a0a0a, #1a1a1a)
    - 3D 邊框效果（左邊框 #2a2a2a）
    - 小型復古風格標題欄（大寫字母 + Mono 字體）
    - 半透明背景遮罩 + 模糊效果
  - [x] Atelier/Sculpt tab 中的 item 區塊用 div 包裹限制區塊
  
- [x] **Vault 功能完善** ✅
  - [x] 實作 My Sculpt > item > Show 3D 功能
    - 創建 GLBViewer 組件（基於原生 Three.js）
    - 支持從 Walrus 加載 GLB 模型
    - 添加 OrbitControls 旋轉控制
    - 自動縮放和居中模型
    - 在 SculptDetailModal 中切換 2D/3D 視圖
  - [x] 實作 My Ateliers / My Sculpts 的 List 模式
    - 添加 Grid/List 視圖切換按鈕
    - 實現緊湊的列表佈局（縮略圖 + 信息）
    - 兩個 tab 都支持視圖切換
    - Retro OS 風格設計（深色背景 + Mono 字體）
  
- [x] **按鈕樣式統一** ✅
  - [x] 創建可復用的復古按鈕組件（RetroButton）
  - [x] 統一 Withdraw All 和 Select Printer 按鈕樣式
  - [x] 應用到 AtelierWithdrawButton 和 SculptPrintButton
  
- [x] **Vault 切換 UI 重設計** ✅
  - [x] 創建復古 OS 風格的 Tab 組件（RetroTabs）
  - [x] 應用到 My Ateliers / My Sculpts 切換
  - [x] 實現按壓效果和 3D 立體感
  
- [x] **復古 UI 組件系統** ✅
  - [x] 創建 RetroPanel 組件（可復用的內凹/外凸面板）
  - [x] 創建 RetroButton 組件（3D 按鈕效果）
  - [x] 創建 RetroTabs 組件（復古 Tab 切換）
  - [x] 創建 RetroInput 組件（內凹輸入框，支持 focus 效果）
  - [x] 重新設計 SculptDetailModal 和 AtelierDetailModal
    - **兩欄式佈局**：左側預覽圖，右側資訊/操作
    - **Header 優化**：使用 RetroPanel outset + 小標籤 + ESC 按鈕
    - 圖片改為 aspect-square（1:1）節省高度
    - 資訊區塊並排（Creator + Created，3 個 Stats）
    - 更小字號（9px/10px）+ 更緊湊間距（p-2, gap-2）
    - 統一使用 Mono 字體 + 大寫標題
    - RetroPanel 內凹效果 + RetroInput/RetroButton
    - 資訊符號 ⓘ + 極簡暗色配色
    - **無滾動設計**：所有內容在一個視窗內可見

#### 明日計劃 - Day 3 (2025-11-08)

> ⚠️ **重要提醒**: 明天開始前請先查看 [`DAY3_TASKS.md`](./DAY3_TASKS.md) 獲取詳細實施步驟！

- [X] **Marketplace 重構** - Gallery → Marketplace 遷移
- [ ] **Publisher 復古 UI 重設計** - 簡化上傳流程 → 詳見 [`PUBLISHER_RETRO_UI_REDESIGN.md`](./PUBLISHER_RETRO_UI_REDESIGN.md)
- [ ] **Mint 流程優化** - Dry run + Seal SDK 加密

---

### Day 3 - 2025-11-08 (Fri)

> 📖 **詳細任務清單請查看**: [`docs/hackathon/DAY3_TASKS.md`](./DAY3_TASKS.md)  
> 包含完整的實施步驟、代碼示例、技術研究清單和檢查清單

#### 完成事項

##### 📦 **Marketplace 重構（階段 1-3）** ✅

**階段 1: 重命名與路由調整**
- [x] 重命名文件：`BrowseWindow.tsx` → `MarketplaceWindow.tsx`
- [x] 重命名 Hook：`useSeriesImages.ts` → `useMarketplaceData.ts`
- [x] 創建新的 marketplace 目錄結構：`features/marketplace/hooks/`
- [x] 更新所有類型定義：`'gallery'` → `'marketplace'`
  - `frontend/types/window.ts`
  - `frontend/types/index.ts`
  - `frontend/config/windows.ts`
  - `frontend/components/layout/Dock.tsx`
  - `frontend/app/page.tsx`
- [x] 更新 Dock 圖標標籤：Gallery → Marketplace

**階段 2: Kiosk SDK 整合（僅索引 Listed Sculpts）**
- [x] 安裝並配置 `@mysten/kiosk` SDK
- [x] 添加 Sculpt 數據結構和接口定義
- [x] 使用 `ItemListed` 事件索引已上架的 Sculpts
- [x] 實現 Sculpt 詳情獲取（從 Kiosk events）
- [x] 添加 GLB 預覽圖加載功能
- [x] 錯誤處理和加載狀態管理
- [x] 修復依賴安裝和構建問題

**階段 3: 復古 UI 統一**
- [x] 集成 `RetroTabs` 實現 Ateliers / Sculpts 切換
- [x] 統一 Grid / List 視圖切換為 SVG 圖標按鈕（與 Vault 一致）
- [x] 使用 `Tabs.Content` 優化 Tab 內容渲染
- [x] 實現 Grid 視圖（Masonry 布局）
- [x] 實現 List 視圖（縮略圖 + 信息 + 箭頭圖標）
- [x] 統一暗色系復古 OS 風格設計
- [x] 修復 List 視圖渲染錯誤
- [x] Header 合併 Tab 導航和視圖切換

**技術細節**:
- 使用 Kiosk SDK 的 `KioskClient` 和 `Network.TESTNET`
- 通過 `queryEvents` 查詢 `0x2::kiosk::ItemListed` 事件
- 過濾 Sculpt 類型並獲取詳細信息
- Ateliers 保持原有的事件索引方式
- Sculpts 僅顯示已上架到 Kiosk 的項目

#### 完成事項 - Day 3 晚上

##### 🎨 **Publisher Retro UI 重設計** ✅

**實施完成**:
- [X] 創建 `PublisherMintLayout.tsx` (535行) - 單頁面合併 Page 1-3
- [X] 標題輸入移至 Sticky Header（取代 RetroHeading）
- [X] Cover Image 和 Description 高度優化（180px固定高度）
- [X] 移除 BASIC INFO 區塊
- [X] 價格輸入移至 PUBLISH ATELIER 區塊（對齊 Mint 頁面樣式）
- [X] 修復類型錯誤：extractedParameters Record → Array 轉換
- [X] 修復遺漏導出：uploadFiles 函數

**UI 特點**:
- 左側：3D 預覽（ParametricViewer）+ Artwork Info（Cover + Description + Artist Statement）
- 右側：File Uploads（Cover + Algorithm）+ Extracted Parameters（只讀顯示）+ Publish
- 完全復用 AtelierMintLayout 的佈局結構和 Retro UI 組件
- Sticky 標題欄含輸入框和藝術家信息
- 價格輸入採用 Mint 頁面相同的內聯樣式（Sui icon + 大字體）

**已完成 - 最終版本**:
- [X] **Header 重設計**：移除 "CREATE NEW ATELIER"，改為簡潔輸入框 + 藝術家信息
- [X] **Parameters 互動式控制**：滑桿 + 即時數值 + Reset 按鈕，對齊 Atelier Detail Modal
- [X] **Membership 資料自動帶入**：修復 useMembership hook，正確提取 username 和 description
- [X] **窗口尺寸優化**：1500x850 默認大小，resizable: false
- [X] **文件上傳渲染修復**：圖片和算法文件上傳後即時渲染

**待測試**:
- [ ] 發布流程（metadata 創建 + 文件上傳 + 合約調用）

#### 進行中
- 無

##### 🎨 **新增任務：Mint UI 重構與優化**

**背景**: 當前 AtelierViewer 在新窗口打開，參數布局過於寬鬆，需要改為模態框模式並優化 UI

**任務拆分**:

1. **參數布局優化** ✅ (1h)
   - [x] 修改 DefaultTemplate 參數區域為 2 列布局（`grid-cols-2`）
   - [x] 減少每個參數卡片的內邊距（`p-3` → `p-2`）
   - [x] 減少參數間距（`gap-3` → `gap-2`, `mb-2` → `mb-1.5`）
   - [x] 優化參數標籤和數值輸入框的間距（`gap-2` → `gap-1.5`）
   - [x] 縮小所有字體大小（text-sm → text-xs, text-[10px] → text-[9px]）
   - [x] 縮小輸入框和按鈕（w-14 → w-12, w-6 → w-5）
   - [x] 優化滑桿尺寸（w-3/h-3 → w-2.5/h-2.5）
   - [x] 測試不同參數數量下的顯示效果

2. **創建 AtelierMintModal 組件** ✅ (1h)
   - [x] 基於 AtelierViewer 創建新的 Modal 組件
   - [x] 重用所有 AtelierViewer 的 hooks（useAtelierParameters, useSceneExport, useWalrusUpload, useSculptMint 等）
   - [x] 使用 `absolute inset-0` 定位覆蓋窗口內容區域
   - [x] 實現模態框打開/關閉邏輯
   - [x] 整合 BaseTemplate 和 DefaultTemplate 保持完整 Mint UI
   - [x] 添加 ✕ CLOSE 按鈕和 ESC 鍵支持
   - [x] 添加 backdrop（背景遮罩）和點擊關閉功能

3. **整合到 Marketplace** ✅ (30min)
   - [x] 在 MarketplaceWindow 中添加 `selectedAtelier` 狀態
   - [x] 修改 `handleImageClick`：設置 selectedAtelier 而非打開新窗口
   - [x] 添加 `handleCloseModal` 關閉邏輯
   - [x] 渲染 AtelierMintModal 並傳遞 atelier 數據
   - [x] 測試 Grid 和 List 模式下的點擊行為

**完成效果**:
- ✅ 參數區域雙列布局，頁面高度減少約 40%
- ✅ 模態框模式提供更好的用戶體驗
- ✅ 保持現有 Mint 功能完整性
- ✅ 與 Vault Detail Modal 行為一致

##### 🔧 **Atelier-Viewer 代碼重構優化** ✅

**背景**: `index.tsx` 和 `AtelierMintModal.tsx` 存在大量重複代碼（~170行），需要重構以提高可維護性

**優化內容**:

1. **創建核心組件 `AtelierMintCore.tsx`** ✅ (160 lines)
   - [x] 提取所有共同的 minting 邏輯和 UI
   - [x] 統一管理所有 hooks（useAtelierParameters, useSceneExport, useWalrusUpload, useSculptMint, etc.）
   - [x] 包含完整的 tooltip 和 mint button 邏輯
   - [x] 可被 window mode 和 modal mode 復用

2. **重構 `index.tsx`** ✅ (182 → 42 lines, 減少 77%)
   - [x] 簡化為數據加載器角色
   - [x] 只負責從 sessionStorage 加載 Atelier 數據
   - [x] 處理 loading/error/empty 狀態
   - [x] 調用 `AtelierMintCore` 核心組件
   - [x] 優化 loading/error 狀態的 Retro 風格顯示

3. **重構 `AtelierMintModal.tsx`** ✅ (211 → 74 lines, 減少 65%)
   - [x] 簡化為模態框包裝器
   - [x] 只負責 Modal 相關邏輯（backdrop, close button, ESC key）
   - [x] 調用 `AtelierMintCore` 核心組件
   - [x] 清晰的職責分離

**優化成果**:
- 📊 總代碼從 393 行減少到 276 行（減少 30%）
- ♻️ 消除 100% 重複代碼（~170 行重複邏輯）
- 🎯 單一職責原則：每個組件職責清晰
- 🔧 易於維護：邏輯修改只需在一處進行
- ✅ E2E 測試通過，所有功能正常

##### 🎨 **Atelier Viewer Retro UI 重構** ✅

**背景**: 將 AtelierViewer 的 UI 從 gradient 風格重構為統一的 Retro OS 風格

**完成內容**:

1. **創建新的 Retro 組件** ✅
   - [x] `RetroCard` / `RetroSection`: 帶 3D 邊框效果的內容卡片，支持 default/inset 變體
   - [x] `RetroHeading`: Retro OS 風格的頁面標題組件，支持 title/subtitle/author
   - [x] `RetroPreview`: 3D/2D 預覽容器，使用 inset 邊框模擬屏幕效果
   - [x] `RetroImage`: Retro 風格的圖片容器

2. **BaseTemplate 重構** ✅
   - [x] 移除 gradient border 和 backdrop blur
   - [x] 整合 `RetroHeading` 組件
   - [x] 更新背景色為 `#0a0a0a`（統一深色背景）
   - [x] 優化布局間距

3. **DefaultTemplate 重構** ✅
   - [x] 左側：使用 `RetroPreview` 替換 gradient border 的 3D 預覽區
   - [x] 左側：使用 `RetroSection` + `RetroImage` 重構 Artwork Info 區域
   - [x] 右側：使用 `RetroSection` 替換 Parameters 區域
   - [x] 右側：整合 `RetroButton` 用於 RESET ALL 按鈕
   - [x] 右側：使用 `RetroSection` 重構 MINT SCULPT 區域
   - [x] 統一所有輸入框樣式為 retro inset 邊框（`borderTop/Left: #0a0a0a, borderBottom/Right: #333`）
   - [x] 添加 mono 字體樣式（`font-mono`）
   - [x] 優化按鈕文字（Reset → RST, Mint Sculpt → MINT SCULPT）
   - [x] 移除所有 gradient text 和 backdrop-blur 效果

**技術細節**:
- 3D 邊框效果：`borderTop/Left: light color, borderBottom/Right: dark color`
- Inset 效果：反轉邊框顏色順序
- Box shadow: 添加內部高光和陰影增強立體感
- 統一色彩：`#0a0a0a`（深黑）、`#1a1a1a`（黑）、`#2a2a2a`（灰）、`#333`（淺灰）

**效果**:
- ✅ UI 風格完全統一為 Retro OS 風格
- ✅ 所有組件可復用，代碼更清晰
- ✅ 視覺一致性大幅提升
- ✅ 無 lint 錯誤

#### 計劃任務

##### 📦 **任務 1: Gallery → Marketplace 重構**

**目標**: 將 Gallery 重新定位為完整的 Marketplace，整合瀏覽、Mint、交易功能

**遷移步驟**:

1. **階段 1: 重命名與路由調整** ✅
   - [x] 重命名文件
     - `GalleryWindow.tsx` → `MarketplaceWindow.tsx`
     - `useGalleryData.ts` → `useMarketplaceData.ts`
   - [x] 更新 Dock 配置
     - Icon label: "Gallery" → "Marketplace"
     - Route path 保持不變或更新
   - [x] 更新所有 import 路徑

2. **階段 2: Sculpt 索引優化** ✅
   - [x] 引入 Kiosk SDK 的 Listed Items API
   - [x] 修改 `useMarketplaceData` hook
     - Ateliers: 索引所有（可選顯示 listed 標記）
     - Sculpts: **僅索引已上架的** (Kiosk SDK)
   - [x] 添加加載狀態和錯誤處理
   - [x] 測試數據正確性

3. **階段 3: UI 統一為復古風格** ✅
   - [x] 復用 Vault 的 Grid/List 切換
   - [x] 使用 RetroTabs 切換 Ateliers / Sculpts
   - [x] 統一使用 RetroPanel 顯示卡片
   - [x] 修復 List 視圖渲染錯誤

4. **階段 4: Atelier Mint Modal 整合** ✅ (2h)
   - [x] 創建 AtelierMintModal 組件（模態框模式，不開新窗口）
   - [x] 優化參數布局（併排、緊湊）
   - [x] 整合到 MarketplaceWindow
   - [x] 測試 Modal 交互流程
   - [x] 修復 Modal 定位問題（添加 relative 容器）
   - [x] 統一與 VaultWindow 的行為

---

##### 🎨 **任務 2: Publisher 復古 UI 重設計**

**目標**: 簡化上傳流程，直接在預覽頁完成所有操作

**重設計方案**:

1. **新 UI 流程** (單頁面)
   ```
   Publisher Window
   ├── Left: 3D Preview (GLB Viewer)
   │   └── 實時預覽用戶上傳的 GLB
   ├── Right: Upload & Config Panel (RetroPanel)
       ├── STL Upload (drag & drop)
       ├── GLB Upload (drag & drop)
       ├── Cover Image Upload
       ├── Basic Info (Title, Description)
       ├── Parameters Configuration
       │   └── Define min/max/default for each param
       └── [Publish Atelier] Button
   ```

2. **實施步驟** (2h)
   - [ ] 創建新的 PublisherWindow 組件
     - 使用兩欄佈局（類似 DetailModal）
     - 左側：GLBViewer 預覽
     - 右側：表單區域
   - [ ] 設計 Upload 區域
     - RetroPanel + Drag & Drop
     - 顯示文件名和大小
     - 支持 STL, GLB, Image
   - [ ] 參數配置 UI
     - 動態添加/刪除參數
     - RetroInput 輸入 min/max/default
   - [ ] 統一使用復古組件
     - RetroButton, RetroInput, RetroPanel
   - [ ] 移除多步驟流程，改為單頁

---

##### 🔒 **任務 3: Mint 流程優化 - Dry Run + Seal 加密**

**目標**: 提升安全性與用戶體驗，先驗證再上傳

**新流程設計**:

```
Mint Sculpt Flow (Optimized)
├── Step 1: 用戶選擇 Atelier 並配置參數
├── Step 2: Dry Run 驗證 ✨ NEW
│   └── 調用合約 dry run 模式檢查參數合法性
│   └── 如果失敗，提示錯誤並阻止繼續
├── Step 3: Seal SDK 加密 STL ✨ NEW
│   └── 使用 Seal SDK 加密 STL 文件
│   └── 顯示加密進度
├── Step 4: 上傳到 Walrus
│   └── 上傳加密後的 STL + GLB
│   └── 獲取 blobId
└── Step 5: 執行 Mint Transaction
    └── 傳遞 blobId 和參數到合約
```

**實施步驟** (3h)

1. **Dry Run 功能** (1h)
   - [ ] 研究 Sui SDK 的 dry run API
   - [ ] 在 `useSculptMint.ts` 中添加 `dryRunMint` 函數
   - [ ] 參數驗證邏輯
     - 檢查 paramKeys 和 paramValues 長度
     - 驗證參數值在 min/max 範圍內
     - 返回詳細錯誤信息
   - [ ] UI 顯示驗證狀態

2. **Seal SDK 整合** (1.5h)
   - [ ] 研究 Seal SDK 加密 API
   - [ ] 創建 `utils/sealEncryption.ts`
     - `encryptSTL(file: File): Promise<EncryptedFile>`
     - 處理加密錯誤
   - [ ] 在 mint 流程中整合
     - 上傳前自動加密 STL
     - 顯示加密進度條
   - [ ] 測試加密和解密流程

3. **整合與測試** (30min)
   - [ ] 更新 `useSculptMint` hook
     - 添加 dry run 步驟
     - 添加 Seal 加密步驟
     - 錯誤處理和回退
   - [ ] 更新 UI 顯示加載狀態
   - [ ] E2E 測試完整流程

---

##### 📋 **任務優先級**

```
Day 3 建議順序:
1. Marketplace 重構 (階段 1-2) - 2h  ← 先建立基礎
2. Mint 流程優化 (Dry Run) - 1h     ← 核心功能
3. Seal SDK 加密 - 1.5h              ← 安全性提升
4. Publisher UI 重設計 - 2h         ← UI 改進
5. Marketplace UI 統一 - 1h         ← 完善體驗
```

**預計總時間**: 7.5 小時

---

#### 完成事項
- [ ] 待填寫

#### 進行中
- [ ] Marketplace 重構計劃中

#### 遇到的問題
- 待記錄

#### 技術研究需求
- [ ] Kiosk SDK - Listed Items API 文檔
- [ ] Sui SDK - Dry Run Transaction API
- [ ] Seal SDK - 文件加密 API 

---

### Day 4 - 2025-11-09 (Sat)

#### 完成事項
- [ ] 

#### 進行中
- [ ] 

#### 遇到的問題
- 

#### 明日計劃
- [ ] 

---

### Day 5 - 2025-11-10 (Sun)

#### 完成事項
- [ ] 

#### 進行中
- [ ] 

#### 遇到的問題
- 

#### 明日計劃
- [ ] 

---

### Day 6 - 2025-11-11 (Mon)

#### 完成事項
- [ ] 

#### 進行中
- [ ] 

#### 遇到的問題
- 

#### 明日計劃
- [ ] 

---

### Day 7 - 2025-11-12 (Tue)

#### 完成事項
- [ ] 

#### 進行中
- [ ] 

#### 遇到的問題
- 

#### 明日計劃
- [ ] 

---

### Day 8 - 2025-11-13 (Wed)

#### 完成事項
- [ ] 

#### 進行中
- [ ] 

#### 遇到的問題
- 

#### 明日計劃
- [ ] 

---

### Day 9 - 2025-11-14 (Thu)

#### 完成事項
- [ ] 

#### 進行中
- [ ] 

#### 遇到的問題
- 

#### 明日計劃
- [ ] 

---

### Day 10 - 2025-11-15 (Fri) / 2025-11-16 (Sat)

#### 完成事項
- [ ] 

#### Demo 準備
- [ ] 最終測試
- [ ] Demo 腳本
- [ ] 展示視頻錄製
- [ ] 截圖素材準備
- [ ] 黑客松提交

---

## 🎯 關鍵里程碑

- [ ] **Milestone 1** (Day 2 結束): 合約開發完成並部署
- [ ] **Milestone 2** (Day 4 結束): P0 前端核心功能完成
- [ ] **Milestone 3** (Day 6 結束): Vault 詳情頁完成
- [ ] **Milestone 4** (Day 8 結束): Gallery 和 Pavilion 完成
- [ ] **Milestone 5** (Day 9 結束): 所有優化完成，進入測試
- [ ] **Milestone 6** (Day 10): 提交黑客松

---

## 📝 待辦事項快速列表

### 🔴 P0 - 緊急/重要 (Day 3)
- [ ] Gallery → Marketplace 重構
- [ ] Sculpt 僅索引 Listed (Kiosk SDK)
- [ ] Mint Dry Run 驗證
- [ ] Seal SDK 加密 STL 文件

### 🟡 P1 - 重要/不緊急 (Day 3-4)
- [ ] Publisher 復古 UI 重設計
- [ ] Marketplace UI 復古風格統一
- [ ] 3D Preview 整合到 Publisher

### 🟢 P2 - 優化/Nice to Have
- [ ] Marketplace 搜索功能
- [ ] Trending 排序
- [ ] 更多篩選選項

---

## 🐛 Bug 追蹤

| ID | 描述 | 嚴重性 | 狀態 | 負責人 | 備註 |
|----|------|--------|------|--------|------|
| - | - | - | - | - | - |

---

## 💡 優化想法 / 未來改進

- 
- 
- 

---

## 📚 學習筆記連結

- [Seal SDK 文檔](https://docs.walrus.site/) - 待更新
- [Kiosk 標準文檔](https://docs.sui.io/standards/kiosk)
- [React Three Fiber 官方文檔](https://docs.pmnd.rs/react-three-fiber/)
- 

---

## 🔗 相關連結

- [Walrus Haulout 黑客松規則](https://suifoundation.notion.site/Walrus-Haulout-Hackathon-Event-Rules-29437af41c6e808a8acbc35f7a7df86a)
- [Archimeters Live Demo](https://archimeters.vercel.app/)
- [專案 GitHub](https://github.com/231-Labs/archimeters)
- [Sui Explorer (Testnet)](https://suiexplorer.com/?network=testnet)

---

## Day 3 下午 - UI 精修 (2025-01-08 Afternoon)

### UI/UX 改進任務完成

#### 1. ✅ Detail Modal Back 按鈕 Hover 效果修復
- 為 `RetroDetailModal` 的 BACK 按鈕添加 hover 狀態
- 添加 `hover:bg-[#252525]` 和 `hover:text-white` 樣式
- 改善交互反饋，提升用戶體驗

#### 2. ✅ 所有窗口無 Item 狀態 Retro UI 統一設計
- 創建 `RetroEmptyState` 可復用組件
- 特性：
  - 3D 內凹面板效果
  - 可自定義圖標（box, file, image, globe）
  - 統一的 mono 字體和大寫標題
  - 可在所有窗口中復用
- 應用到：
  - `MarketplaceWindow`: "NO ATELIERS FOUND", "NO LISTED SCULPTS"
  - `VaultWindow`: "NO ATELIERS FOUND", "NO SCULPTS FOUND"

#### 3. ✅ Mint 狀態 Toast 改為復古 Ticket 樣式
- 完全重新設計 `MintStatusNotification` 組件
- 復古票據美學特性：
  - 左右兩側的打孔效果
  - 虛線邊框分隔頭部和內容
  - "ARCHIMETERS SYSTEM" 頭部，帶漸變背景
  - 簡潔的大寫狀態標籤
  - 狀態/進度的雙欄佈局
  - 3D 斜面邊框和陰影效果
- 狀態類型：
  - 上傳中：加載動畫 + 進度百分比
  - 上傳成功：✓ 圖標 + 確認訊息
  - 上傳失敗：✕ 圖標 + 錯誤訊息
  - 準備中/鑄造中：加載動畫 + 狀態文字
  - 鑄造成功：✓ 圖標 + 交易連結（帶虛線分隔）
  - 鑄造失敗：✕ 圖標 + 錯誤詳情

#### 4. ✅ Window 外框組件立體感優化
- 優化 `Window.tsx` 中的窗口邊框和陰影系統：
  - 外框：凸起 3D 效果，頂部/左側較亮，底部/右側較暗
  - 邊框從 3px 簡化為 2px，外觀更簡潔
  - 增強 box-shadow，包含內部高光和陰影
  - 添加細微的 1px 輪廓線以增強定義
- 標題欄改進：
  - 改為正確的內凹效果（頂部/左側暗，底部/右側亮）
  - 添加漸變背景（從上到下）
  - 優化內部陰影以呈現真實深度感
- 結果：更加統一和真實的復古 OS 窗口外觀

#### 5. ✅ Marketplace/Vault 預設尺寸調整，取消縮放功能
- 更新 `windows.ts` 配置：
  - Marketplace: 1100x700px（從 700x650px 調整）
  - Vault: 1100x700px（從 800x600px 調整）
  - 兩個窗口都設置為 `resizable: false`
- 優點：
  - 為雙欄 DetailModal 佈局提供最佳尺寸
  - 防止極端窗口尺寸導致佈局崩潰
  - 提供一致的用戶體驗

#### 6. ✅ MarketplaceWindow Modal 定位修復
- **問題**: AtelierMintModal 覆蓋窗口 header
- **原因**: MarketplaceWindow 缺少 relative 定位容器
- **解決方案**: 添加外層 `<div className="relative h-full overflow-hidden">` 包裹
- **效果**: Modal 定位參考點正確，不再覆蓋 header，與 VaultWindow 行為一致

#### 7. ✅ VaultWindow 錯誤狀態 Retro UI 統一
- 將錢包未連接和無 Membership NFT 錯誤狀態改用 `RetroEmptyState` 組件
- 錢包未連接：
  - 標題: "WALLET NOT CONNECTED"
  - 圖標: globe
- 無 Membership NFT：
  - 標題: "NO MEMBERSHIP NFT"
  - 圖標: file
- 應用到 Ateliers 和 Sculpts 兩個標籤頁

#### 8. ✅ List 模式 Retro UI 統一
- 創建 `RetroListItem` 組件系統：
  - `RetroListItem`: 主容器，3D 內凹邊框效果，hover 狀態
  - `RetroListThumbnail`: 縮略圖容器，內凹框架
  - `RetroListInfo`: 標題和元數據顯示，大寫樣式
  - `RetroListArrow`: 箭頭圖標，hover 效果
- 應用範圍：
  - **MarketplaceWindow**: Ateliers List, Sculpts List
  - **VaultWindow**: Ateliers List, Sculpts List
- 代碼優化：從 ~210 行重複代碼減少到 ~30 行復用組件（減少 30%）

#### 9. ✅ RetroPrinterCard 組件
- 創建復古風格的 Printer 選擇卡片
- 特性：
  - 3D 凸起邊框（outset 效果）
  - 點擊動畫（按下時變為 inset）
  - 像素風格狀態指示器（2x2px 方形）
  - Online: 綠色像素 + 發光效果
  - Offline: 灰色像素 + 內凹陰影 + 不可點擊
  - 狀態徽章帶內陰影
  - Monospace 字體 + 大寫文字
- 應用到 VaultWindow 的 Printer 選擇區域

### 代碼優化成果
- **總代碼減少**: ~30% (List 模式)
- **組件復用性**: 新增 4 個可復用組件
- **統一性提升**: 所有交互元素使用統一的 Retro UI 風格
- **可維護性**: 單一組件修改即可影響所有使用位置

### 文件變更摘要
- `frontend/components/common/RetroDetailModal.tsx` - Back 按鈕 hover 效果
- `frontend/components/common/RetroEmptyState.tsx` - 新建統一空狀態組件
- `frontend/components/common/RetroListItem.tsx` - 新建 List 項目組件系統
- `frontend/components/common/RetroPrinterCard.tsx` - 新建 Printer 卡片組件
- `frontend/components/windows/MarketplaceWindow.tsx` - 應用 RetroEmptyState, RetroListItem, 修復 Modal 定位
- `frontend/components/windows/VaultWindow.tsx` - 應用 RetroEmptyState, RetroListItem, RetroPrinterCard
- `frontend/components/features/atelier-viewer/components/MintStatusNotification.tsx` - 復古票據樣式重構
- `frontend/components/features/atelier-viewer/AtelierMintModal.tsx` - 調整定位邏輯
- `frontend/components/common/Window.tsx` - 窗口框架 3D 效果優化
- `frontend/config/windows.ts` - Marketplace/Vault 尺寸調整和禁用縮放
- `frontend/app/page.tsx` - 修復 resizable 配置讀取

#### 10. ✅ 清理遺留的 Gallery 代碼
- 刪除已被替換的文件：
  - `frontend/components/windows/BrowseWindow.tsx` → 已被 `MarketplaceWindow.tsx` 替代
  - `frontend/components/features/gallery/` 資料夾 → 已被 `marketplace/` 替代
- 更新 UI 文字：
  - `AtelierDetailModal.tsx`: "Gallery" → "Marketplace"
- 保留的引用：
  - `Dock.tsx`: `gallery.png` 圖標文件名（無需更改）
  - `types/window.ts`: 歷史註釋（保留供參考）
- 代碼清理：刪除 ~476 行已廢棄代碼

#### 11. ✅ 修復窗口 z-index 堆疊問題
- **問題**: 其他窗口無法高過 Vault 窗口
- **根本原因**: 新打開的窗口沒有自動添加到 `zOrder` 陣列
- **解決方案**:
  - 添加 `useEffect` 同步 `zOrder` 與 `openWindows`
  - 自動將新打開的窗口添加到 `zOrder`
  - 自動移除已關閉的窗口
  - 維護正確的堆疊順序
- **效果**:
  - 所有窗口現在可以正確堆疊
  - 新打開的窗口出現在最上層
  - 點擊任何窗口會將其置頂
  - 清晰的 z-index 管理邏輯

#### 12. ✅ 重構 Z-Index 邏輯 - 移除重複和衝突代碼
- **問題**: 
  - 重複的 z-index 管理邏輯
  - `atelierViewerRaised` 邏輯與正常窗口堆疊衝突
  - 自動將 atelier-viewer 置頂的 useEffect 干擾點擊行為
- **解決方案**:
  - 移除 `atelierViewerRaised` ref 和相關邏輯
  - 移除自動提升 atelier-viewer 的 useEffect
  - 簡化 zOrder 同步邏輯
  - 修復 TypeScript 類型錯誤
- **效果**:
  - 單一真實來源的窗口激活邏輯
  - 真正的 OS-like 行為：點擊任何窗口即置頂
  - 更清晰的代碼，無重複邏輯
  - 可預測的窗口堆疊行為

### 待修復問題

#### ⚠️ Show 3D 功能報錯
- **位置**: Vault > My Sculpts > item > 點擊 3D 按鈕
- **狀態**: 需要調查
- **可能原因**: GLBViewer 加載錯誤或 blob ID 問題

#### ⚠️ List 功能無法操作
- **位置**: Vault > My Ateliers/Sculpts > item > List 按鈕
- **現狀**: 只顯示 "Coming soon" alert
- **問題**: 
  - Kiosk SDK 實現已存在（`useAtelierMarketplace`, `useSculptMarketplace`）
  - 缺少 `kioskId` 和 `kioskCapId` 參數
  - Membership 數據中未獲取 kiosk 信息
- **需要**:
  1. 在 `useUserItems` 中添加獲取用戶 kiosk 信息的邏輯
  2. 將 kioskId 和 kioskCapId 傳遞給 DetailModals
  3. 更新 DetailModals 的 handleList 函數調用實際的 list API
  4. 測試 List/Delist 完整流程

#### 12. ✅ 修復窗口 Header 點擊和拖動行為
- **問題 1**: 點擊窗口 header 只能拖動，無法置頂
- **問題 2**: 拖動 header 時窗口會跳動
- **問題 3**: 修復跳動後窗口又無法拖動
- **問題 4**: 點擊 header 會讓窗口跳回起始位置
- **根本原因**:
  - DOM 問題: `getBoundingClientRect()` 與 `transform: translate()` 不兼容
  - 閉包問題: `useCallback` 中訪問 `state.windowPositions` 導致 stale closure
  - `state` 不在依賴數組中，每次獲取的都是創建 callback 時的舊值
- **最終解決方案**:
  - 在 header 添加 `onClick` 處理器，點擊時激活窗口
  - 使用 `setState` 的回調形式獲取最新的窗口位置
  - 在 `setState(prev => {...})` 內部訪問 `prev.windowPositions[name]`
  - 確保每次都獲取最新的 state 值
- **效果**:
  - ✅ 點擊 header = 激活窗口（置頂），位置不變
  - ✅ 拖動 header = 平滑移動，無跳動
  - ✅ 點擊內容 = 激活窗口
  - ✅ 所有交互符合標準 OS 行為

#### 13. ✅ 修復 VaultWindow Kiosk 信息查詢錯誤
- **問題**: 點擊 Vault 窗口顯示 "Kiosk information not found in membership" 錯誤
- **根本原因**:
  - `useUserItems` 嘗試從 membership NFT 的 fields 中讀取 `kiosk_id` 和 `kiosk_cap_id`
  - 但 membership NFT 並不存儲 kiosk 數據
- **解決方案**:
  - 改用與 `useKiosk.ts` 相同的方法：直接查詢用戶的 `KioskOwnerCap` 對象
  - 查詢 `0x2::kiosk::KioskOwnerCap` 類型的對象
  - 從 `fields.for` 或 `fields.kiosk_id` 提取 kioskId
  - 從對象 ID 提取 kioskCapId
  - 優雅處理沒有 kiosk 的情況（僅警告，不報錯）
- **效果**:
  - ✅ Vault 窗口正常打開，無錯誤
  - ✅ Kiosk 信息正確加載
  - ✅ 為 List 功能準備好必要數據

#### 14. ✅ 修復 3D 模型加載錯誤
- **問題 1**: 點擊 "Show 3D" 按鈕時出現 500 錯誤，無法加載 3D 模型
  - 錯誤：`net::ERR_NAME_NOT_RESOLVED` - 500 (Internal Server Error)
  - 嘗試從 `/api/walrus/get-blob?blobId=...` 加載失敗
- **問題 2**: 修復後出現新錯誤
  - 錯誤：`RangeError: Offset is outside the bounds of the DataView`
  - 進度顯示：`Loading: Infinity%`
  - GLTFLoader 無法解析 GLB 文件
- **根本原因**:
  - **問題 1**: `GLBViewer.tsx` 使用了不存在的 API 端點 `/api/walrus/get-blob`
  - **問題 2**: `/api/walrus` 路由使用 `response.text()` 處理二進制數據
    - `text()` 會將二進制數據轉換為字符串，破壞 GLB 文件結構
    - GLTFLoader 期望完整的二進制 ArrayBuffer
    - 導致 DataView 解析時出現偏移錯誤
- **解決方案**:
  - **修復 1**: 修改 `GLBViewer.tsx` 中的 `modelUrl`
    - 從 `/api/walrus/get-blob?blobId=${blobId}` 改為 `/api/walrus?blobId=${blobId}`
  - **修復 2**: 修改 `/api/walrus/route.ts` 返回方式
    - 從 `await response.text()` 改為 `response.body`
    - 直接返回二進制流，保持數據完整性
    - 添加 `Content-Length` header 以支持正確的進度顯示
- **效果**:
  - ✅ API 端點正確
  - ✅ 二進制數據保持完整
  - ✅ GLB 文件從 Walrus 正確獲取
  - ✅ Three.js 場景正確渲染 3D 模型
  - ✅ 加載進度正常顯示

### 待處理問題
- [ ] **List 功能實現 - Sculpt**: My Sculpts 的 List 功能需要 Kiosk SDK 整合（Kiosk 信息已正確獲取）
- [ ] **List 功能實現 - Atelier**: My Ateliers 使用合約自定義邏輯，較複雜，暫緩實現

### Day 3 總結

#### 🎉 完成任務統計
- **UI/UX 精修**: 14 項完成
- **代碼重構**: 窗口系統重構、模板系統合併（減少 30% 代碼）
- **Bug 修復**: 窗口拖動、Kiosk 查詢、3D 加載、藝術家信息顯示全部修復
- **新增組件**: 8 個可復用的 Retro UI 組件
- **文檔創建**: Publisher Retro UI 重設計實施指南（800+ 行）
- **總計**: 18 項完成任務 ✅

##### 15. ✅ 窗口系統代碼重構與優化
- **問題**: 窗口管理代碼分散在 3 個位置，存在重複邏輯
- **重構方案**: Feature-based 結構，集中管理
  - 創建統一目錄：`components/features/window-manager/`
  - 分離關注點：UI (Window.tsx)、狀態 (useWindowManager)、焦點 (useWindowFocus)
  - 更新 20 個文件的 import 路徑
  - 刪除遺留代碼：`hooks/useWindowManager.ts`, `components/common/Window.tsx`, `components/core/Window/`
- **優化結果**:
  - 代碼減少：page.tsx 241 → 210 行（13%）
  - 消除重複：~40 行 z-index 邏輯
  - 刪除 147 行遺留代碼
  - 單一真實來源：useWindowFocus 統一管理焦點和 z-index
- **UX 改進**: 修復拖動時立即置頂功能，符合標準桌面操作系統行為
- **E2E 測試**: ✅ 所有功能測試通過

##### 16. ✅ 模板系統重構與優化
- **問題**: `BaseTemplate` 和 `DefaultTemplate` 嵌套使用，造成不必要的層級和 prop drilling
- **重構方案**: 合併為單一組件 `AtelierMintLayout`
  - 創建 `AtelierMintLayout.tsx` 統一 Atelier Mint UI
  - 整合 `RetroHeading` 和所有參數/預覽/鑄造區塊
  - 刪除 `templates/` 資料夾（`BaseTemplate.tsx`, `DefaultTemplate.tsx`）
  - 更新 `AtelierMintCore.tsx` 和 `PreviewPage.tsx` 直接使用新布局
- **優化結果**:
  - 減少組件嵌套層級
  - 消除 prop drilling
  - 更清晰的代碼結構
  - 易於維護和擴展
- **E2E 測試**: ✅ 所有功能測試通過

##### 17. ✅ 修復 DesignPublisher 藝術家信息顯示問題
- **問題**: PreviewPage 中 Artist Information (name, social, intro) 顯示為空
- **根本原因**:
  - `artistInfo` 默認值為空字符串（`useArtworkForm` 初始化）
  - `membershipData` 可能為 null（用戶未鑄造 Membership NFT）
  - 缺少 fallback 邏輯，導致無數據時顯示空白
- **解決方案**: 添加多層級 fallback 邏輯
  - **Author Name**: `membershipData.username` → `name` → `'Anonymous'`
  - **Author Social**: `membershipData.address`（格式化）→ `currentAccount.address`（格式化）→ `social` → `'Unknown'`
  - **Author Intro**: `membershipData.description` → `intro` → `'No description provided'`
- **技術實現**:
  - 引入 `useCurrentAccount` hook 獲取當前連接的錢包地址
  - 創建顯式的 `authorName`, `authorSocial`, `authorIntro` 變量
  - 確保每個字段都有有意義的默認值
- **效果**:
  - ✅ 有 Membership NFT：顯示 username, address, description
  - ✅ 無 Membership NFT：顯示錢包地址和占位文本
  - ✅ 數據完整：不再出現空白字段
  - ✅ 為後續 Publisher UI 重設計提供正確的數據基礎

##### 18. ✅ 創建 Publisher Retro UI 重設計實施文檔
- **文檔**: `docs/hackathon/PUBLISHER_RETRO_UI_REDESIGN.md` (約 800 行)
- **目標**: 為 Publisher UI 重設計提供完整的實施指南
- **內容包含**:
  1. **任務概述**: 目標、核心需求、背景分析
  2. **UI 設計方案**: 詳細的單頁面布局設計（基於 AtelierMintLayout）
  3. **Retro UI 組件使用指南**: 
     - 所有可復用組件清單（布局、交互、面板組件）
     - 顏色規範和 3D 邊框效果規範
     - 詳細的使用示例代碼
  4. **文件上傳缺省狀態設計**: 
     - STL/GLB/Cover Image 的未上傳和已上傳狀態
     - 3D 預覽區缺省狀態
     - 參數配置區缺省狀態
     - 所有示例包含完整的 Retro UI 代碼
  5. **技術實施步驟**: 
     - Phase 1: 創建新組件（PublisherMintLayout, FileUploadZone, ParameterConfig）
     - Phase 2: 整合 Hooks 和狀態管理
     - Phase 3: 驗證和發布邏輯
     - Phase 4: 更新路由和整合
  6. **驗證和測試清單**: 功能測試、UI/UX 測試、邊界情況、性能測試
  7. **參考文檔和實施建議**: 現有代碼參考、時間分配（預計 5h）
- **特點**:
  - 詳細的代碼示例（可直接複製使用）
  - 清晰的 UI 設計草圖（ASCII art）
  - 完整的組件 API 定義
  - 全面的測試清單
  - 明確的完成標準
- **效果**: 
  - ✅ 為下一步實施提供清晰的路線圖
  - ✅ 確保 UI 風格 100% 統一
  - ✅ 減少實施過程中的決策時間
  - ✅ 便於其他開發者快速理解和接手

### 提交記錄
- ✅ UI refinement: Detail modal, empty states, mint toast, window frame, window sizing
- ✅ Fix modal positioning and window resizable config
- ✅ Fix MarketplaceWindow modal positioning by adding relative container
- ✅ Replace VaultWindow error states with RetroEmptyState component
- ✅ Unify list view with Retro UI components
- ✅ Add RetroPrinterCard component for printer selection
- ✅ Update progress.md: Day 3 afternoon UI refinement complete
- ✅ Update progress.md: Mark Atelier Mint Modal integration as completed
- ✅ Clean up legacy Gallery code and references
- ✅ Fix window z-index issue - sync zOrder with openWindows
- ✅ Fix window header click-drag behavior
- ✅ Refactor z-index logic - remove duplicate and conflicting code
- ✅ Fix VaultWindow kiosk information query error
- ✅ Fix 3D model loading - API endpoint and binary data handling
- ✅ Refactor: Centralize window management system
- ✅ Fix: Window should focus immediately when drag starts
- ✅ Clean up: Remove legacy code and simplify window manager
- ✅ Refactor: Consolidate templates into unified AtelierMintLayout
- ✅ Fix: Update comment to English in PreviewPage.tsx
- ✅ Fix: Display artist information with proper fallbacks in PreviewPage
- ✅ Docs: Create comprehensive Publisher Retro UI redesign implementation guide

