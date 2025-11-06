# Walrus Haulout Hackathon 開發筆記

> 這個檔案用於記錄開發過程中的技術細節、問題解決方案、程式碼片段等

---

## 📝 技術筆記

### Seal SDK 整合

#### 安裝與設置
```bash
npm install @mysten/seal
```

#### 基本用法
```typescript
// 待補充實際使用經驗
```

#### 遇到的坑
- 

---

### Kiosk SDK 使用

#### 安裝
```bash
npm install @mysten/kiosk
```

#### List 物品到 Kiosk
```typescript
import { KioskClient } from '@mysten/kiosk';

const listItem = async () => {
  const tx = new Transaction();
  tx.moveCall({
    target: `${KIOSK_PACKAGE}::kiosk::list`,
    arguments: [
      tx.object(kioskId),
      tx.object(kioskCapId),
      tx.pure.id(itemId),
      tx.pure.u64(price),
    ],
    typeArguments: [ITEM_TYPE],
  });
  return tx;
};
```

#### 購買物品
```typescript
// 待補充
```

---

### GLB Viewer 實作

#### 使用 React Three Fiber
```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const Model = ({ url }: { url: string }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};
```

#### 從 Walrus 載入 GLB
```typescript
const glbUrl = `https://aggregator.walrus-testnet.walrus.space/v1/blobs/${blobId}`;
```

---

### Sui Move 合約

#### 動態欄位使用
```move
use sui::dynamic_field;

// 新增
dynamic_field::add(&mut object.id, key, value);

// 讀取
let value: &Type = dynamic_field::borrow(&object.id, key);

// 移除
let value: Type = dynamic_field::remove(&mut object.id, key);
```

#### VecSet 操作
```move
use sui::vec_set::{Self, VecSet};

// 新增元素
vec_set::insert(&mut set, element);

// 檢查存在
vec_set::contains(&set, &element)

// 移除元素
vec_set::remove(&mut set, &element);
```

---

## 🔧 實用程式碼片段

### PTB (Programmable Transaction Block) 範例

#### 批量提取所有 Atelier 餘額
```typescript
const withdrawAllAteliers = async (ateliers: AtelierItem[]) => {
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

  const result = await signAndExecuteTransaction({ transaction: tx });
  return result;
};
```

---

### UI 組件範例

#### Drawer Modal 組件
```tsx
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  width?: string;
  children: React.ReactNode;
}

const Drawer = ({ isOpen, onClose, position = 'right', width = '500px', children }: DrawerProps) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div
        className={`fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full bg-neutral-900 z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full'
        }`}
        style={{ width }}
      >
        {children}
      </div>
    </>
  );
};
```

---

## 🎨 設計資源

### 顏色方案

#### 極簡淺色模式
```css
:root {
  --bg-primary: #fafafa;
  --bg-secondary: #f5f5f5;
  --border: #e5e5e5;
  --text-primary: #171717;
  --text-secondary: #737373;
}
```

#### 復古暗色模式（Terminal 風格）
```css
:root {
  --terminal-bg: #0a0a0a;
  --terminal-text: #00ff00;
  --terminal-border: #333333;
}
```

---

## 📦 環境變數設置

### `.env.local` 範例
```bash
# Sui Network
NEXT_PUBLIC_SUI_NETWORK=testnet

# Contract Addresses
NEXT_PUBLIC_ARCHIMETERS_PACKAGE=0x...
NEXT_PUBLIC_ATELIER_PACKAGE=0x...
NEXT_PUBLIC_SCULPT_PACKAGE=0x...
NEXT_PUBLIC_MARKETPLACE_PACKAGE=0x...

# Shared Objects
NEXT_PUBLIC_ATELIER_STATE=0x...
NEXT_PUBLIC_ARCHIMETERS_STATE=0x...

# Transfer Policies
NEXT_PUBLIC_ATELIER_POLICY=0x...
NEXT_PUBLIC_SCULPT_POLICY=0x...

# Walrus
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space

# Seal (待確認)
NEXT_PUBLIC_SEAL_KEY_SERVER=
```

---

## 🔍 除錯技巧

### Sui 交易除錯
```typescript
// 顯示完整交易內容
console.log('Transaction:', JSON.stringify(tx, null, 2));

// 執行時捕獲詳細錯誤
try {
  const result = await signAndExecuteTransaction({ transaction: tx });
  console.log('Success:', result);
} catch (error) {
  console.error('Transaction failed:', error);
  if (error.message) console.error('Error message:', error.message);
  if (error.effects) console.error('Transaction effects:', error.effects);
}
```

### Walrus 上傳除錯
```typescript
const uploadWithLogging = async (file: File) => {
  console.log('File size:', file.size);
  console.log('File type:', file.type);
  
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${WALRUS_PUBLISHER}/v1/store`, {
    method: 'PUT',
    body: formData,
  });
  
  console.log('Response status:', response.status);
  const data = await response.json();
  console.log('Response data:', data);
  
  return data.newlyCreated?.blobObject?.blobId || data.alreadyCertified?.blobId;
};
```

---

## 📚 參考資料

### 官方文檔
- [Sui Move 官方文檔](https://docs.sui.io/build/move)
- [Walrus 文檔](https://docs.walrus.site/)
- [Kiosk 標準](https://docs.sui.io/standards/kiosk)
- [Sui SDK TypeScript](https://sdk.mystenlabs.com/typescript)

### 社群資源
- [Sui Developer Discord](https://discord.gg/sui)
- [Walrus Community](https://discord.gg/walrus)
- [Sui Stack Exchange](https://sui.stackexchange.com/)

### 範例專案
- [Kiosk 範例](https://github.com/MystenLabs/sui/tree/main/sdk/kiosk)
- [TransferPolicy 範例](https://github.com/MystenLabs/sui/tree/main/examples/move/transfer-policy)

---

## 💭 待確認事項

- [ ] Seal Key Server 的正確 URL
- [ ] Pavilion Kiosk IDs 的獲取方式
- [ ] Atelier purchase 時池子餘額轉移的實現細節
- [ ] GLB 檔案大小限制（Walrus 上傳）

---

## 🎯 效能優化筆記

### 圖片載入優化
- 使用 Next.js Image 組件的 `priority` 屬性
- 實作漸進式載入（blur placeholder）
- 考慮使用 Walrus 的 CDN 快取

### 3D 模型優化
- GLB 檔案壓縮（使用 gltf-pipeline）
- Lazy loading 3D 場景
- 使用 LOD (Level of Detail)

---

## 🔐 安全檢查清單

- [ ] 合約權限檢查（assert owner）
- [ ] 前端輸入驗證
- [ ] 交易金額上限設置
- [ ] Seal 加密密鑰安全存儲
- [ ] 敏感資訊不上鏈

---

## 📸 截圖與素材

### Demo 截圖需求
- [ ] Entry Window - 註冊流程
- [ ] Publisher - 上傳 Atelier
- [ ] Gallery - 瀏覽與 Mint
- [ ] Vault - Atelier 詳情頁
- [ ] Vault - Sculpt 詳情頁（含 3D 預覽）
- [ ] Marketplace - 交易流程
- [ ] Pavilion - 復古瀏覽器介面

### 視頻腳本
1. 介紹 Archimeters 概念
2. 展示設計師上傳 Atelier（Walrus 存儲）
3. 用戶 Mint Sculpt（Seal 加密）
4. 二級市場交易
5. 3D 預覽與列印準備
6. Pavilion 整合展示

---

_最後更新: 2025-11-06_

