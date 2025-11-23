# Archimeters 🏛️

基於 Sui 區塊鏈的參數化 3D 設計平台與交易市場。創作者上傳自定義演算法，用戶透過參數調整共同創作個人化設計並 Mint 為 NFT，支持二級市場交易。採用 Seal 加密保護 IP，並連接數位設計與實體製造。

[English Version](README.md) 🌏

## 關於 🔮

Archimeters 將數位設計與實際應用連接。不同於傳統 NFT 主要依賴社群價值，我們專注於功能性實用：

- **可重複銷售的設計演算法**：創作者上傳參數化設計演算法後，每次有用戶使用該演算法 Mint Sculpt 時都能獲得收益，實現「一個演算法，多次收益」的可持續商業模式
- **用戶參與創作過程**：用戶透過調整參數主動參與創作，即時預覽效果後再 Mint，實現「共創」而非「被動購買」的體驗
- **實體製造**：數位設計可透過 Eureka 專案製造成實體產品
- **去中心化儲存**：使用 Sui Walrus 進行設計儲存，並以 Seal 加密保護

## 快速開始 🚀

1. 克隆專案並安裝依賴：
```bash
git clone https://github.com/231-Labs/archimeters.git
cd archimeters/frontend
npm install --legacy-peer-deps
```

2. 設置環境變數：
```bash
cp .env.example .env.local
```

3. 啟動開發服務器：
```bash
npm run dev
```

4. 在瀏覽器中打開 [http://localhost:3000](http://localhost:3000) 🌐

## 主要組件 ✨

### 🎨 設計師專區 — 工作室 (Publisher)
- **參數化設計創作**：創建具有可調參數的設計
- **視覺預覽**：修改參數時查看 3D 模型
- **區塊鏈發布**：在 Sui 區塊鏈上發布設計
- **版稅系統**：當他人使用您的設計時獲得費用

### 💎 收藏家空間 — 藝廊 (Gallery) 
- **瀏覽設計**：尋找並購買參數化設計
- **客製化**：調整參數以創建購買設計的變體
- **數位所有權**：將設計作為 NFT 儲存在區塊鏈上

### 🔐 資產管理 — 保險庫 (Vault)
- **設計儀表板**：在一個介面中查看和管理您的設計
- **收益追踪**：追蹤已發布設計的收入
- **製造選項**：連接 Eureka 來製作實體版本

### 💻 文檔介面 — 終端機 (Terminal)
- **技術介面**：透過終端機風格的 UI 存取文檔
- **專案資訊**：以互動格式查看團隊和功能資訊
- **命令列體驗**：使用文字命令瀏覽專案詳情

## 核心功能 ⭐

- **Kiosk 標準交易機制**：Sculpt NFT 二級市場，支持版稅自動分配
- **Seal 分層加密**：GLB 免費預覽 + STL 加密保護，平衡用戶體驗與 IP 保護
- **類型安全合約**：泛型化類型安全與參數範圍驗證，確保設計完整性
- **UI/UX 優化**：簡化 Publisher、重構 Marketplace、完善 Vault 功能

## Sui 區塊鏈集成 🔄

Archimeters 使用 Sui 區塊鏈進行：
- **Walrus 儲存**：儲存設計文件和參數
- **Seal 加密**：分層加密（GLB 預覽 + 加密 STL）保護 IP
- **Sui Move 合約**：所有權驗證、費用分配與鏈上參數驗證
- **Kiosk 協議**：標準 NFT 交易，自動版稅分配

## 技術架構 🛠️

- **Next.js 14**：前端的 React 框架
- **React Three Fiber**：參數化模型的 3D 視覺化
- **xterm.js**：終端機介面功能
- **Tailwind CSS**：UI 樣式系統
- **Three.js**：3D 模型渲染引擎

## 開發 👩‍💻

請確保在執行以下命令前，已切換到 `frontend` 目錄：

```bash
# 運行開發服務器
npm run dev

# 構建生產版本
npm run build

# 運行生產版本
npm run start

# 代碼檢查
npm run lint
```

## 未來計劃 🚀

- **AtelierCap 交易機制**：讓 3D 演算法本身也能被交易
- **AI 整合**：參數優化工具
- **製造網絡**：實體物品的生產合作夥伴關係

---

📋 **詳細變更日誌**：請參閱 [HACKATHON_SUBMISSION.md](HACKATHON_SUBMISSION.md) 了解完整的黑客松更新內容 