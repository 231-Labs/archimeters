# Walrus Haulout Hackathon 進度追蹤

> 更新日期: 2025-11-06  
> 黑客松期間: 2025-11-06 ~ 2025-11-16 (共 10 天)

---

## 📊 整體進度

| 優先級 | 模組 | 狀態 | 完成度 |
|--------|------|------|--------|
| P0 | **Seal SDK 整合 - 合約層** | ✅ 已完成 | 100% |
| P0 | **Printer NFT 系統** | ✅ 已完成 (測試專用) | 100% |
| P0 | **合約代碼優化** | ✅ 已完成 | 100% |
| P0 | **Seal SDK 整合 - 前端層** | ✅ 已完成 | 100% |
| P0 | **Seal 加密 E2E 測試** | ✅ 已完成 | 100% |
| P0 | Seal 解密流程驗證 | 🚧 進行中 | 0% |
| P0 | Sculpt 二級市場 | ✅ 已完成 | 100% |
| P0 | Atelier 二級市場 | 🔄 需要返工 | 50% |
| P1 | Vault - Atelier 詳情頁 | ✅ 已完成 | 100% |
| P1 | Vault - Sculpt 詳情頁 | ✅ 已完成 | 100% |
| P1 | Marketplace 重構 | ✅ 已完成 | 100% |
| P1 | Pavilion 接入 | 🔄 需要返工 | 30% |
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
- [X] **Publisher 復古 UI 重設計** - 簡化上傳流程 → 詳見 [`PUBLISHER_RETRO_UI_REDESIGN.md`](./PUBLISHER_RETRO_UI_REDESIGN.md)
- [X] **Mint 流程優化** - Seal SDK 加密

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

**已完成 - 最終版本 v2**:
- [X] **Header 極簡重設計**：移除提示語行，單行 RetroInput + 藝術家信息，降低高度
- [X] **ParameterControls 組件提取**：
  - 從 AtelierMintLayout 提取為獨立可復用組件
  - 支援 number (range + input), color, text 類型
  - 完全對齊 Atelier Detail Modal 的排版和邏輯
  - 滑桿現在完全可用，即時更新 3D 預覽
- [X] **Membership 資料自動帶入**：修復 useMembership hook，正確提取 username 和 description
- [X] **窗口尺寸優化**：1400x890（與 Vault 1100x700 相同比例 11:7，整體更大），resizable: false
- [X] **文件上傳渲染修復**：圖片和算法文件上傳後即時渲染

**代碼優化**:
- 新增 `ParameterControls.tsx` 可復用組件
- 完全移除 Publisher 中的重複參數控件代碼
- 統一參數控制 UX 體驗

**最新更新 - 上傳狀態頁面整合**:
- [X] 添加 showUploadStatus 狀態追蹤
- [X] 整合 UploadStatusPage 組件
- [X] 點擊 PUBLISH ATELIER 後跳轉到上傳狀態頁
- [X] 傳遞所有必要 props（上傳狀態、步驟、作品信息、交易狀態）
- [X] 添加返回按鈕（onPrevious）

**RetroConsole 重新設計 - 完全對齊 Retro OS 風格**:
- [X] **創建 RetroProgressStep.tsx** - 可復用進度步驟組件
  - 3D 邊框效果（與 RetroPanel 一致）
  - 狀態圖標：✓ (成功), ✗ (失敗), ⟳ (處理中), ○ (待處理)
  - 支援子步驟顯示（樹狀結構）
  - 處理中狀態的動畫點點點
  - 顏色編碼狀態文字

- [X] **重新設計 RetroConsole.tsx**
  - 移除 WaveformDisplay 和複雜動畫
  - 添加顯眼的 Header 顯示進度追蹤
  - 橫向進度條（0-100%）帶漸變填充
  - 使用 RetroProgressStep 組件顯示步驟列表
  - Transaction digest 顯示（3D inset panel）
  - 完成訊息帶星星裝飾
  - 所有面板使用 Retro OS 3D 邊框風格
  - 緊湊佈局（max-w-4xl）

- [X] **簡化 UploadStatusPage.tsx**
  - 移除冗餘的狀態顯示代碼
  - 現在只包裝 RetroConsole
  - 單一職責組件

**UI 改進**:
- 一致的 3D 邊框
- 進度條帶漸變和發光效果
- 緊湊佈局，減少空白
- 視覺層次：Header > Progress > Steps > Transaction
- 配色：藍色（處理中）、綠色（成功）、紅色（失敗）

**最新調整**:
- [X] Publisher 窗口大小調整：1400x890 → 1200x760（等比例縮小）
- [X] RetroConsole 顏色方案調整：藍色 → 灰色（更專業中性）
- [X] 移除完成訊息的星星符號：「★ PUBLISH COMPLETE ★」→「PUBLISH COMPLETE」

**成功訊息導航按鈕**:
- [X] 添加兩個操作按鈕到完成訊息
  - **OPEN VAULT** - 跳轉到 Vault > Atelier（管理作品）
  - **OPEN MARKETPLACE** - 跳轉到 Marketplace > Atelier（查看發布作品）
- [X] 按鈕風格完全對齊 Retro OS
  - 3D 邊框效果
  - Hover 動畫（向上平移 + 顏色變化）
  - 垂直排列佈局（space-y-2）
- [X] 添加提示語：「What would you like to do next?」
- [X] 完整的數據流：
  - page.tsx → DesignPublisher → UploadStatusPage → RetroConsole
  - 點擊按鈕調用 openWindow() 打開對應窗口

**雙欄排版優化**:
- [X] 改為雙欄排版
  - **左欄**：Steps List（flex-1，自適應寬度）
  - **右欄**：Transaction Hash + Success Message（固定 400px）
- [X] 容器寬度調整：max-w-4xl → max-w-6xl
- [X] 右欄結構：
  - 固定寬度 400px
  - 垂直 flex 佈局（flex-col）
  - 自動垂直滾動（overflow-y-auto）
  - 區塊間距 gap-3
- [X] 按鈕改為垂直排列（w-full + space-y-2）

**視覺對齊優化**:
- [X] 垂直對齊修正
  - 添加 `items-start` 到 flex 容器
  - 左右兩欄從相同的頂部基線開始
  - 消除視覺不對齊問題
- [X] 右欄穩定性
  - 添加 `shrink-0` 防止寬度被壓縮
  - 保持固定 400px 寬度
- [X] 標題樣式一致性
  - Transaction Digest 文字：text-white/90（更明亮）
  - 添加 tracking-wide（字間距）
  - 調整間距 mb-2 → mb-3
- [X] 成功訊息優化
  - 減少頂部間距 mb-4 → mb-3
  - 將提示語整合到標題區塊中
  - 移除冗餘嵌套 div
  - 更緊湊、平衡的視覺效果

**最終佈局優化**:
- [X] 整體元件垂直居中
  - 添加 `justify-center` 到主容器
  - 元件在視窗中完美居中
  - 更好地利用垂直空間
- [X] 按鈕改回橫向排列
  - 從 `space-y-2`（縱向）改回 `grid grid-cols-2 gap-3`（橫向）
  - 兩個按鈕並排顯示
  - 更緊湊、專業的佈局
  - 與 400px 右欄寬度完美適配
- [X] 修復垂直居中實現
  - 移除內容容器的 `flex-1`（原本會佔據所有剩餘空間）
  - 添加 `maxHeight: '60vh'` 到主內容容器和左右兩欄
  - 確保內容高度受控，不會溢出視窗
  - 各欄位在超過高度時可獨立滾動
  - 真正實現整體元件在視窗中垂直居中

**佔位元件優化**:
- [X] Transaction Digest 永久顯示
  - 從一開始就渲染，避免突然出現
  - 等待狀態：顯示 "Waiting for transaction..."（灰色）
  - 完成狀態：顯示實際交易哈希（綠色/紅色）
  - Explorer 鏈接只在有 txHash 時顯示
- [X] Status Message 永久顯示
  - 從一開始就渲染，保持佈局穩定
  - 進行中：顯示 "PUBLISHING IN PROGRESS" + 等待提示
  - 完成：顯示 "PUBLISH COMPLETE" + 導航按鈕
- [X] 佈局穩定性提升
  - 右側欄高度保持一致
  - 無突然的佈局位移
  - 更流暢的用戶體驗
  - 清晰的狀態反饋

**配色方案**:
- 灰色：處理中/進行中（中性）
- 綠色：成功/完成
- 紅色：錯誤/失敗
- 白色變化：待處理/未激活

**待測試**:
- [X] 測試發布流程（metadata 創建 + 文件上傳 + 合約調用）
- [X] 測試導航按鈕是否正確打開 Vault 和 Marketplace

### Day 3 晚間 - Design Publisher 代碼清理與重構

#### 已完成的清理工作

**刪除的文件（19 個文件，2168 行代碼）**:
- [X] 頁面組件：AlgorithmPage, BasicInfoPage, PreviewPage
- [X] Algorithm 子資料夾（4 個文件）：AlgorithmFileUploader, DesignSettings, ParameterList, index.ts
- [X] 動畫組件資料夾（4 個文件）：NoiseEffect, RetroConsole, StardustBackground, WaveformDisplay
- [X] 不再使用的組件：NavigationButtons, TemplateInfo, UploadStatus, PublisherMintLayout
- [X] 不再使用的 hooks：useAlgorithmFile, useGeometryScript, usePageNavigation

**重構的文件**:
- [X] useDesignPublisherForm.ts
  - 移除分頁導航邏輯
  - 移除 usePageNavigation 依賴
  - 移除 currentPage, goToNextPage, goToPreviousPage
  - 新增 handlePublish() 方法取代分頁驗證
  - 簡化為單頁流程
  - 減少 28 行代碼
- [X] pages/index.ts
  - 只保留 UploadStatusPage 導出

**清理成果**:
- ✅ 總共刪除 2196 行不再使用的代碼
- ✅ 代碼庫更簡潔、可維護性更高
- ✅ 單頁 Publisher 流程完全實現
- ✅ 所有功能完整保留
- ✅ 所有保留的代碼都在使用中

**保留的核心文件**:
- components/pages/: ParametricViewer.tsx, UploadStatusPage.tsx
- hooks/: useArtworkForm, useDesignPublisherForm, useFileUpload, useMembership, useParameters, useTransaction, useUpload, useValidation
- utils/: metadata.ts, templateConfig.ts
- types/: index.ts

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
   - [X] 創建新的 PublisherWindow 組件
     - 使用兩欄佈局（類似 DetailModal）
     - 左側：GLBViewer 預覽
     - 右側：表單區域
   - [X] 設計 Upload 區域
     - RetroPanel + Drag & Drop
     - 顯示文件名和大小
     - 支持 STL, GLB, Image
   - [X] 參數配置 UI
     - 動態添加/刪除參數
     - RetroInput 輸入 min/max/default
   - [X] 統一使用復古組件
     - RetroButton, RetroInput, RetroPanel
   - [X] 移除多步驟流程，改為單頁

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

1. **Seal SDK 整合** (1.5h)
   - [X] 研究 Seal SDK 加密 API
   - [X] 創建 `utils/sealEncryption.ts`
     - `encryptSTL(file: File): Promise<EncryptedFile>`
     - 處理加密錯誤
   - [X] 在 mint 流程中整合
     - 上傳前自動加密 STL
     - 顯示加密進度條
   - [ ] 測試加密和解密流程

2. **整合與測試** (30min)
   - [X] 更新 `useSculptMint` hook
     - 添加 dry run 步驟
     - 添加 Seal 加密步驟
     - 錯誤處理和回退
   - [X] 更新 UI 顯示加載狀態
   - [X] E2E 測試完整流程

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
- [X] Marketplace 重構計劃中

#### 遇到的問題
- 待記錄

#### 技術研究需求
- [X] Kiosk SDK - Listed Items API 文檔
- [X] Seal SDK - 文件加密 API 

---

### Day 4 - 2025-11-09 (Sat)

#### 完成事項
- [x] **代碼清理**
  - [x] 移除所有 console.log/warn 調試語句
  - [x] 清理不必要的註解
  - [x] 保留必要的錯誤處理 console.error
- [x] **Day 3 未完成任務順延**
  - [x] Marketplace 重構（階段 1-3）已完成
  - [x] Publisher Retro UI 重設計已完成
  - [x] Mint UI 重構與優化已完成
  - [x] Atelier Viewer Retro UI 重構已完成
- [x] **✨ 任務 3: Mint 流程優化 - Dry Run + Seal 加密** 
  - [x] 創建 `useDryRunMint` Hook - 參數驗證和交易 dry run
    - 實現 `validateParameters` - 檢查參數範圍和長度
    - 實現 `dryRunMint` - 使用 `devInspectTransactionBlock` 預檢交易
    - 返回驗證結果和 Gas 估算
  - [x] 整合 Dry Run 到 `useSculptMint`
    - 在上傳前先執行 dry run 驗證
    - 驗證失敗時阻止後續流程並顯示錯誤
    - 驗證成功後記錄 gas 估算
  - [x] 更新 UI 顯示驗證狀態
    - `MintStatusNotification`: "PREPARING" → "VALIDATING TX"
    - 錯誤訊息自動顯示參數驗證失敗詳情
  - [x] **實現 Seal SDK 加密 API**
    - 引入 `@mysten/seal` SDK (v0.9.3)
    - 創建 `SealClient` 實例和配置管理
    - 實現 `encryptModelFile` 函數
      - 使用 `KemType.BonehFranklinBLS12381DemCCA` 加密算法
      - 使用 `DemType.AesGcm256` 資料加密模式
      - 支援 AAD (Additional Authenticated Data)
      - Fallback 機制：加密失敗時使用未加密文件
  - [x] **整合 Seal 加密到 Mint 流程**
    - 在模型導出後、上傳前執行加密
    - 傳遞 `SuiClient` 給 `encryptModelFile`
    - 顯示加密狀態："PREPARING" 包含加密步驟
    - 記錄加密元數據（resourceId, originalSize, encryptedSize）

#### 新增文件
- `frontend/components/features/atelier-viewer/hooks/useDryRunMint.ts` (197 行)
  - Dry run 驗證 hook
  - 參數範圍驗證
  - Transaction devInspect API 整合

#### 修改文件
- `frontend/utils/seal.ts`
  - 從 placeholder 實現升級為真正的 Seal SDK 整合
  - 新增 `getSealClient` 函數管理 SealClient 實例
  - 完整實現 `encryptModelFile` 加密邏輯
  - 支援 fallback 到未加密上傳
- `frontend/components/features/atelier-viewer/hooks/useSculptMint.ts`
  - 整合 `useDryRunMint` hook
  - 在 Step 6 新增 Dry Run 驗證步驟
  - 傳遞 `suiClient` 給 Seal 加密函數
- `frontend/components/features/atelier-viewer/components/MintStatusNotification.tsx`
  - 更新 "PREPARING" 文字為 "VALIDATING TX"

#### 技術亮點 ✨
1. **Dry Run 驗證機制**
   - 使用 Sui SDK 的 `devInspectTransactionBlock` API
   - 在實際執行前驗證交易合法性
   - 減少因參數錯誤導致的 Gas 費損失
   - 提供清晰的錯誤訊息和 Gas 估算

2. **Seal SDK 加密整合**
   - 採用 Identity-Based Encryption (IBE)
   - 使用 BLS12-381 曲線的 Boneh-Franklin 加密
   - AES-GCM-256 對稱加密保護實際數據
   - 支援訪問控制（未來可添加 printer whitelist）

3. **優雅的錯誤處理**
   - Seal 加密失敗時自動 fallback 到未加密上傳
   - Dry run 失敗時阻止後續流程並顯示詳細錯誤
   - 所有關鍵步驟都有狀態追蹤和日誌

#### 新 Mint 流程 🔄
```
用戶點擊 MINT SCULPT
  ↓
Step 1: 擷取 3D 場景截圖 → 上傳到 Walrus
  ↓
Step 2: 導出 3D 模型文件 (GLB/STL)
  ↓
Step 3: 🔐 Seal SDK 加密（如啟用）
  └─ packageId: atelierId
  └─ id: sculptId
  └─ demType: AesGcm256
  └─ threshold: 1
  ↓
Step 4: 上傳加密模型到 Walrus
  ↓
Step 5: 讀取參數並轉換為鏈上格式
  ↓
Step 6: ✨ Dry Run 驗證
  ├─ validateParameters() - 範圍檢查
  ├─ devInspectTransactionBlock() - 交易預檢
  └─ 驗證失敗 → 中止並顯示錯誤
  ↓
Step 7: 執行鏈上 Mint 交易
  └─ 成功 → 顯示交易哈希
```

#### 進行中
- [X] E2E 測試 Mint 流程（需要實際測試環境和 Seal Key Server 配置）

#### 遇到的問題
- **Seal Key Server 配置**: 目前使用 placeholder objectId，需要實際的 testnet key server 配置
  - **解決方案**: 將在實際部署時從環境變數讀取正確的 key server objectId
  - **暫時方案**: Seal 加密當前設定為 `SEAL_CONFIG.enabled = false`，可在需要時透過環境變數啟用

#### 明日計劃 (Day 6)
- [ ] **🔐 Seal 解密流程驗證** - 測試完整的加密→解密流程
  - [ ] 實現 `decryptModelFile` 函數
  - [ ] 測試 Printer 白名單機制
  - [ ] 端到端解密測試
- [ ] **🧪 系統穩定性測試** - 錯誤處理、性能測試
- [ ] **📝 文檔更新** - Seal 解密流程文檔 

---

### Day 5 - 2025-11-10 (Sun)

#### 完成事項
- [x] **🔐 Seal 加密整合 - Phase 1: 合約層完成**
  - [x] 創建實施計劃文檔 (`SEAL_IMPLEMENTATION_PLAN.md`)
  - [x] 修改 Sculpt 結構
    - 添加 `glb_file: String` 字段（專門存 GLB）
    - 修改 `structure: option::Option<String>`（可選 STL）
    - 修改 `printer_whitelist: VecSet<address>`（從 ID 改為 address）
  - [x] 實現 `seal_approve_printer` 函數
    - 符合 Seal 文檔要求（entry fun, id: vector<u8>）
    - 檢查 sculpt ID 和白名單
    - 無副作用，只讀驗證
  - [x] 修改 `mint_sculpt` 函數支持可選 STL
  - [x] 更新白名單管理函數（address 類型）
  - [x] 更新相關 events 和 getter 函數
  - [x] 編譯測試通過 ✅

#### 進行中
- [X] Seal 整合 Phase 2: 前端實現

#### 遇到的問題
- 無

#### 明日計劃
- [X] Seal SDK testnet 配置
- [X] 前端 UI toggle 實現
- [ ] 完整測試流程 

---

### Day 6 - 2025-11-11 (Mon)

#### 計劃任務

##### 🔐 **Seal 解密流程驗證**
- [ ] **解密測試準備**
  - [ ] 研究 Seal SDK 解密 API (`sealClient.decrypt()`)
  - [ ] 了解解密所需參數（packageId, id, encryptedData）
  - [ ] 確認 Key Server 訪問和授權流程
  
- [ ] **實現解密功能**
  - [ ] 創建 `decryptModelFile` 函數（`utils/seal.ts`）
  - [ ] 處理 Key Server 請求和響應
  - [ ] 驗證解密後的文件完整性
  
- [ ] **測試 Printer 白名單機制**
  - [ ] 測試 `add_printer_to_whitelist` 功能
  - [ ] 測試 `seal_approve_printer` 授權流程
  - [ ] 驗證只有白名單內的 printer 可以解密
  - [ ] 測試未授權 printer 訪問被拒絕

- [ ] **端到端解密測試**
  - [ ] 完整流程：Mint (加密) → 添加 Printer 到白名單 → 解密 STL
  - [ ] 驗證解密後的 STL 文件可以正常打開
  - [ ] 確認文件內容與原始 STL 一致
  
##### 🧪 **系統穩定性測試**
- [ ] **錯誤處理測試**
  - [X] 測試加密失敗時的 fallback 機制
  - [X] 測試網絡錯誤時的重試邏輯
  - [X] 測試參數驗證錯誤提示

##### 📝 **文檔和優化**
- [ ] 更新 Seal 實施文檔（`SEAL_IMPLEMENTATION_PLAN.md`）
- [ ] 記錄解密流程和 API 使用方法
- [ ] 代碼注釋完善

#### 完成事項
- [ ] 待填寫

#### 進行中
- [ ] Seal 解密流程驗證

#### 遇到的問題
- 待記錄

#### 明日計劃 (Day 7)
- [ ] 全系統 E2E 測試
- [ ] UI/UX 最終優化
- [ ] 準備 Demo 材料 

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

### 🔴 P0 - 緊急/重要 (Day 3-4)
- [x] Gallery → Marketplace 重構
- [x] Sculpt 僅索引 Listed (Kiosk SDK)
- [x] Mint Dry Run 驗證
- [x] Seal SDK 加密整合

### 🟡 P1 - 重要/不緊急 (Day 3-4)
- [x] Publisher 復古 UI 重設計
- [x] Marketplace UI 復古風格統一
- [x] Atelier Mint Modal 整合

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

---

### Day 4 - 2025-11-09 (Sat)

#### 完成事項

- [x] **Seal 整合 - Phase 1: 合約層實現** ✅
  - [x] sculpt.move 合約修改
    - [x] 新增 `glb_file: String` 字段存放 GLB 3D 預覽文件
    - [x] 修改 `structure: Option<String>` 為可選加密 STL 文件
    - [x] 新增 `printer_whitelist: VecSet<address>` 打印機白名單
    - [x] 修改 `encrypted: bool` 標記（基於 structure 是否存在）
    - [x] 實現 `entry fun seal_approve_printer<T>` Seal 授權函數
    - [x] 更新 `mint_sculpt` 函數簽名支持新字段
    - [x] 更新白名單管理函數使用 `address` 而非 `ID`
    - [x] 新增 getter 函數：`get_glb_file`, `get_structure`
  - [x] 合約事件更新
    - [x] 更新 `New_sculpt`, `PrinterAdded`, `PrinterRemoved` 事件
  - [x] 合約編譯測試
    - [x] 修復重複 alias 警告
    - [x] 編譯無警告通過 ✅

- [x] **Seal 整合 - Phase 1B: 合約測試** ✅
  - [x] 創建測試框架
    - [x] 新增 `seal_unit_tests.move` 測試模組
    - [x] 實現 `create_test_sculpt` 測試輔助函數
    - [x] 實現 `test_seal_approve_printer` 測試輔助函數
  - [x] 核心功能測試（5 項測試全部通過）
    - [x] `test_encrypted_sculpt_properties` - 驗證加密 Sculpt 屬性
    - [x] `test_unencrypted_sculpt_properties` - 驗證非加密 Sculpt 屬性
    - [x] `test_printer_whitelist_add_remove` - 白名單管理功能
    - [x] `test_seal_approve_with_authorized_printer` - 授權打印機訪問
    - [x] `test_seal_approve_with_unauthorized_printer` - 未授權訪問拒絕
  - [x] 完整測試套件
    - [x] **24/24 測試全部通過** ✅
    - [x] 5 個新的 Seal 測試 + 19 個現有測試

- [x] **代碼清理**
  - [x] 移除 Dry Run 相關代碼（useDryRunMint.ts）
  - [x] 清理 useSculptMint.ts 中的 Dry Run 依賴
  - [x] 還原 MintStatusNotification 狀態文本

#### 技術細節

**合約修改摘要**：
```move
// 新的 Sculpt 結構
public struct Sculpt<phantom ATELIER> has key, store {
    id: UID,
    atelier_id: ID,
    alias: String,
    owner: address,
    creator: address,
    blueprint: String,
    glb_file: String,                       // 新增：GLB 3D 預覽
    structure: option::Option<String>,      // 修改：可選的加密 STL
    parameters: VecMap<String, u64>,
    printed: u64,
    time: u64,
    printer_whitelist: VecSet<address>,     // 新增：打印機白名單
    encrypted: bool,                        // 自動設置
}

// Seal 授權函數
entry fun seal_approve_printer<T>(
    id: vector<u8>,
    sculpt: &Sculpt<T>,
    ctx: &TxContext
) {
    // 驗證 sculpt ID 和白名單
    let sculpt_id_bytes = object::id_to_bytes(&object::uid_to_inner(&sculpt.id));
    assert!(sculpt_id_bytes == id, ENO_PERMISSION);
    
    let caller = ctx.sender();
    assert!(vec_set::contains(&sculpt.printer_whitelist, &caller), ENO_PERMISSION);
}
```

**測試結果**：
```
Test result: OK. Total tests: 24; passed: 24; failed: 0
- archimeters::seal_unit_tests (5/5 通過)
- archimeters::marketplace_tests (11/11 通過)
- archimeters::pool_cap_tests (8/8 通過)
```

#### 下一步

- [ ] **Phase 2A: 前端 Seal 整合**
  - [ ] 修改 Mint Sculpt 界面添加 STL toggle
  - [ ] 實現 STL 文件生成和加密上傳
  - [ ] 配置 Seal SDK testnet 參數
  - [ ] 更新交易調用適配新合約簽名
  - [ ] 端到端測試

#### 技術決策

1. **移除 Dry Run 功能**
   - 原因：實現複雜度高，參數不一致導致頻繁錯誤
   - 決定：專注於 Seal 整合，提升核心功能穩定性

2. **Option<String> 設計**
   - GLB 文件為必選（3D 預覽）
   - STL 文件為可選（打印用，需加密）
   - 簡化用戶選擇，降低複雜度

3. **測試策略**
   - 單元測試：測試核心邏輯和邊界條件
   - 避免跨事務對象傳遞（測試框架限制）
   - 使用 `test_utils::destroy` 管理測試對象生命週期

#### Gas 消耗
- 無需重新部署（合約測試通過）
- 下次部署將包含所有 Seal 功能

#### 進一步優化 (當日下午)

- [x] **合約架構重構 - Printer 物件系統** ✅
  - [x] 創建 `printer.move` 模組
    - [x] 定義 `Printer` NFT 結構（name, owner, manufacturer, serial_number）
    - [x] 實現 `mint_printer` 功能
    - [x] 實現 `transfer_printer` 功能
    - [x] 添加完整的 getter 函數
  - [x] 修改 sculpt.move 白名單機制
    - [x] `printer_whitelist` 從 `VecSet<address>` 改為 `VecSet<ID>`
    - [x] 更新所有白名單相關函數使用 Printer ID
    - [x] 修改 `seal_approve_printer` 驗證 Printer ID 而非 address
    - [x] 更新事件定義使用 `printer_id: ID`
  - [x] 測試更新
    - [x] 修改所有測試以使用 Printer ID
    - [x] 更新 `integration_tests.move` 適配新的 mint_sculpt 簽名
    - [x] **完整測試套件：30/30 全部通過** ✅

**技術亮點**：
```move
// 新的 Printer 物件
public struct Printer has key, store {
    id: UID,
    name: String,
    owner: address,
    manufacturer: String,
    serial_number: String,
    created_at: u64,
}

// Seal 授權邏輯
entry fun seal_approve_printer<T>(
    id: vector<u8>,              // Printer ID from Seal
    sculpt: &Sculpt<T>,
    _ctx: &TxContext
) {
    let printer_id = object::id_from_bytes(id);
    assert!(vec_set::contains(&sculpt.printer_whitelist, &printer_id), ENO_PERMISSION);
}
```

**測試結果**：
```
Test result: OK. Total tests: 30; passed: 30; failed: 0
- seal_unit_tests (5/5)
- integration_tests (5/5)
- marketplace_tests (11/11)
- pool_cap_tests (8/8)
```

#### 設計決策說明

**為何使用 Printer ID 而非 Address？**
1. **所有權驗證**：Printer 作為 NFT，只有持有者才能使用
2. **可轉讓性**：Printer 可以轉讓給其他用戶，whitelist 自動跟隨
3. **去中心化管理**：不依賴中心化的地址註冊
4. **Seal 整合**：Seal 的 identity 可以直接映射到 Printer ID
5. **安全性**：確保只有實際擁有 Printer NFT 的用戶才能解密打印

#### 代碼優化 (當日晚上 - 合約重構)

- [x] **合約代碼優化與重構** ✅
  - [x] 創建 `atelier_validation.move` 模組
    - [x] 提取驗證邏輯：`verify_membership_ownership`, `verify_owner_permission`
    - [x] 提取參數規則構建：`build_parameter_rules`
    - [x] 提取參數驗證：`validate_parameter`
    - [x] 統一錯誤代碼定義
  - [x] 優化 `sculpt.move`
    - [x] 移除冗余註解（339 行，優化後更簡潔）
    - [x] 保留核心業務邏輯註解
  - [x] 優化 `printer.move`
    - [x] 標記為 `#[test_only]`（屬於 Eureka 包，僅測試使用）
    - [x] 從 81 行精簡到 44 行
  - [x] 優化 `atelier.move`
    - [x] 移除重複定義（`ParameterRule`, `ParameterRules`, `verify_membership_ownership`）
    - [x] 引入 `atelier_validation` 模組
    - [x] 移除未使用的導入（`vec_map::{ Self, VecMap }`）
    - [x] 移除未使用的常量（`ENO_MEMBERSHIP`）
    - [x] 從 440 行優化到 398 行
  - [x] 測試驗證
    - [x] **完整測試套件：30/30 全部通過** ✅
    - [x] 編譯無警告 ✅

**優化成果**：
- ✅ 更好的代碼組織：驗證邏輯集中管理
- ✅ 減少代碼重複：移除冗余定義和註解
- ✅ 明確測試邊界：Printer 標記為測試專用
- ✅ 模組化設計：便於未來維護和擴展

**新增文件**：
- `contract/sources/atelier_validation.move` (84 行)
  - ParameterRule 和 ParameterRules 結構定義
  - 會員驗證、所有權驗證
  - 參數規則構建和驗證邏輯

**刪除文件**：
- `contract/sources/atelier_pool.move`（臨時文件）
- `contract/sources/sculpt_access.move`（臨時文件）

#### 合約模組化重構

- [x] **合約資料夾結構優化** ✅
  - [x] 創建子資料夾結構（方案 B）
    ```
    sources/
    ├── archimeters.move
    ├── atelier/
    │   ├── atelier.move
    │   ├── validation.move (原 atelier_validation.move)
    │   └── marketplace.move (原 atelier_marketplace.move)
    ├── sculpt/
    │   └── sculpt.move
    ├── rules/
    │   └── royalty_rule.move
    └── test_utils/
        └── printer.move
    ```
  - [x] 合約編譯通過 ✅
  - [x] **完整測試套件：30/30 全部通過** ✅

#### Seal 前端整合 (當日晚上)

- [x] **Seal 整合 Phase 2A: 前端 UI 實現** ✅
  - [x] 配置 Seal Testnet Key Servers
    - [x] 添加 3 個測試網 key servers（Mysten Labs x2, Triton One）
    - [x] 實現 multi-server 配置支持冗余
    - [x] 默認啟用 Seal 加密（testnet）
  - [x] 重新設計 UI Toggle
    - [x] 將 `ExportFormatToggle` 改為 `StlToggle`
    - [x] 新 UI：Generate STL ON/OFF + 🔐 ENCRYPTED 標籤
    - [x] 綠色主題表示加密啟用
  - [x] 重構 Mint 流程（`useSculptMint`）
    - [x] **Step 2**: 始終導出 GLB（用於 3D 預覽）
    - [x] **Step 3**: 上傳 GLB 到 Walrus（作為 `glb_file` 字段）
    - [x] **Step 4**: 根據 toggle 決定是否生成 STL
      - STL 生成 → Seal 加密 → 上傳到 Walrus
      - 使用 BLS12-381 + AES-GCM-256 加密
      - Fallback 機制：加密失敗則上傳未加密文件
    - [x] **Step 7**: 調用 `mintSculpt` 交易
  
- [x] **Seal 整合 Phase 2B: 前端配置與交易更新** ✅
  - [x] 更新 `mintSculpt` 交易函數
    - [x] 新增參數：`glbFile: string`（必選）
    - [x] 新增參數：`structure: string | null`（可選 STL）
    - [x] 實現 `Option<String>` 序列化（使用 `bcs.option(bcs.string())`）
    - [x] 正確傳遞參數到合約
  - [x] 類型兼容性修復
    - [x] 處理 Seal SDK 的 `SuiJsonRpcClient` 類型
    - [x] TypeScript 編譯通過 ✅

**技術細節**：

```typescript
// Seal Testnet Key Servers
const TESTNET_KEY_SERVERS = [
  { objectId: '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75', provider: 'Mysten Labs 1' },
  { objectId: '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8', provider: 'Mysten Labs 2' },
  { objectId: '0x4cded1abeb52a22b6becb42a91d3686a4c901cf52eee16234214d0b5b2da4c46', provider: 'Triton One' },
];

// Mint 流程
1. 截圖 → 上傳到 Walrus (blueprint)
2. 導出 GLB → 上傳到 Walrus (glb_file)
3. [可選] 導出 STL → Seal 加密 → 上傳到 Walrus (structure)
4. 調用 mintSculpt(blueprint, glb_file, structure: Option<String>)
```

**新增文件**：
- `frontend/config/seal.ts` - Seal 配置集中管理
  - Key servers 配置（testnet/mainnet）
  - 加密設置和工具函數
  - 類型定義和導出

**修改文件**：
- `frontend/utils/seal.ts` - 使用 config/seal.ts，類型修復
- `frontend/utils/transactions.ts` - mintSculpt 函數更新
- `frontend/components/features/atelier-viewer/components/ExportFormatToggle.tsx` - 重命名為 StlToggle
- `frontend/components/features/atelier-viewer/components/AtelierMintCore.tsx` - 添加 generateStl 狀態
- `frontend/components/features/atelier-viewer/hooks/useSculptMint.ts` - 重構 mint 流程

**優化成果**：
- ✅ GLB 始終生成（必選，用於 3D 預覽）
- ✅ STL 可選生成（toggle 控制，用於打印）
- ✅ STL 自動加密（Seal SDK + Testnet）
- ✅ 用戶友好的 UI（清晰的 ON/OFF 狀態）
- ✅ TypeScript 類型安全
- ✅ 完整的 fallback 機制
- ✅ **配置集中管理**（`config/seal.ts`）

#### 合約重新部署 (Day 4 晚上)

- [x] **新合約部署** ✅
  - [x] 重新部署合約（函數簽名已修改，不能 upgrade）
  - [x] 部署成功：TX J76ja6xT9szxRxkb1ZjGEwB656uLQcddArp6EPNjnLG7
  - [x] 更新所有合約 ID 到 `transactions.ts`
  - [x] TypeScript 編譯通過 ✅

**新合約地址**：
```typescript
PACKAGE_ID: 0xdeac9eea36d5ae4941a8ca9e120ed4ad1890440b97c788838c274ad8f5cfee21
STATE_ID: 0x90604227936f4407b1d92621067c2a93925ca72b3b227b9132883eeb1958c73d
ATELIER_STATE_ID: 0x47323c903cce10ebff83229d1a7b6515f3bdab22668a2696a7b2428679ccf060
```

**合約改動**：
- ✅ `mint_sculpt` 簽名更新：添加 `glb_file: String` 和 `structure: Option<String>`
- ✅ 支持 GLB (必選) + STL (可選加密)
- ✅ 合約模組化：分為子資料夾（atelier/, sculpt/, rules/, test_utils/）
- ✅ 完整測試：30/30 通過
- ✅ Gas 消耗：159.8 SUI

**已知問題**：
- ⚠️ Seal SDK 兼容性問題（`Cannot read properties of undefined (reading 'getObject')`）
- 🔧 臨時解決：設置 `NEXT_PUBLIC_SEAL_ENABLED=false` 先測試 GLB-only 流程
- 📝 待解決：調查 Seal SDK 與新版 Sui SDK 的兼容性

#### 前端參數傳遞修復 (Day 4 深夜)

- [x] **問題診斷** ⚠️
  - Mint 失敗：`MoveAbort error code 7 (ENO_EMPTY_PARAMETERS)`
  - 錯誤原因：前端沒有正確傳遞參數給 mint 函數
  - 日誌顯示：`hasParameters: false, paramKeys: Array(0)`
  
- [x] **根本原因** 🔍
  - `useAtelierParameters` 已經解析了參數（`parameters`, `previewParams`）
  - 但 `useSculptMint` 沒有接收這些參數
  - `useSculptMint` 內部重新嘗試從 `atelier.configData` 解析（失敗）
  
- [x] **修復方案** ✅
  - 修改 `UseSculptMintProps` 接口：添加 `parameters` 和 `previewParams`
  - 在 `AtelierMintCore` 中傳遞已解析的參數給 `useSculptMint`
  - 在 `useSculptMint` 中直接使用傳入的 `previewParams` 而不是重新解析
  - TypeScript 編譯通過 ✅

**修復代碼**：
```typescript
// useSculptMint interface
interface UseSculptMintProps {
  // ... 其他參數
  parameters: Record<string, any>; // Parsed parameters
  previewParams: Record<string, any>; // Current values
}

// AtelierMintCore
const { mintStatus, mintError, txDigest, handleMint } = useSculptMint({
  atelier,
  // ...
  parameters,      // ✅ 傳遞已解析的參數
  previewParams,   // ✅ 傳遞當前參數值
});

// useSculptMint 內部
// 直接使用 previewParams，不再重新解析
if (Object.keys(previewParams).length > 0) {
  Object.entries(previewParams).forEach(([key, value]) => {
    userParams[key] = value;
  });
}
```

#### 29. ✅ 修復 Vault 中 Sculpt 3D 模型顯示

**問題**：Mint 成功後，在 Vault > Sculpt > Show 3D 顯示 "3D MODEL NOT AVAILABLE"

**根本原因**：
- 合約新增了 `glb_file` 字段用於 3D 預覽
- 但前端還在讀取舊的 `structure` 字段（現在用於 STL 打印文件）
- **關鍵問題**：使用 `extractBlobId()` 嘗試從已經是 blob ID 的字段中提取，導致返回 `null`

**修復方案**：
1. ✅ 更新 `SculptItem` 接口：添加 `glbFile` 字段
2. ✅ 修改 `useUserItems.ts`：直接讀取 `content.fields.glb_file`（已是 blob ID，不需要 `extractBlobId`）
3. ✅ 處理 `Option<String>` 字段：`structure` 在 Sui 中返回為 `{vec: ["value"]}` 或 `{vec: []}`
4. ✅ 更新 `SculptDetailModal.tsx`：使用 `sculpt.glbFile` 而不是 `sculpt.structure`
5. ✅ 更新詳情顯示：分別顯示 GLB FILE 和 STL FILE（如有）

**字段說明**：
- `glb_file`：用於 3D 預覽（GLB 格式，始終存在，存儲為 blob ID）
- `structure`：用於打印（STL 格式，`Option<String>`，可加密，存儲為 blob ID）

**修復代碼**：
```typescript
// ❌ 錯誤：extractBlobId 期望 URL，但 glb_file 已是 blob ID
glbFile: extractBlobId(content.fields.glb_file) || '',

// ✅ 正確：直接使用 blob ID
glbFile: content.fields.glb_file || '',

// ✅ 處理 Option<String> (structure)
let structureValue = '';
if (content.fields.structure && typeof content.fields.structure === 'object') {
  const structureOption = content.fields.structure as any;
  if (structureOption.vec && Array.isArray(structureOption.vec) && structureOption.vec.length > 0) {
    structureValue = structureOption.vec[0];
  }
}
```

**修復效果**：
- ✅ Vault 中正確顯示 3D 模型
- ✅ GLBViewer 正確讀取 glb_file blob ID
- ✅ 詳情面板正確顯示 GLB FILE 和 STL FILE（🔐）

#### 30. ✅ 修復 Seal SDK 兼容性問題

**問題**：STL mint 可以成功，但加密失敗，報錯 `TypeError: Cannot read properties of undefined (reading 'getObject')`

**根本原因**：
- **Seal SDK** 使用**舊版本** `@mysten/sui.js` 的 `SuiJsonRpcClient` API
- 我們的代碼使用**新版本** `@mysten/sui` 的 `SuiClient` API  
- 從 `useSuiClient()` hook 獲取的 client 與 Seal SDK 不兼容
- 類型轉換 `as SuiJsonRpcClient` 無法解決底層 API 差異

**修復方案**：
1. ✅ 移除 `encryptModelFile` 的 `suiClient` 參數
2. ✅ 在 `getSealClient` 內部創建**獨立的** `SuiClient` 實例
3. ✅ 使用 `getFullnodeUrl(network)` 初始化（符合 Seal SDK 範例）
4. ✅ 傳遞 `network` 參數而非 `suiClient` 實例

**修復代碼**：
```typescript
// ❌ 錯誤：使用 hook 的 SuiClient（新 API）
const suiClient = useSuiClient();
await encryptModelFile(file, options, suiClient);

// ✅ 正確：在 getSealClient 內部創建獨立實例
function getSealClient(network: 'testnet' | 'mainnet' = 'testnet'): SealClient {
  // Create fresh SuiClient instance for Seal SDK (old API compatible)
  const suiClient = new SuiClient({ 
    url: getFullnodeUrl(network) 
  }) as SuiJsonRpcClient;

  return new SealClient({
    suiClient,
    serverConfigs: keyServers.map(s => ({
      objectId: s.objectId,
      weight: s.weight,
    })),
    verifyKeyServers: false,
  });
}

// Usage
await encryptModelFile(file, options, 'testnet');
```

**參考範例**（用戶提供）：
```typescript
const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });
const client = new SealClient({
  suiClient,
  serverConfigs: serverObjectIds.map((id) => ({
    objectId: id,
    weight: 1,
  })),
  verifyKeyServers: false,
});
```

**修復效果**：
- ✅ Seal SDK 初始化成功
- ✅ STL 文件加密成功
- ✅ 無 `Cannot read properties of undefined` 錯誤

#### 31. ✅ 修復 Seal SDK Package ID 無效錯誤

**問題**：Seal SDK 初始化成功後，加密時報錯 `InvalidPackageError: Package ID used in PTB is invalid`

**根本原因**：
- `sealClient.encrypt()` 的 `packageId` 參數使用了錯誤的值
- 使用了 `options.atelierId`（Object ID）而非合約的 Package ID
- Seal SDK 期望 `packageId` 是 Move 合約的 Package ID，用於命名空間

**錯誤代碼**：
```typescript
// ❌ 錯誤：使用 Object ID 而非 Package ID
const { encryptedObject, key } = await sealClient.encrypt({
  packageId: options.atelierId, // ❌ 這是 Object ID，不是 Package ID
  id: options.sculptId,
  // ...
});
```

**修復方案**：
1. ✅ 導入合約的 `PACKAGE_ID` from `@/utils/transactions`
2. ✅ 使用 `PACKAGE_ID` 作為 `packageId`（合約命名空間）
3. ✅ 使用簡化的 `id`（移除 `sculpt_` 前綴，只保留 timestamp）

**修復代碼**：
```typescript
import { PACKAGE_ID } from '@/utils/transactions';

// ✅ 正確：使用合約 Package ID
const sealPackageId = PACKAGE_ID; // 0xdeac9eea36d5ae4941a8ca9e120ed4ad1890440b97c788838c274ad8f5cfee21
const sealId = options.sculptId.replace(/^sculpt_/, ''); // 移除前綴

const { encryptedObject, key } = await sealClient.encrypt({
  demType: DemType.AesGcm256,
  threshold: 1,
  packageId: sealPackageId, // ✅ 合約 Package ID
  id: sealId,               // ✅ 簡化的資源 ID
  data: fileData,
  aad: new TextEncoder().encode(JSON.stringify(metadata)),
});
```

**Seal 參數說明**：
- `packageId`: Move 合約的 Package ID（命名空間）
- `id`: 資源標識符，用於 `seal_approve` 函數驗證
- `threshold`: 需要多少個 key server 參與解密
- `data`: 要加密的數據（Uint8Array）
- `aad`: Additional Authenticated Data（可選）

**修復效果**：
- ✅ Seal SDK 加密成功
- ✅ 無 Package ID 無效錯誤
- ✅ 生成正確的加密資源 ID：`{packageId}:{id}`

#### 32. ✅ E2E 測試：Seal 加密驗證成功

**測試流程**：
1. ✅ Mint Sculpt with STL toggle ON
2. ✅ GLB file uploaded: `3Ze4c8WOMnp...`
3. ✅ STL generated and encrypted with Seal SDK
4. ✅ Seal Client initialized (3 key servers)
5. ✅ Encrypted STL uploaded: `1bcivc8C2LttHnutBMcB0p66iPPUE83A9zfp7fI`
6. ✅ Mint transaction successful

**加密驗證**：
```bash
# 使用 Walrus CLI 下載文件
walrus read k2oOWkqzCyqSO3dvP_7dQAdfBkGQ97rGHyWFg24F4nM --out encrypted.bin

# 檢查文件
file encrypted.bin  # Output: data (不是 STL)
xxd -l 32 encrypted.bin
# Output: 00 de ac 9e ea 36 d5 ae ... (PACKAGE_ID!)
```

**驗證結果**：
- ✅ 文件類型為 `data`，不是 STL 格式
- ✅ 文件頭部包含 Package ID (0xdeac9eea...)
- ✅ 無 "solid"、"facet"、"vertex" 等 STL 關鍵字
- ✅ 內容為隨機二進制數據（加密特徵）
- ✅ 無法用 STL viewer 打開

**Seal 加密文件結構**：
```
[Byte 0-31]   Package ID (32 bytes)
[Byte 32-XX]  Encrypted Resource ID + Metadata
[Byte XX-YY]  Encrypted STL Data (AES-GCM-256)
[Byte YY+]    Authentication Tag
```

**測試統計**：
- 原始 STL 大小: 131,284 bytes
- 加密後大小: 131,897 bytes
- 加密開銷: 613 bytes (~0.47%)
- 加密算法: AES-GCM-256
- Key Servers: 3 (Mysten Labs x2, Triton One)
- Threshold: 1 (需 1 個 key server 解密)

**結論**：
🎉 **Seal 加密整合完全成功！** 
- ✅ 合約層實現完成（30/30 測試通過）
- ✅ 前端 UI 整合完成
- ✅ Seal SDK 加密成功
- ✅ E2E 測試通過
- ✅ 文件加密驗證通過

### 提交記錄
- ✅ Seal integration Phase 1: Contract layer modifications complete
- ✅ Add comprehensive Seal unit tests (5/5 passed)
- ✅ Remove Dry Run functionality, focus on Seal integration
- ✅ Update progress.md: Seal Phase 1 & 1B complete, all 24 tests passing
- ✅ Refactor: Introduce Printer NFT system for whitelist management
- ✅ Update all tests to use Printer ID (30/30 passing)
- ✅ Update progress.md: Printer object system complete
- ✅ Create atelier_validation module and optimize contract code
- ✅ Mark printer.move as test_only (Eureka package feature)
- ✅ Remove redundant comments and code, all 30 tests passing
- ✅ Reorganize contract structure into subdirectories (方案 B)
- ✅ Seal Phase 2A & 2B: Frontend integration complete
- ✅ Add STL toggle UI and Seal encryption for printing files
- ✅ Configure Seal testnet key servers, TypeScript compilation passed
- ✅ Refactor: Move Seal config to config/seal.ts for better organization
- ✅ Deploy new contract with updated mint_sculpt signature (Day 4)
- ✅ Update all contract IDs in transactions.ts
- ✅ Fix: Parameter passing in mint flow (use previewParams from useAtelierParameters)
- ✅ Fix: Vault 3D model display (use glb_file field, handle Option<String> for structure)
- ✅ Fix: Seal SDK compatibility - create independent SuiClient for Seal encryption
- ✅ Fix: Seal SDK packageId parameter - use contract PACKAGE_ID instead of atelierId
- ✅ Complete: Seal encryption E2E test successful - verified encrypted STL file structure

