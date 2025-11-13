# Day 3 任務清單 - Marketplace 重構 & 流程優化

> 日期: 2025-11-08 (Fri)  
> 預計時間: 7.5 小時

---

## 📋 任務概覽

| 任務 | 優先級 | 預計時間 | 狀態 |
|------|--------|----------|------|
| 1. Marketplace 重構 (階段 1-2) | P0 | 2h | ⏳ |
| 2. Mint Dry Run 驗證 | P0 | 1h | ⏳ |
| 3. Seal SDK 加密 STL | P0 | 1.5h | ⏳ |
| 4. Publisher UI 重設計 | P1 | 2h | ⏳ |
| 5. Marketplace UI 統一 | P1 | 1h | ⏳ |

---

## 🎯 任務 1: Gallery → Marketplace 重構

### 目標
將 Gallery 重新定位為完整的 Marketplace，整合瀏覽、Mint、交易功能

### 實施步驟

#### 階段 1: 重命名與路由 (30min)

```bash
# 文件重命名
frontend/components/windows/GalleryWindow.tsx → MarketplaceWindow.tsx
frontend/hooks/useGalleryData.ts → useMarketplaceData.ts

# 需要更新的文件
- frontend/components/common/Dock.tsx (icon label)
- frontend/app/page.tsx (route)
- All import statements
```

#### 階段 2: Kiosk SDK 整合 (1h)

**關鍵 API**:
```typescript
// Kiosk SDK - 獲取已上架的物品
import { KioskClient } from '@mysten/kiosk';

// 僅獲取 Listed Sculpts
const kioskClient = new KioskClient({...});
const listedSculpts = await kioskClient.getListedItems({
  type: 'Sculpt',
  // 可選過濾條件
});
```

**需要修改的 Hook**:
```typescript
// frontend/hooks/useMarketplaceData.ts
export function useMarketplaceData() {
  // Ateliers: 保持現有邏輯（索引所有）
  const ateliers = useQuery(...);
  
  // Sculpts: 改用 Kiosk SDK（僅 listed）
  const sculpts = useQuery({
    queryKey: ['listed-sculpts'],
    queryFn: async () => {
      const kiosk = new KioskClient({...});
      return await kiosk.getListedItems({...});
    }
  });
  
  return { ateliers, sculpts };
}
```

#### 階段 3: UI 復古風格統一 (1h)

**復用組件**:
- `RetroTabs` (Ateliers / Sculpts 切換)
- `RetroPanel` (卡片容器)
- Grid/List 切換 (來自 Vault)

**布局參考**:
```tsx
<MarketplaceWindow>
  <RetroTabs>
    <Tab value="ateliers">
      <ViewToggle /> {/* Grid / List */}
      <Masonry / List>
        <AtelierCard onClick={openDetailModal} />
      </Masonry>
    </Tab>
    
    <Tab value="sculpts">
      <ViewToggle />
      <Masonry / List>
        <SculptCard onClick={openDetailModal} />
      </Masonry>
    </Tab>
  </RetroTabs>
</MarketplaceWindow>
```

#### 階段 4: Detail Modal 整合 (30min)

**Atelier Detail Modal**:
- 添加 "Mint from this Atelier" 按鈕
- 點擊後打開 Mint 流程（選擇參數）

**Sculpt Detail Modal**:
- 顯示價格和賣家信息
- 添加 "Purchase" 按鈕
- 顯示 Kiosk 相關信息

---

## 🔒 任務 2: Mint 流程優化

### 新流程架構

```
用戶操作流程:
1. 在 Marketplace 選擇 Atelier → 點擊 Detail
2. 點擊 "Mint from this Atelier"
3. 配置參數
4. [系統] Dry Run 驗證參數 ✨
5. [系統] Seal SDK 加密 STL ✨
6. [系統] 上傳到 Walrus
7. [系統] 執行 Mint 交易
```

### 實施細節

#### A. Dry Run 驗證 (1h)

**Sui SDK API**:
```typescript
import { Transaction } from '@mysten/sui/transactions';

// Dry run without executing
async function dryRunMint(
  tx: Transaction,
  sender: string
): Promise<DryRunResult> {
  const result = await suiClient.dryRunTransactionBlock({
    transactionBlock: await tx.build({ client: suiClient }),
    sender,
  });
  
  if (result.effects.status.status !== 'success') {
    throw new Error(result.effects.status.error || 'Validation failed');
  }
  
  return result;
}
```

**useSculptMint.ts 修改**:
```typescript
export function useSculptMint() {
  const mintSculpt = async (params) => {
    try {
      // Step 1: Build transaction
      const tx = buildMintTransaction(params);
      
      // Step 2: Dry run validation ✨ NEW
      setStatus('validating');
      await dryRunMint(tx, address);
      
      // Step 3: Seal encryption ✨ NEW
      setStatus('encrypting');
      const encryptedSTL = await sealSDK.encrypt(stlFile);
      
      // Step 4: Upload to Walrus
      setStatus('uploading');
      const blobId = await walrus.upload(encryptedSTL);
      
      // Step 5: Execute transaction
      setStatus('minting');
      await signAndExecute(tx);
      
    } catch (error) {
      // 詳細錯誤處理
    }
  };
}
```

#### B. Seal SDK 加密 (1.5h)

**研究需求**:
- Seal SDK 文檔閱讀
- 加密 API 調用方式
- 錯誤處理

**創建加密工具**:
```typescript
// frontend/utils/sealEncryption.ts

import { SealSDK } from '@seal/sdk'; // 假設的 import

export async function encryptSTL(
  file: File,
  onProgress?: (percent: number) => void
): Promise<EncryptedFile> {
  try {
    const seal = new SealSDK({...});
    
    const encrypted = await seal.encrypt(file, {
      onProgress: (loaded, total) => {
        onProgress?.(loaded / total * 100);
      }
    });
    
    return encrypted;
  } catch (error) {
    console.error('Seal encryption failed:', error);
    throw new Error('Failed to encrypt STL file');
  }
}

export async function decryptSTL(
  encryptedFile: EncryptedFile
): Promise<File> {
  // 解密邏輯（用於驗證或預覽）
}
```

**UI 狀態顯示**:
```typescript
// 在 Modal 中顯示進度
{status === 'encrypting' && (
  <RetroPanel variant="inset" className="p-4">
    <p className="text-sm font-mono mb-2">ENCRYPTING STL FILE...</p>
    <div className="w-full bg-[#0a0a0a] h-2">
      <div 
        className="bg-white/80 h-full transition-all"
        style={{ width: `${encryptProgress}%` }}
      />
    </div>
  </RetroPanel>
)}
```

---

## 🎨 任務 3: Publisher 復古 UI 重設計

### 目標
簡化上傳流程，單頁完成所有操作

### 新 UI 設計

```
┌──────────────────────────────────────────────┐
│ Publisher - Create New Atelier               │
├────────────────────┬─────────────────────────┤
│                    │ UPLOAD FILES            │
│                    │ ┌─────────────────────┐ │
│                    │ │ Drag STL here       │ │
│   GLB Preview      │ │ or click to browse  │ │
│   (GLBViewer)      │ └─────────────────────┘ │
│                    │                         │
│   Real-time        │ ✓ model.stl (2.3 MB)   │
│   preview of       │                         │
│   uploaded GLB     │ ┌─────────────────────┐ │
│                    │ │ Drag GLB here       │ │
│                    │ └─────────────────────┘ │
│                    │                         │
│                    │ ✓ preview.glb (1.8 MB)  │
│                    │                         │
│                    │ BASIC INFO              │
│                    │ Title: [________]       │
│                    │ Description: [______]   │
│                    │                         │
│                    │ PARAMETERS              │
│                    │ + Add Parameter         │
│                    │                         │
│                    │ [Publish Atelier]       │
└────────────────────┴─────────────────────────┘
```

### 實施步驟 (2h)

#### 1. 組件結構
```typescript
// PublisherWindow.tsx
<div className="grid grid-cols-2 gap-4 h-full p-4">
  {/* Left: Preview */}
  <div className="flex items-center justify-center">
    <RetroPanel variant="inset" className="w-full h-full">
      {glbFile ? (
        <GLBViewer blobUrl={URL.createObjectURL(glbFile)} />
      ) : (
        <EmptyPreview />
      )}
    </RetroPanel>
  </div>
  
  {/* Right: Form */}
  <div className="space-y-4 overflow-y-auto">
    <FileUploadZone
      label="STL FILE"
      accept=".stl"
      onUpload={setStlFile}
    />
    
    <FileUploadZone
      label="GLB PREVIEW"
      accept=".glb"
      onUpload={setGlbFile}
    />
    
    <FileUploadZone
      label="COVER IMAGE"
      accept="image/*"
      onUpload={setCoverImage}
    />
    
    <RetroPanel variant="inset" className="p-4">
      <h3 className="text-sm font-mono mb-2">BASIC INFO</h3>
      <RetroInput placeholder="Title" {...} />
      <RetroInput placeholder="Description" {...} />
    </RetroPanel>
    
    <RetroPanel variant="inset" className="p-4">
      <h3 className="text-sm font-mono mb-2">PARAMETERS</h3>
      <ParameterConfigurator {...} />
    </RetroPanel>
    
    <RetroButton
      variant="primary"
      size="lg"
      onClick={handlePublish}
    >
      PUBLISH ATELIER
    </RetroButton>
  </div>
</div>
```

#### 2. FileUploadZone 組件
```typescript
// 可復用的拖放上傳組件
<RetroPanel 
  variant="inset" 
  className="p-6 text-center cursor-pointer hover:bg-white/5"
  onDragOver={...}
  onDrop={...}
  onClick={...}
>
  {file ? (
    <>
      <p className="text-sm font-mono text-white/90">
        ✓ {file.name}
      </p>
      <p className="text-xs font-mono text-white/50">
        {formatFileSize(file.size)}
      </p>
    </>
  ) : (
    <>
      <p className="text-sm font-mono text-white/70">
        Drag {label} here
      </p>
      <p className="text-xs font-mono text-white/40">
        or click to browse
      </p>
    </>
  )}
</RetroPanel>
```

---

## 📚 技術研究清單

### Kiosk SDK
- [ ] 閱讀官方文檔
- [ ] 理解 Listed Items API
- [ ] 測試查詢方法

**參考**:
- https://docs.sui.io/standards/kiosk
- https://github.com/MystenLabs/sui/tree/main/sdk/kiosk

### Sui SDK - Dry Run
- [ ] 研究 `dryRunTransactionBlock` API
- [ ] 理解錯誤返回格式
- [ ] 測試參數驗證

**參考**:
- https://sdk.mystenlabs.com/typescript/transaction-building/basics

### Seal SDK
- [ ] 找到 Seal SDK 文檔
- [ ] 理解加密流程
- [ ] 測試文件加密/解密

**參考**:
- Walrus 官方文檔
- 需要確認 Seal SDK 是否存在或使用 Walrus 原生加密

---

## ✅ 完成檢查清單

### Marketplace 重構
- [ ] 文件重命名完成
- [ ] Dock icon 更新
- [ ] Kiosk SDK 整合
- [ ] 僅顯示 Listed Sculpts
- [ ] UI 使用復古風格
- [ ] Detail Modal 更新

### Mint 流程優化
- [ ] Dry Run 功能實現
- [ ] 參數驗證邏輯
- [ ] Seal SDK 加密實現
- [ ] 上傳流程整合
- [ ] 錯誤處理完善
- [ ] UI 狀態顯示

### Publisher 重設計
- [ ] 新組件創建
- [ ] 兩欄布局實現
- [ ] GLB 實時預覽
- [ ] 拖放上傳功能
- [ ] 參數配置 UI
- [ ] 統一復古風格

---

## 💡 注意事項

1. **向後兼容**: 確保現有功能不受影響
2. **錯誤處理**: 每個步驟都要有明確的錯誤提示
3. **用戶體驗**: 所有異步操作都要有加載狀態
4. **測試**: 每個階段完成後立即測試
5. **代碼質量**: 保持代碼整潔，提取可復用邏輯

---

## 📝 開發日誌模板

```markdown
### [時間] 任務進展

**完成**:
- 

**遇到的問題**:
- 

**解決方案**:
- 

**下一步**:
- 
```

