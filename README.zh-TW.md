# Archimeters 🏛️

基於 Sui 區塊鏈的參數化設計平台，通過功能性 3D 設計連接 NFT 與實體製造。Archimeters 提供模型配置、設計預覽功能，並使用 Sui 的 Walrus 去中心化儲存來保存資產。

[English Version](README.md) 🌏

## 關於 🔮

Archimeters 將數位設計與實際應用連接。不同於傳統 NFT 主要依賴社群價值，我們專注於功能性實用：

- **參數化設計工具**：協助設計師創建具有持續收益機會的演算法設計
- **用戶客製化**：用戶可調整參數來創建個人化設計
- **實體製造**：數位設計可透過 Eureka 專案製造成實體產品
- **去中心化儲存**：使用 Sui Walrus 進行設計儲存

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

## Sui 區塊鏈集成 🔄

Archimeters 使用 Sui 區塊鏈進行：
- **Walrus 儲存**：儲存設計文件和參數
- **[開發中] Seal 加密**：加密資產保護
- **Sui Move 合約**：所有權驗證和費用分配

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

- **鏈下計算**：額外的 3D 建模功能
- **AI 整合**：參數優化工具
- **製造網絡**：實體物品的生產合作夥伴關係

## Sui Overflow 2025 黑客松 - Progrmmable Storage 賽道 🏆

本項目正在參與 Sui Overflow 2025 黑客松的 Walrus 賽道，展示去中心化儲存對複雜設計資產的革命性潛力，並開創具有實際應用價值的數位所有權新形式。 