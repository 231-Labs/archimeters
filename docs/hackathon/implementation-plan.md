# Walrus Haulout Hackathon 功能實施計劃

> **專案**: Archimeters - 參數化 3D 設計 NFT 平台  
> **黑客松**: Walrus Haulout (11/6 - 11/16, 共 10 天)  
> **目標**: 整合 Walrus + Seal，打造完整的 3D 資產市場

---

## 📊 黑客松評分重點分析

1. **Walrus 整合創新性** ⭐⭐⭐ - 去中心化存儲 + 加密保護
2. **Seal 加密應用** ⭐⭐⭐ - 展示數據隱私保護能力
3. **技術完整度** ⭐⭐ - 完整的用戶流程和合約交互
4. **可展示性** ⭐⭐ - 視覺效果和 UX 流暢度
5. **實用價值** ⭐ - 真實的 3D 資產市場應用場景

---

## 🎯 核心價值主張

**演算法設計模板（Atelier）** → **用戶 Mint 客製化 3D 模型（Sculpt）** → **實體列印（Eureka）**

- 設計師上傳參數化演算法到 **Walrus**
- 用戶調整參數生成 3D 模型，使用 **Seal** 加密保護
- 透過二級市場交易，版稅自動分配
- 連接 Eureka 3D 列印機實現實體製造

---

## 📦 現有功能概覽

| 模組 | 功能 | 狀態 |
|------|------|------|
| **Entry** | 註冊 Membership + 創建 Kiosk | ✅ 已完成 |
| **Publisher** | 發布 Atelier（上傳演算法到 Walrus） | ✅ 已完成 |
| **Gallery** | 瀏覽 Ateliers，Mint Sculpts | ✅ 已完成 |
| **Vault** | 管理持有的 Ateliers 和 Sculpts | ✅ 已完成 |
| **Terminal** | 文檔介面 | ✅ 已完成 |

---

## 🚀 P0 - 核心功能（必須完成，展示 Walrus 價值）

### 1️⃣ Seal SDK 完整整合

**目標**: 展示 Walrus + Seal 對 3D 資產的加密保護能力

#### 1.1 前端 Sculpt 加密上傳

**檔案**: `frontend/components/features/atelier-viewer/hooks/useSculptMint.ts`

- 安裝 `@mysten/seal` SDK
- 在 Line 66-82 已有 extension point，實現加密邏輯
- 加密流程：
  ```typescript
  // 生成 Seal 密鑰
  const sealKey = await generateSealKey();
  
  // 加密 STL 檔案
  const encryptedBlob = await encryptFile(modelFile, sealKey);
  
  // 上傳加密檔案到 Walrus
  const blobId = await uploadToWalrus(encryptedBlob);
  
  // 在 Sculpt metadata 記錄加密資訊
  ```

#### 1.2 Move 合約新增 Seal 授權

**檔案**: `contract/sources/sculpt.move`

```move
// 新增欄位到 Sculpt struct (Line 42-53)
public struct Sculpt<phantom ATELIER> has key, store {
    // ... existing fields
    printer_whitelist: VecSet<ID>,  // 新增：授權的 Printer IDs
    encrypted: bool,                 // 新增：是否加密
}

// 新增授權函數
public fun add_printer_to_whitelist<T>(
    sculpt: &mut Sculpt<T>,
    printer_id: ID,
    ctx: &TxContext
) {
    assert!(sculpt.owner == ctx.sender(), ENO_PERMISSION);
    vec_set::insert(&mut sculpt.printer_whitelist, printer_id);
}

// Getter
public fun is_printer_authorized<T>(sculpt: &Sculpt<T>, printer_id: ID): bool {
    vec_set::contains(&sculpt.printer_whitelist, &printer_id)
}
```

#### 1.3 Eureka 端解密（另一專案）

**位置**: Eureka 專案（獨立處理）

- Rust SDK 整合 Seal 解密
- 從 Seal Key Server 取得密鑰
- 驗證 Printer 在白名單中
- 解密 STL 後執行切片流程

---

### 2️⃣ Sculpt 二級市場（透過 Kiosk）

**目標**: 完整的 NFT 交易流程，遵守版稅規則

#### 2.1 Sculpt Marketplace Hook

**新建檔案**: `frontend/components/features/vault/hooks/useSculptMarketplace.ts`

```typescript
export const useSculptMarketplace = () => {
  // List Sculpt for sale
  const listSculpt = async (sculptId: ID, price: number, kioskId: ID, kioskCapId: ID) => {
    // 使用 @mysten/kiosk SDK
    const tx = new Transaction();
    tx.moveCall({
      target: `${KIOSK_PACKAGE}::kiosk::list`,
      arguments: [tx.object(kioskId), tx.object(kioskCapId), tx.pure.id(sculptId), tx.pure.u64(price)],
      typeArguments: [`${SCULPT_PACKAGE}::sculpt::Sculpt<${ATELIER_TYPE}>`],
    });
    return tx;
  };

  // Purchase Sculpt (含版稅計算)
  const purchaseSculpt = async (kioskId: ID, sculptId: ID, price: number) => {
    // Kiosk SDK 自動處理版稅
    // ...
  };

  return { listSculpt, purchaseSculpt, delistSculpt };
};
```

#### 2.2 市場瀏覽頁面

**選項 A**: 在 Gallery 新增 "Marketplace" Tab  
**選項 B**: 新建獨立 `MarketplaceWindow.tsx`

- 使用 Kiosk SDK 索引當前出售中的 Sculpts
- 顯示：縮圖、價格、作者、Atelier 來源
- 點擊後進入購買流程（含版稅說明）

---

### 3️⃣ Atelier 二級市場

**目標**: 設計模板的交易，包含手續費和池子餘額轉移

#### 3.1 合約功能補充

**檔案**: `contract/sources/atelier_marketplace.move`

檢查清單：
- ✅ `purchase_atelier` 函數已存在（Line 74-108）
- ✅ 已有 `update_owner_on_purchase` 調用（Line 98）
- ⚠️ 需確認：購買時是否轉移池子餘額給原 Owner？

**可能需要新增**:
```move
// 在 purchase_atelier 中，購買前先提取池子
public fun purchase_atelier_with_pool_transfer<T>(
    kiosk: &mut Kiosk,
    atelier: &mut Atelier<T>,
    pool: &mut AtelierPool<T>,
    atelier_id: ID,
    payment: Coin<SUI>,
    royalty_payment: Coin<SUI>,
    policy: &TransferPolicy<Atelier<T>>,
    ctx: &mut TxContext
) {
    let old_owner = atelier::get_current_owner(atelier);
    let pool_balance = atelier::get_pool_balance(pool);
    
    // 先提取池子餘額給原 Owner
    if (pool_balance > 0) {
        atelier::withdraw_pool(atelier, pool, pool_balance, old_owner, ctx);
    };
    
    // 再執行購買
    // ... existing purchase logic
}
```

#### 3.2 前端市場功能

**新建檔案**: `frontend/components/features/marketplace/hooks/useAtelierMarketplace.ts`

---

## 🎨 P1 - 高優先級功能（提升展示效果）

### 4️⃣ Vault - My Atelier 詳情頁

**設計決策**: 點擊 Atelier Item → 開啟右側 Drawer Modal（更符合現代 UX）

#### 4.1 Atelier 詳情 Modal 組件

**新建檔案**: `frontend/components/features/vault/components/AtelierDetailModal.tsx`

```tsx
interface AtelierDetailModalProps {
  atelier: AtelierItem;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const AtelierDetailModal = ({ atelier, isOpen, onClose, onUpdate }: AtelierDetailModalProps) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="right" width="600px">
      {/* Header: 封面圖 + 標題 */}
      <div className="relative h-64">
        <Image src={atelier.photoBlobId} alt={atelier.title} />
        <h2>{atelier.title}</h2>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <Stat label="Sculpts Minted" value={atelier.artificials.length} />
        <Stat label="Total Sales" value={calculateTotalSales()} />
        <Stat label="Pool Balance" value={`${atelier.pool / MIST_PER_SUI} SUI`} />
      </div>

      {/* Derived Sculpts Grid */}
      <section>
        <h3>Derived Sculpts ({atelier.artificials.length})</h3>
        <div className="grid grid-cols-3 gap-2">
          {sculpts.map(sculpt => (
            <SculptThumbnail key={sculpt.id} sculpt={sculpt} />
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-2">
        <ListButton atelier={atelier} />
        <WithdrawButton atelier={atelier} onSuccess={onUpdate} />
      </div>
    </Drawer>
  );
};
```

#### 4.2 索引 Derived Sculpts

使用 `atelier.artificials: vector<ID>` 欄位：

```typescript
const useDerivedSculpts = (atelierArtificials: ID[]) => {
  const [sculpts, setSculpts] = useState<Sculpt[]>([]);

  useEffect(() => {
    // 使用 Sui SDK multiGetObjects
    const fetchSculpts = async () => {
      const response = await suiClient.multiGetObjects({
        ids: atelierArtificials,
        options: { showContent: true, showDisplay: true },
      });
      setSculpts(response.map(parseScult));
    };
    fetchSculpts();
  }, [atelierArtificials]);

  return sculpts;
};
```

#### 4.3 一鍵 Withdraw All

**位置**: `VaultWindow.tsx` 頂部新增按鈕

```typescript
const handleWithdrawAll = async () => {
  const tx = new Transaction();
  
  ateliers.forEach(atelier => {
    if (Number(atelier.pool) > 0) {
      tx.moveCall({
        target: `${ATELIER_PACKAGE}::atelier::withdraw_pool`,
        arguments: [
          tx.object(atelier.id),
          tx.object(atelier.poolId),
          tx.pure.u64(atelier.pool),
          tx.pure.address(currentAccount.address),
        ],
        typeArguments: [ATELIER_TYPE],
      });
    }
  });

  await signAndExecuteTransaction({ transaction: tx });
};
```

---

### 5️⃣ Vault - My Sculpt 詳情頁

**設計決策**: 點擊 Sculpt Item → 開啟 Drawer Modal（與 Atelier 一致）

#### 5.1 Sculpt 詳情 Modal 組件

**新建檔案**: `frontend/components/features/vault/components/SculptDetailModal.tsx`

```tsx
export const SculptDetailModal = ({ sculpt, isOpen, onClose }: SculptDetailModalProps) => {
  return (
    <Drawer isOpen={isOpen} onClose={onClose} position="right" width="700px">
      {/* 3D GLB Viewer */}
      <div className="h-96">
        <GLBViewer blobId={sculpt.structure} />
      </div>

      {/* Info */}
      <div className="p-4">
        <h2>{sculpt.alias}</h2>
        <p>Creator: {sculpt.creator}</p>
        <p>Current Kiosk: {sculpt.kioskId}</p>
        
        {/* Parameters */}
        <ParameterList parameters={sculpt.parameters} />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <TransferKioskButton sculpt={sculpt} />
        <ListButton sculpt={sculpt} />
        <PrintButton sculpt={sculpt} />
      </div>
    </Drawer>
  );
};
```

#### 5.2 GLB Viewer 組件

**新建檔案**: `frontend/components/3d/GLBViewer.tsx`

```tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

export const GLBViewer = ({ blobId }: { blobId: string }) => {
  const glbUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;
  
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} />
      <Model url={glbUrl} />
      <OrbitControls />
    </Canvas>
  );
};
```

#### 5.3 Kiosk 轉換功能

```typescript
const useKioskTransfer = () => {
  const { kiosks } = useKiosk(); // 取得用戶所有 Kiosks

  const transferToKiosk = async (sculptId: ID, fromKioskId: ID, toKioskId: ID, kioskCaps: { from: ID, to: ID }) => {
    const tx = new Transaction();
    
    // Step 1: Take from source kiosk
    const sculpt = tx.moveCall({
      target: `${KIOSK_PACKAGE}::kiosk::take`,
      arguments: [tx.object(fromKioskId), tx.object(kioskCaps.from), tx.pure.id(sculptId)],
      typeArguments: [SCULPT_TYPE],
    });

    // Step 2: Place in target kiosk
    tx.moveCall({
      target: `${KIOSK_PACKAGE}::kiosk::place`,
      arguments: [tx.object(toKioskId), tx.object(kioskCaps.to), sculpt],
      typeArguments: [SCULPT_TYPE],
    });

    return tx;
  };

  return { kiosks, transferToKiosk };
};
```

---

### 6️⃣ Gallery 頁面優化

#### 6.1 List/Gallery 模式切換

**修改檔案**: `frontend/components/windows/BrowseWindow.tsx`

```tsx
const BrowseWindow = () => {
  const [viewMode, setViewMode] = useState<'gallery' | 'list'>('gallery');

  return (
    <div>
      {/* Mode Toggle - 與 Vault Tabs 統一風格 */}
      <div className="flex border-b border-neutral-700">
        <button
          onClick={() => setViewMode('gallery')}
          className={viewMode === 'gallery' ? 'active' : ''}
        >
          Gallery
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'active' : ''}
        >
          List
        </button>
      </div>

      {viewMode === 'gallery' ? (
        <MasonryGallery images={images} />
      ) : (
        <ListView images={images} />
      )}
    </div>
  );
};
```

#### 6.2 Trending 排序

```typescript
const [sortMode, setSortMode] = useState<'latest' | 'trending'>('latest');

const sortedImages = useMemo(() => {
  if (sortMode === 'trending') {
    return [...images].sort((a, b) => 
      b.artificials.length - a.artificials.length
    );
  }
  return images; // 原本按時間排序
}, [images, sortMode]);
```

顯示熱門標記：
```tsx
{atelier.artificials.length > 10 && (
  <span className="absolute top-2 right-2 text-xl">🔥</span>
)}
```

#### 6.3 新 Mint 頁面樣式

**設計靈感**: 參考 SWAIN Ceramics 網站
- 極簡白/灰色調
- 細線邊框
- 大標題 + 表格式資訊展示
- 緊湊版型（減少垂直空間）

**新建檔案**: `frontend/components/templates/MinimalTemplate.tsx`

```tsx
export const MinimalTemplate = ({ atelier, onMint }: MintTemplateProps) => {
  return (
    <div className="bg-neutral-50 text-neutral-900 min-h-screen">
      {/* Header */}
      <header className="border-b border-neutral-300 py-8">
        <h1 className="text-6xl font-light tracking-tight uppercase text-center">
          {atelier.title}
        </h1>
      </header>

      {/* Content: 2-column layout */}
      <div className="grid grid-cols-2 gap-8 p-8">
        {/* Left: 3D Preview */}
        <div className="border border-neutral-300">
          <ParametricScene {...atelier} />
        </div>

        {/* Right: Info Table */}
        <div>
          <table className="w-full border-collapse">
            <tbody>
              <tr className="border-b border-neutral-300">
                <td className="py-3 font-medium">CREATOR</td>
                <td className="py-3">{atelier.author}</td>
              </tr>
              <tr className="border-b border-neutral-300">
                <td className="py-3 font-medium">PRICE</td>
                <td className="py-3">{atelier.price} SUI</td>
              </tr>
              {/* Parameters */}
              {Object.entries(atelier.parameters).map(([key, param]) => (
                <tr key={key} className="border-b border-neutral-300">
                  <td className="py-3 font-medium">{param.label}</td>
                  <td className="py-3">
                    <input type="range" {...param} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mint Button */}
          <button
            onClick={onMint}
            className="w-full mt-8 py-4 border border-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
          >
            MINT SCULPT
          </button>
        </div>
      </div>
    </div>
  );
};
```

**在 Design Publisher 中選擇樣式**:

修改 `frontend/components/features/design-publisher/hooks/useDesignPublisherForm.ts`:
```typescript
const [selectedTemplate, setSelectedTemplate] = useState<'default' | 'minimal' | 'elegant'>('default');

// 在 metadata 中記錄
metadata.template = selectedTemplate;
```

---

### 7️⃣ Pavilion 功能接入

**目標**: 展示 Walrus Sites 整合

#### 7.1 UI 入口設置

**修改檔案**: `frontend/components/layout/Dock.tsx`

在 Line 72 後新增：
```tsx
<div className="group relative transition-transform hover:scale-110 duration-200 px-3 py-2">
  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-[rgba(0,0,0,0.8)] rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap">
    <span className="text-white/90 text-xs">Pavilion</span>
  </div>
  <img
    onClick={() => handleIconClick('pavilion')}
    src="/pavilion.png"
    className="w-11 h-11 flex items-center justify-center transition-all duration-200"
  />
</div>
```

**修改檔案**: `frontend/config/windows.ts`

```typescript
'pavilion': {
  title: 'Pavilion',
  defaultSize: { width: 900, height: 700 },
  resizable: true,
},
```

#### 7.2 Pavilion 窗口組件

**新建檔案**: `frontend/components/windows/PavilionWindow.tsx`

```tsx
import { useState } from 'react';
import { PAVILION_KIOSKS } from '@/config/pavilion';

export default function PavilionWindow() {
  const [selectedKiosk, setSelectedKiosk] = useState<string | null>(null);

  return (
    <div className="flex h-full bg-[#1a1a1a]">
      {/* Left Sidebar: Pavilion List */}
      <div className="w-64 border-r border-neutral-700 overflow-y-auto">
        <div className="p-4">
          <h2 className="text-white text-lg mb-4 font-mono">PAVILIONS</h2>
          {PAVILION_KIOSKS.map(pavilion => (
            <button
              key={pavilion.kioskId}
              onClick={() => setSelectedKiosk(pavilion.kioskId)}
              className={`w-full text-left p-3 mb-2 border border-neutral-700 rounded hover:bg-neutral-800 transition-colors ${
                selectedKiosk === pavilion.kioskId ? 'bg-neutral-800' : ''
              }`}
            >
              <div className="text-white text-sm font-medium">{pavilion.name}</div>
              <div className="text-neutral-500 text-xs mt-1 font-mono">
                {pavilion.kioskId.slice(0, 8)}...
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right: Browser Frame */}
      <div className="flex-1 flex flex-col">
        {/* Browser Chrome */}
        <div className="bg-neutral-900 border-b border-neutral-700 p-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 bg-neutral-800 rounded px-3 py-1 text-xs text-neutral-400 font-mono">
            {selectedKiosk 
              ? `pavilion-231.vercel.app/pavilion/visit?kioskId=${selectedKiosk}`
              : 'Select a pavilion to visit'
            }
          </div>
        </div>

        {/* iframe Content */}
        <div className="flex-1 bg-white">
          {selectedKiosk ? (
            <iframe
              src={`https://pavilion-231.vercel.app/pavilion/visit?kioskId=${selectedKiosk}`}
              className="w-full h-full border-0"
              title="Pavilion Viewer"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">
              Select a pavilion from the list
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 7.3 Pavilion 配置檔案

**新建檔案**: `frontend/config/pavilion.ts`

```typescript
export interface PavilionConfig {
  name: string;
  kioskId: string;
  description?: string;
}

export const PAVILION_KIOSKS: PavilionConfig[] = [
  {
    name: 'Example Pavilion 1',
    kioskId: '0x010fb58982e0e1947103b227cea5f33bcbb4ba073e558d6ef92aa927e370f300',
    description: 'Demo pavilion for testing',
  },
  // 之後新增更多 Pavilions
];
```

---

## 🔧 P2 - 中優先級（用戶體驗優化）

### 8️⃣ 其他優化

#### 8.1 簡化註冊流程提示語

**修改檔案**: `frontend/components/windows/EntryWindow.tsx`

```tsx
// 更新 placeholder 和說明文字
<input
  placeholder="Your creator name (e.g., 'Alice_Designer')"
  // ...
/>
<textarea
  placeholder="Describe yourself as a parametric designer or 3D asset collector..."
  // ...
/>

<p className="text-sm text-neutral-400">
  Join Archimeters - the <span className="font-semibold">3D Assets Algorithm Marketplace</span>.
  Create parametric designs, trade algorithmic templates, and connect to physical manufacturing.
</p>
```

#### 8.2 修復餘額顯示問題

**修改檔案**: `frontend/components/windows/VaultWindow.tsx`

在 Line 146 附近：
```tsx
// 原本
<span>Fee Pool: {Number((atelier as AtelierItem).pool) / MIST_PER_SUI} SUI</span>

// 改為
<span>
  Fee Pool: {formatSuiAmount(Number((atelier as AtelierItem).pool))}
</span>
```

**新建工具函數**: `frontend/utils/formatters.ts`
```typescript
export const formatSuiAmount = (mist: number): string => {
  const sui = mist / MIST_PER_SUI;
  
  if (sui >= 1) {
    return `${sui.toFixed(2)} SUI`;
  } else if (sui > 0) {
    return `${sui.toFixed(4)} SUI`;
  } else {
    return '0 SUI';
  }
};
```

---

## 📅 實施時間線（10 天）

### **Day 1-2** (11/6-11/7) - P0 合約開發
- [ ] Seal 授權函數（sculpt.move）
- [ ] Atelier marketplace 合約補充（池子轉移邏輯）
- [ ] 合約測試
- [ ] 部署到 testnet

### **Day 3-4** (11/8-11/9) - P0 前端核心
- [ ] 安裝並整合 Seal SDK
- [ ] 實現 STL 加密上傳邏輯
- [ ] Sculpt 二級市場基礎功能（List/Purchase）
- [ ] Atelier 二級市場基礎功能

### **Day 5-6** (11/10-11/11) - P1 Vault 詳情頁
- [ ] Atelier 詳情 Modal 組件
- [ ] Derived Sculpts 索引與顯示
- [ ] 一鍵 Withdraw All 功能
- [ ] Sculpt 詳情 Modal 組件
- [ ] GLB Viewer 組件
- [ ] Kiosk 轉換功能

### **Day 7-8** (11/12-11/13) - P1 Gallery + Pavilion
- [ ] Gallery List/Gallery 模式切換
- [ ] Trending 排序功能
- [ ] 新 Mint 頁面樣式（Minimal Template）
- [ ] Design Publisher 樣式選擇功能
- [ ] Pavilion 窗口完整實現

### **Day 9** (11/14) - P2 優化與測試
- [ ] 註冊流程優化
- [ ] 餘額顯示修復
- [ ] 整體功能測試
- [ ] Bug 修復

### **Day 10** (11/15-11/16) - Demo 準備
- [ ] 最終測試
- [ ] 準備 Demo 腳本
- [ ] 錄製展示視頻
- [ ] 截圖素材準備
- [ ] 提交黑客松

---

## 🛠 技術依賴與資源

### NPM 套件
```bash
npm install @mysten/seal          # Seal 加密 SDK
npm install @mysten/kiosk         # Kiosk 市場功能
npm install @react-three/drei     # 3D 輔助工具（GLB Viewer）
npm install react-hot-toast       # 通知提示（可選）
```

### 合約地址配置

**新建檔案**: `frontend/config/contracts.ts`
```typescript
export const CONTRACTS = {
  ARCHIMETERS_PACKAGE: process.env.NEXT_PUBLIC_ARCHIMETERS_PACKAGE,
  ATELIER_PACKAGE: process.env.NEXT_PUBLIC_ATELIER_PACKAGE,
  SCULPT_PACKAGE: process.env.NEXT_PUBLIC_SCULPT_PACKAGE,
  MARKETPLACE_PACKAGE: process.env.NEXT_PUBLIC_MARKETPLACE_PACKAGE,
  ATELIER_STATE: process.env.NEXT_PUBLIC_ATELIER_STATE,
  TRANSFER_POLICY: {
    ATELIER: process.env.NEXT_PUBLIC_ATELIER_POLICY,
    SCULPT: process.env.NEXT_PUBLIC_SCULPT_POLICY,
  },
};
```

### Walrus 配置
- Aggregator URL: `https://aggregator.walrus-testnet.walrus.space`
- Publisher Endpoint: 待確認
- Seal Key Server: 待確認

---

## 📊 成功指標

### 核心功能完成度
- [x] Seal 整合：STL 加密上傳 + 合約授權機制
- [x] 二級市場：Sculpt 和 Atelier 完整交易流程
- [x] Vault 詳情：數據展示完整、操作流暢
- [x] 視覺優化：新樣式優雅、符合黑客松展示需求

### 黑客松展示重點
1. **Walrus 創新應用** ✅ - 去中心化存儲 3D 資產 + 演算法
2. **Seal 加密保護** ✅ - 展示 STL 檔案加密保護流程
3. **完整用戶流程** ✅ - 設計 → Mint → 交易 → 列印
4. **實用價值** ✅ - 真實的 3D 資產市場用例

---

## ⚠️ 風險與應對策略

### 風險 1: Seal SDK 文檔不完整
**應對**: 
- 預留 Day 3 全天學習 Seal SDK
- 準備降級方案：先完成無加密版本
- 聯繫 Walrus 社群尋求幫助

### 風險 2: Kiosk SDK 學習曲線
**應對**:
- 優先閱讀 [Kiosk 官方文檔](https://docs.sui.io/standards/kiosk)
- 參考 Scallop Kit 範例代碼
- 可考慮使用 Kiosk 社群模板

### 風險 3: Eureka 解密時間不足
**應對**:
- 前端先完成加密上傳，確保可展示
- Eureka 端解密可黑客松後補充
- Demo 時著重展示前端加密流程

### 風險 4: 時間不足
**優先策略**:
- **必須完成**: P0 全部（Seal + 二級市場）
- **盡量完成**: P1 部分（Vault 詳情頁）
- **可犧牲**: P2 全部（優化項目）

---

## 🎯 恢復記憶用快速摘要

**專案**: Archimeters - 參數化 3D 設計 NFT 平台  
**黑客松**: Walrus Haulout (11/6-11/16)  
**核心流程**: 演算法設計模板（Atelier）→ 用戶 Mint 客製化 3D 模型（Sculpt）→ 實體列印（Eureka）

**現有功能**: Entry, Publisher, Gallery, Vault, Terminal 已完成  
**本次新增**:
- **P0 核心**: Seal 加密、Sculpt/Atelier 二級市場
- **P1 高優先**: Vault 詳情頁、Gallery 優化、Pavilion 接入
- **P2 中優先**: 註冊優化、餘額顯示修復

**技術棧**: Next.js 14 + Sui Move + Walrus + Seal + Kiosk SDK  
**關鍵檔案**:
- 合約: `contract/sources/{atelier,sculpt,atelier_marketplace}.move`
- Mint: `frontend/components/features/atelier-viewer/hooks/useSculptMint.ts`
- Vault: `frontend/components/windows/VaultWindow.tsx`
- Gallery: `frontend/components/windows/BrowseWindow.tsx`

**下一步**: 執行 Day 1-2 的 P0 合約開發任務。

