# Seal 加密整合實施計劃

> 參考文檔: https://seal-docs.wal.app/UsingSeal/

## 📋 目標

實現完整的 Seal 加密整合，讓 STL 文件可以加密儲存並通過白名單控制訪問。

---

## Phase 1: 合約層修改 (Move)

### 1.1 修改 Sculpt 結構

**現有結構**:
```move
public struct Sculpt<phantom ATELIER> has key, store {
    id: UID,
    atelier_id: ID,
    alias: String,
    owner: address,
    creator: address,
    blueprint: String,
    structure: String,              // ← 需要改為 Option
    parameters: VecMap<String, u64>,
    printed: u64,
    time: u64,
    printer_whitelist: VecSet<ID>,  // ← 需要改為 VecSet<address>
    encrypted: bool,
}
```

**修改後結構**:
```move
public struct Sculpt<phantom ATELIER> has key, store {
    id: UID,
    atelier_id: ID,
    alias: String,
    owner: address,
    creator: address,
    blueprint: String,
    glb_file: String,                     // ✨ 新增：GLB 文件 blobId
    structure: Option<String>,            // ✨ 修改：可選的 STL blobId
    parameters: VecMap<String, u64>,
    printed: u64,
    time: u64,
    printer_whitelist: VecSet<address>,   // ✨ 修改：改為 address
    encrypted: bool,
}
```

**變更原因**:
- `glb_file`: 專門存儲 GLB 文件（3D 預覽）
- `structure`: 改為 Option，因為 STL 是可選的（加密時才需要）
- `printer_whitelist`: Seal `seal_approve*` 函數需要檢查 address

### 1.2 添加 Seal 授權函數

根據 [Seal 文檔](https://seal-docs.wal.app/UsingSeal/#access-control-management)，需要實現 `seal_approve*` 函數：

```move
/// Seal authorization function - checks if caller is in printer whitelist
/// This function is called by Seal key servers to verify access rights
entry fun seal_approve_printer<T>(
    id: vector<u8>,           // Seal identity (without package ID prefix)
    sculpt: &Sculpt<T>,
    ctx: &TxContext
) {
    // Verify the sculpt ID matches
    let sculpt_id_bytes = object::id_to_bytes(&object::uid_to_inner(&sculpt.id));
    assert!(sculpt_id_bytes == id, ENO_PERMISSION);
    
    // Check if caller is in whitelist
    let caller = ctx.sender();
    assert!(vec_set::contains(&sculpt.printer_whitelist, &caller), ENO_PERMISSION);
    
    // Access granted (function returns normally)
}
```

**重要特性**:
- ✅ 非公開 `entry` 函數（Seal 建議）
- ✅ 第一個參數必須是 `id: vector<u8>`
- ✅ 拒絕訪問時 `abort`，允許時正常返回
- ✅ 無副作用（只讀檢查）

### 1.3 修改 mint_sculpt 函數

```move
public fun mint_sculpt<T>(
    atelier: &Atelier<T>,
    pool: &mut AtelierPool<T>,
    membership: &mut MemberShip,
    sculpt_kiosk: &mut Kiosk,
    sculpt_kiosk_cap: &KioskOwnerCap,
    alias: String,
    blueprint: String,
    glb_file: String,                  // ✨ 新增
    structure: Option<String>,         // ✨ 修改為 Option
    param_keys: vector<String>,
    param_values: vector<u64>,
    payment: Coin<SUI>,
    clock: &clock::Clock,
    ctx: &mut TxContext
) {
    // ... validation ...
    
    assert!(!string::is_empty(&glb_file), ENO_EMPTY_STRING);
    
    // structure 現在是 Option，不檢查空
    
    // ...
}
```

### 1.4 修改白名單管理函數

```move
/// Add a printer address to the whitelist for this sculpt (owner only)
public fun add_printer_to_whitelist<T>(
    sculpt: &mut Sculpt<T>,
    printer_address: address,   // ✨ 改為 address
    ctx: &TxContext
) {
    assert!(sculpt.owner == ctx.sender(), ENO_PERMISSION);
    vec_set::insert(&mut sculpt.printer_whitelist, printer_address);
    
    event::emit(PrinterAdded {
        sculpt_id: object::uid_to_inner(&sculpt.id),
        printer_address,  // ✨ event 也需要更新
    });
}
```

### 1.5 測試代碼

創建 `contract/tests/seal_tests.move`:

```move
#[test_only]
module archimeters::seal_tests {
    use archimeters::sculpt;
    use sui::test_scenario;
    
    #[test]
    fun test_seal_approve_authorized_printer() {
        // Setup: Create sculpt with printer in whitelist
        // Test: Call seal_approve_printer with authorized address
        // Assert: Function completes successfully
    }
    
    #[test]
    #[expected_failure(abort_code = sculpt::ENO_PERMISSION)]
    fun test_seal_approve_unauthorized_printer() {
        // Setup: Create sculpt without printer in whitelist
        // Test: Call seal_approve_printer with unauthorized address
        // Assert: Function aborts with ENO_PERMISSION
    }
    
    #[test]
    fun test_mint_with_optional_stl() {
        // Test: Mint sculpt with structure = option::none()
        // Assert: Sculpt created successfully
    }
    
    #[test]
    fun test_mint_with_stl() {
        // Test: Mint sculpt with structure = option::some(blob_id)
        // Assert: Sculpt created with STL
    }
}
```

---

## Phase 2: 前端整合

### 2.1 UI 修改

**AtelierMintLayout.tsx**:
```typescript
// 添加 STL toggle
const [generateSTL, setGenerateSTL] = useState(false);

<div className="flex items-center gap-2 mb-4">
  <input 
    type="checkbox" 
    checked={generateSTL}
    onChange={(e) => setGenerateSTL(e.target.checked)}
  />
  <label>Generate encrypted STL file</label>
</div>
```

### 2.2 導出邏輯修改

**useSceneExport.ts**:
```typescript
const exportScene = async (
  scene: THREE.Scene,
  fileName: string,
  format: 'glb' | 'stl'
): Promise<File> => {
  if (format === 'glb') {
    // 現有 GLB 導出邏輯
  } else if (format === 'stl') {
    // ✨ 新增 STL 導出邏輯
    const { STLExporter } = await import('three/examples/jsm/exporters/STLExporter');
    const exporter = new STLExporter();
    const stlString = exporter.parse(scene);
    const blob = new Blob([stlString], { type: 'text/plain' });
    return new File([blob], `${fileName}.stl`);
  }
};
```

### 2.3 Seal 加密整合

**seal.ts** 修改:

```typescript
// Testnet key servers (from Seal docs)
const TESTNET_KEY_SERVERS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8"
];

export async function encryptSTLFile(
  file: File,
  sculptId: string,
  suiClient: SuiClient
): Promise<SealEncryptionResult> {
  const client = new SealClient({
    suiClient: suiClient as any,
    serverConfigs: TESTNET_KEY_SERVERS.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false,
  });

  const fileData = new Uint8Array(await file.arrayBuffer());

  const { encryptedObject, key } = await client.encrypt({
    threshold: 2,
    packageId: PACKAGE_ID,
    id: sculptId,
    data: fileData,
  });

  return {
    encryptedBlob: new Blob([encryptedObject]),
    resourceId: sculptId,
    metadata: {
      encrypted: true,
      originalSize: file.size,
      encryptedSize: encryptedObject.length,
      encryptionDate: new Date().toISOString(),
    },
  };
}
```

### 2.4 useSculptMint 修改

```typescript
const handleMint = async (alias: string) => {
  // Step 1: Export GLB (always)
  const glbFile = await exportScene(scene, baseName, 'glb');
  const glbBlobId = await uploadToWalrus(glbFile, 'GLB');

  // Step 2: Export & Encrypt STL (optional)
  let stlBlobId: string | null = null;
  
  if (generateSTL) {
    const stlFile = await exportScene(scene, baseName, 'stl');
    
    // Encrypt with Seal
    const encrypted = await encryptSTLFile(stlFile, sculptId, suiClient);
    
    // Upload encrypted STL
    stlBlobId = await uploadToWalrus(
      new File([encrypted.encryptedBlob], `${baseName}_encrypted.stl`),
      'STL'
    );
  }

  // Step 3: Mint with optional STL
  const tx = mintSculpt(
    atelierId,
    poolId,
    membershipId,
    kioskId,
    kioskCapId,
    alias,
    screenshotBlobId,
    glbBlobId,
    stlBlobId, // null or blobId
    paramKeys,
    paramValues,
    priceInMist
  );
};
```

### 2.5 transactions.ts 修改

```typescript
export const mintSculpt = (
  atelierId: string,
  poolId: string,
  membershipId: string,
  kioskId: string,
  kioskCapId: string,
  alias: string,
  blueprint: string,
  glbFile: string,           // ✨ 新增
  structure: string | null,  // ✨ 改為 nullable
  paramKeys: string[],
  paramValues: number[],
  priceInMist: number,
) => {
  const tx = new Transaction();
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(priceInMist)]);
  
  // Build structure Option
  const structureOption = structure 
    ? tx.moveCall({
        target: '0x1::option::some',
        typeArguments: ['0x1::string::String'],
        arguments: [tx.pure.string(structure)],
      })
    : tx.moveCall({
        target: '0x1::option::none',
        typeArguments: ['0x1::string::String'],
      });
  
  tx.moveCall({
    target: `${PACKAGE_ID}::sculpt::mint_sculpt`,
    typeArguments: [`${PACKAGE_ID}::atelier::ATELIER`],
    arguments: [
      tx.object(atelierId),
      tx.object(poolId),
      tx.object(membershipId),
      tx.object(kioskId),
      tx.object(kioskCapId),
      tx.pure.string(alias),
      tx.pure.string(blueprint),
      tx.pure.string(glbFile),     // ✨ 新增
      structureOption,               // ✨ Option<String>
      tx.pure(bcs.vector(bcs.string()).serialize(paramKeys)),
      tx.pure(bcs.vector(bcs.u64()).serialize(paramValues)),
      paymentCoin,
      tx.object(SUI_CLOCK),
    ],
  });
  return tx;
};
```

---

## Phase 3: 測試與部署

### 3.1 合約測試
```bash
cd contract
sui move test
```

### 3.2 合約部署
```bash
sui client publish --gas-budget 500000000
```

### 3.3 前端測試
1. 選擇 Atelier
2. 啟用 "Generate STL" toggle
3. 設置參數
4. Mint Sculpt
5. 驗證：
   - GLB 文件正確上傳
   - STL 文件加密並上傳（如啟用）
   - Sculpt 創建成功

### 3.4 白名單測試
1. 添加 printer address 到白名單
2. 使用 Seal CLI 測試解密（需要授權的 address）
3. 驗證未授權 address 無法解密

---

## 📝 檢查清單

### 合約
- [ ] 修改 Sculpt 結構（glb_file, Option<structure>, VecSet<address>）
- [ ] 實現 seal_approve_printer 函數
- [ ] 修改 mint_sculpt 支持可選 STL
- [ ] 更新白名單管理函數（address 類型）
- [ ] 更新相關 events
- [ ] 編寫測試代碼
- [ ] 運行所有測試
- [ ] 部署到 testnet

### 前端
- [ ] 添加 "Generate STL" toggle UI
- [ ] 實現 STL 導出功能
- [ ] 配置 Seal testnet key servers
- [ ] 實現 encryptSTLFile 函數
- [ ] 修改 useSculptMint 支持可選 STL
- [ ] 更新 transactions.ts (Option<String> 參數)
- [ ] 測試完整 Mint 流程
- [ ] 更新 UI 顯示加密狀態

---

## 參考資源

- [Seal 官方文檔](https://seal-docs.wal.app/UsingSeal/)
- [Seal SDK GitHub](https://github.com/MystenLabs/seal)
- [Three.js STLExporter](https://threejs.org/docs/#examples/en/exporters/STLExporter)

---

## 預計時間

- Phase 1: 合約修改 + 測試 - **3-4 小時**
- Phase 2: 前端整合 - **2-3 小時**
- Phase 3: 測試與部署 - **1-2 小時**

**總計**: 6-9 小時

