# Publisher Retro UI 重设计实施文档

> **任务优先级**: P1  
> **预计时间**: 3-4 小时  
> **创建日期**: 2025-11-08  
> **状态**: 待开始

---

## 📋 任务概述

### 目标
将 Design Publisher 的上传流程重新设计为基于 `AtelierMintLayout` 模板的单页面体验，统一使用 Retro OS 风格组件，提供清晰的文件上传缺省状态。

### 核心需求
1. **复用现有模板**: 直接在 `AtelierMintLayout.tsx` 中进行所有上传和配置操作
2. **保持功能完整**: 所有上传内容和必填项目保持不变
3. **缺省状态设计**: 为未上传文件前的状态设计 Retro OS 风格的占位 UI
4. **风格统一**: 100% 使用已有的 Retro UI 组件系统

---

## 🎯 背景分析

### 当前实施状态

#### 现有文件结构
```
frontend/components/features/design-publisher/
├── index.tsx                          # 主入口
├── components/
│   ├── pages/
│   │   ├── UploadPage.tsx            # 当前的上传页面
│   │   ├── ConfigPage.tsx            # 配置页面
│   │   └── PreviewPage.tsx           # 预览页面（已使用 AtelierMintLayout）
│   └── ...
└── hooks/
    ├── useDesignPublisherForm.ts     # 主 hook
    ├── useArtworkForm.ts             # 表单状态
    ├── useFileUpload.ts              # 文件上传
    └── ...
```

#### 现有上传流程
```
Step 1: UploadPage.tsx
  └── 上传 STL, GLB, Cover Image

Step 2: ConfigPage.tsx
  └── 配置标题、描述、参数定义

Step 3: PreviewPage.tsx (✅ 已使用 AtelierMintLayout)
  └── 预览和发布
```

### 问题分析
1. **多步骤流程复杂**: 用户需要在 3 个页面之间切换
2. **视觉不一致**: UploadPage 和 ConfigPage 未使用 Retro UI 组件
3. **用户体验割裂**: 预览页面是 Retro 风格，但前面的页面不是
4. **冗余代码**: 多个页面组件可以合并

---

## 🎨 新 UI 设计方案

### 单页面布局（基于 AtelierMintLayout）

```
┌─────────────────────────────────────────────────────────────┐
│ RETRO HEADING                                               │
│ Title: "CREATE NEW ATELIER"                                 │
│ Author: BY [ARTIST_NAME] | @[ADDRESS]                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────── CONTENT ────────────────────────────┐
│                                                              │
│  ┌──── LEFT COLUMN (55%) ────┐  ┌─── RIGHT COLUMN (45%) ───┐
│  │                            │  │                          │
│  │  🖼️ 3D PREVIEW              │  │  📦 FILE UPLOADS        │
│  │  ┌──────────────────────┐  │  │  ┌──────────────────┐  │
│  │  │                      │  │  │  │ STL Upload       │  │
│  │  │  [缺省状态 or 3D]     │  │  │  │ [Drag & Drop]    │  │
│  │  │                      │  │  │  └──────────────────┘  │
│  │  └──────────────────────┘  │  │  ┌──────────────────┐  │
│  │                            │  │  │ GLB Upload       │  │
│  │  📋 ARTWORK INFO           │  │  │ [Drag & Drop]    │  │
│  │  ┌──────────────────────┐  │  │  └──────────────────┘  │
│  │  │ Cover Image          │  │  │  ┌──────────────────┐  │
│  │  │ [缺省 or 已上传]      │  │  │ Cover Upload     │  │
│  │  ├──────────────────────┤  │  │  │ [Drag & Drop]    │  │
│  │  │ Title Input          │  │  │  └──────────────────┘  │
│  │  ├──────────────────────┤  │  │                          │
│  │  │ Description Input    │  │  │  ⚙️ BASIC CONFIG        │
│  │  ├──────────────────────┤  │  │  ┌──────────────────┐  │
│  │  │ Artist Statement     │  │  │  │ Title *          │  │
│  │  └──────────────────────┘  │  │  │ Description *    │  │
│  │                            │  │  │ Price (SUI) *    │  │
│  └────────────────────────────┘  │  └──────────────────┘  │
│                                  │                          │
│                                  │  🔧 PARAMETERS          │
│                                  │  ┌──────────────────┐  │
│                                  │  │ [动态参数配置]    │  │
│                                  │  │ + Add Parameter  │  │
│                                  │  └──────────────────┘  │
│                                  │                          │
│                                  │  🚀 PUBLISH             │
│                                  │  ┌──────────────────┐  │
│                                  │  │ [PUBLISH ATELIER]│  │
│                                  │  └──────────────────┘  │
│                                  └──────────────────────────┘
└──────────────────────────────────────────────────────────────┘
```

---

## 🧩 Retro UI 组件使用指南

### 已有可复用组件清单

#### 1. 布局组件
```typescript
// 整体布局（已存在）
import { AtelierMintLayout } from '@/components/features/atelier-viewer/components/AtelierMintLayout';

// 区块容器
import { RetroSection } from '@/components/common/RetroCard';

// 预览容器
import { RetroPreview, RetroImage } from '@/components/common/RetroPreview';

// 标题栏
import { RetroHeading } from '@/components/common/RetroHeading';
```

#### 2. 交互组件
```typescript
// 按钮
import { RetroButton } from '@/components/common/RetroButton';
// 用法: <RetroButton size="sm|md|lg" variant="primary|secondary" />

// 输入框
import { RetroInput } from '@/components/common/RetroInput';
// 用法: <RetroInput type="text|number" placeholder="..." />

// 空状态
import { RetroEmptyState } from '@/components/common/RetroEmptyState';
// 用法: <RetroEmptyState icon="box|file|image|globe" title="..." message="..." />
```

#### 3. 面板组件
```typescript
// 通用面板
import { RetroPanel } from '@/components/common/RetroPanel';
// 用法: <RetroPanel variant="default|inset|outset" />

// List 项目（如果需要列表展示）
import { RetroListItem, RetroListThumbnail, RetroListInfo } from '@/components/common/RetroListItem';
```

### 颜色规范
```css
/* 背景色 */
--bg-primary: #0a0a0a;      /* 深黑 - 主背景 */
--bg-secondary: #1a1a1a;    /* 黑 - 次级背景 */
--bg-tertiary: #2a2a2a;     /* 灰 - 第三级背景 */

/* 边框色 */
--border-light: #333;       /* 浅灰 - 3D 高光 */
--border-dark: #0a0a0a;     /* 深黑 - 3D 阴影 */
--border-medium: #2a2a2a;   /* 中灰 - 普通边框 */

/* 文字色 */
--text-primary: rgba(255, 255, 255, 0.9);   /* 主文字 */
--text-secondary: rgba(255, 255, 255, 0.6); /* 次级文字 */
--text-tertiary: rgba(255, 255, 255, 0.4);  /* 提示文字 */
```

### 3D 边框效果规范
```css
/* Outset (凸起效果) - 用于按钮、卡片 */
border-top: 2px solid #333;
border-left: 2px solid #333;
border-bottom: 2px solid #0a0a0a;
border-right: 2px solid #0a0a0a;

/* Inset (内凹效果) - 用于输入框、预览区 */
border-top: 1px solid #0a0a0a;
border-left: 1px solid #0a0a0a;
border-bottom: 1px solid #333;
border-right: 1px solid #333;
```

---

## 📦 文件上传缺省状态设计

### 1. STL 文件上传区（未上传状态）

```tsx
<RetroSection title="STL FILE UPLOAD" titleRight={<span className="text-[9px] text-red-400">REQUIRED</span>}>
  <div 
    className="relative border-2 rounded cursor-pointer transition-colors hover:border-white/30"
    style={{
      borderTop: '2px solid #0a0a0a',
      borderLeft: '2px solid #0a0a0a',
      borderBottom: '2px solid #333',
      borderRight: '2px solid #333',
      backgroundColor: '#0a0a0a',
      minHeight: '120px'
    }}
    onDragOver={(e) => e.preventDefault()}
    onDrop={handleSTLDrop}
  >
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
      {/* 文件图标 */}
      <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
        />
      </svg>
      
      {/* 提示文字 */}
      <div className="text-center">
        <p className="text-xs text-white/60 font-mono uppercase mb-1">
          DROP STL FILE HERE
        </p>
        <p className="text-[10px] text-white/40 font-mono">
          OR CLICK TO BROWSE
        </p>
      </div>
      
      {/* 文件大小提示 */}
      <div className="text-[9px] text-white/30 font-mono">
        MAX 50MB
      </div>
    </div>
    
    <input 
      type="file" 
      accept=".stl"
      className="absolute inset-0 opacity-0 cursor-pointer"
      onChange={handleSTLChange}
    />
  </div>
</RetroSection>
```

### 2. STL 文件上传区（已上传状态）

```tsx
<RetroSection title="STL FILE UPLOAD" titleRight={<span className="text-[9px] text-green-400">✓ UPLOADED</span>}>
  <div 
    className="relative border-2 rounded"
    style={{
      borderTop: '2px solid #333',
      borderLeft: '2px solid #333',
      borderBottom: '2px solid #0a0a0a',
      borderRight: '2px solid #0a0a0a',
      backgroundColor: '#1a1a1a',
      minHeight: '80px'
    }}
  >
    <div className="p-3 flex items-center justify-between">
      {/* 左侧：文件信息 */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center bg-black/40 rounded border border-white/10">
          <span className="text-xs text-white/60 font-mono">STL</span>
        </div>
        <div>
          <p className="text-xs text-white/90 font-mono truncate max-w-[200px]">
            {file.name}
          </p>
          <p className="text-[10px] text-white/40 font-mono">
            {formatFileSize(file.size)}
          </p>
        </div>
      </div>
      
      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2">
        <RetroButton 
          size="sm" 
          variant="secondary"
          onClick={handleSTLRemove}
        >
          REMOVE
        </RetroButton>
      </div>
    </div>
  </div>
</RetroSection>
```

### 3. GLB 文件上传区（类似 STL，调整文字和图标）

```tsx
// 缺省状态图标使用 cube icon
<svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
  />
</svg>

// 提示文字
<p className="text-xs text-white/60 font-mono uppercase mb-1">
  DROP GLB FILE HERE
</p>
```

### 4. Cover Image 上传区（未上传）

```tsx
<RetroImage 
  src={''} // 空字符串触发缺省状态
  alt="Cover"
  emptyState={
    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
      <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="text-xs text-white/60 font-mono uppercase">COVER IMAGE</p>
      <p className="text-[10px] text-white/40 font-mono">CLICK TO UPLOAD</p>
    </div>
  }
  onClick={() => coverInputRef.current?.click()}
  className="cursor-pointer hover:opacity-80 transition-opacity"
/>
```

### 5. 3D 预览区（未上传 GLB）

```tsx
<RetroPreview height="500px">
  <RetroEmptyState
    icon="box"
    title="NO 3D MODEL"
    message="Upload GLB file to preview"
  />
</RetroPreview>
```

### 6. 参数配置区（动态添加/删除）

```tsx
<RetroSection 
  title="PARAMETERS"
  titleRight={
    <RetroButton 
      size="sm"
      variant="secondary"
      onClick={handleAddParameter}
      className="text-[10px] px-2 py-0.5"
    >
      + ADD
    </RetroButton>
  }
>
  {parameters.length === 0 ? (
    <div className="py-8 text-center">
      <p className="text-xs text-white/40 font-mono uppercase">
        NO PARAMETERS DEFINED
      </p>
      <p className="text-[10px] text-white/30 font-mono mt-1">
        Click + ADD to create a parameter
      </p>
    </div>
  ) : (
    <div className="space-y-2">
      {parameters.map((param, index) => (
        <div key={index} className="bg-black/40 rounded p-2 border border-white/5">
          {/* 参数配置 UI */}
          <div className="flex items-center justify-between mb-2">
            <input
              type="text"
              placeholder="PARAMETER NAME"
              value={param.name}
              onChange={(e) => handleParameterNameChange(index, e.target.value)}
              className="flex-1 bg-transparent text-white/90 text-xs font-mono uppercase border-none focus:outline-none"
            />
            <RetroButton
              size="sm"
              variant="secondary"
              onClick={() => handleRemoveParameter(index)}
              className="text-[10px] px-2 py-0.5"
            >
              ✕
            </RetroButton>
          </div>
          
          {/* Min/Max/Default 配置 */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[9px] text-white/50 font-mono uppercase block mb-1">MIN</label>
              <RetroInput
                type="number"
                value={param.min}
                onChange={(e) => handleParameterChange(index, 'min', e.target.value)}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-white/50 font-mono uppercase block mb-1">MAX</label>
              <RetroInput
                type="number"
                value={param.max}
                onChange={(e) => handleParameterChange(index, 'max', e.target.value)}
                className="w-full text-xs"
              />
            </div>
            <div>
              <label className="text-[9px] text-white/50 font-mono uppercase block mb-1">DEFAULT</label>
              <RetroInput
                type="number"
                value={param.default}
                onChange={(e) => handleParameterChange(index, 'default', e.target.value)}
                className="w-full text-xs"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</RetroSection>
```

---

## 🔧 技术实施步骤

### Phase 1: 创建新的 Publisher 组件 (1h)

#### 1.1 创建 `PublisherMintLayout.tsx`
```typescript
// frontend/components/features/design-publisher/components/PublisherMintLayout.tsx

import { useState } from 'react';
import { RetroHeading } from '@/components/common/RetroHeading';
import { RetroSection } from '@/components/common/RetroCard';
import { RetroPreview, RetroImage } from '@/components/common/RetroPreview';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroInput } from '@/components/common/RetroInput';
import { RetroEmptyState } from '@/components/common/RetroEmptyState';

export interface PublisherMintLayoutProps {
  // 艺术家信息
  artistName: string;
  artistAddress: string;
  
  // 文件上传状态
  stlFile: File | null;
  glbFile: File | null;
  coverImage: File | null;
  onSTLUpload: (file: File) => void;
  onGLBUpload: (file: File) => void;
  onCoverUpload: (file: File) => void;
  onSTLRemove: () => void;
  onGLBRemove: () => void;
  onCoverRemove: () => void;
  
  // 基本信息
  title: string;
  description: string;
  price: string;
  artistStatement: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onArtistStatementChange: (value: string) => void;
  
  // 参数配置
  parameters: Array<{
    name: string;
    type: 'number' | 'color' | 'text';
    min?: number;
    max?: number;
    default: any;
  }>;
  onAddParameter: () => void;
  onRemoveParameter: (index: number) => void;
  onParameterChange: (index: number, field: string, value: any) => void;
  
  // 3D 预览
  preview3D?: ReactNode;
  
  // 发布
  onPublish: () => Promise<void>;
  publishButtonState: {
    disabled: boolean;
    tooltip: string;
  };
}

export function PublisherMintLayout(props: PublisherMintLayoutProps) {
  // 实现组件...
}
```

#### 1.2 创建文件上传组件
```typescript
// frontend/components/features/design-publisher/components/FileUploadZone.tsx

interface FileUploadZoneProps {
  fileType: 'STL' | 'GLB' | 'IMAGE';
  file: File | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  accept: string;
  maxSize?: number; // MB
  required?: boolean;
}

export function FileUploadZone({ fileType, file, onUpload, onRemove, accept, maxSize = 50, required = false }: FileUploadZoneProps) {
  // 实现拖放和选择文件逻辑
}
```

#### 1.3 创建参数配置组件
```typescript
// frontend/components/features/design-publisher/components/ParameterConfig.tsx

interface ParameterConfigProps {
  parameters: Parameter[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: any) => void;
}

export function ParameterConfig({ parameters, onAdd, onRemove, onChange }: ParameterConfigProps) {
  // 实现参数配置逻辑
}
```

### Phase 2: 整合 Hooks 和状态管理 (1h)

#### 2.1 更新 `useDesignPublisherForm.ts`
```typescript
// 需要添加的状态和方法：
const [stlFile, setSTLFile] = useState<File | null>(null);
const [glbFile, setGLBFile] = useState<File | null>(null);
const [coverImage, setCoverImage] = useState<File | null>(null);

const handleSTLUpload = (file: File) => {
  setSTLFile(file);
  // 触发 STL 处理逻辑
};

const handleGLBUpload = (file: File) => {
  setGLBFile(file);
  // 触发 GLB 加载和 3D 预览
};

const handleCoverUpload = (file: File) => {
  setCoverImage(file);
  // 更新 cover image URL
};
```

#### 2.2 集成 3D 预览
```typescript
// 复用 ParametricViewer 或 GLBViewer
import { GLBViewer } from '@/components/3d/GLBViewer';

// 在 PublisherMintLayout 中
preview3D={
  glbFile ? (
    <GLBViewer 
      modelUrl={URL.createObjectURL(glbFile)}
      onLoad={() => console.log('GLB loaded')}
    />
  ) : (
    <RetroEmptyState
      icon="box"
      title="NO 3D MODEL"
      message="Upload GLB file to preview"
    />
  )
}
```

### Phase 3: 验证和发布逻辑 (1h)

#### 3.1 表单验证
```typescript
const validatePublisher = () => {
  const errors: string[] = [];
  
  if (!stlFile) errors.push('STL file is required');
  if (!glbFile) errors.push('GLB file is required');
  if (!coverImage) errors.push('Cover image is required');
  if (!title.trim()) errors.push('Title is required');
  if (!description.trim()) errors.push('Description is required');
  if (!price || parseFloat(price) <= 0) errors.push('Valid price is required');
  if (parameters.length === 0) errors.push('At least one parameter is required');
  
  // 验证参数定义
  parameters.forEach((param, index) => {
    if (!param.name.trim()) errors.push(`Parameter ${index + 1}: name is required`);
    if (param.type === 'number') {
      if (param.min === undefined || param.max === undefined) {
        errors.push(`Parameter ${param.name}: min and max are required`);
      }
      if (param.min >= param.max) {
        errors.push(`Parameter ${param.name}: min must be less than max`);
      }
      if (param.default < param.min || param.default > param.max) {
        errors.push(`Parameter ${param.name}: default must be between min and max`);
      }
    }
  });
  
  return errors;
};

const publishButtonState = useMemo(() => {
  const errors = validatePublisher();
  return {
    disabled: errors.length > 0,
    tooltip: errors.length > 0 ? errors.join('\n') : 'Ready to publish'
  };
}, [stlFile, glbFile, coverImage, title, description, price, parameters]);
```

#### 3.2 发布流程
```typescript
const handlePublish = async () => {
  try {
    setPublishStatus('preparing');
    
    // 1. 加密 STL 文件（如需要）
    setPublishStatus('encrypting');
    const encryptedSTL = await encryptFile(stlFile);
    
    // 2. 上传文件到 Walrus
    setPublishStatus('uploading');
    const [stlBlobId, glbBlobId, coverBlobId] = await Promise.all([
      uploadToWalrus(encryptedSTL),
      uploadToWalrus(glbFile),
      uploadToWalrus(coverImage)
    ]);
    
    // 3. 创建配置 JSON
    const config = {
      title,
      description,
      artistStatement,
      parameters: parameters.map(p => ({
        name: p.name,
        type: p.type,
        min: p.min,
        max: p.max,
        default: p.default,
        label: p.name
      })),
      stlBlobId,
      glbBlobId,
      coverBlobId
    };
    
    const configBlobId = await uploadToWalrus(JSON.stringify(config));
    
    // 4. 调用合约 mint_atelier
    setPublishStatus('minting');
    const tx = new Transaction();
    tx.moveCall({
      target: `${PACKAGE_ID}::atelier::mint_atelier`,
      arguments: [
        tx.object(MEMBERSHIP_ID),
        tx.pure.string(title),
        tx.pure.string(configBlobId),
        tx.pure.u64(BigInt(parseFloat(price) * 1e9)) // SUI to MIST
      ]
    });
    
    const result = await signAndExecuteTransaction({ transaction: tx });
    
    setPublishStatus('success');
    // 跳转到新创建的 Atelier 页面
    
  } catch (error) {
    console.error('Publish failed:', error);
    setPublishStatus('failed');
    setPublishError(error.message);
  }
};
```

### Phase 4: 更新路由和整合 (30min)

#### 4.1 更新 `DesignPublisher/index.tsx`
```typescript
// 移除多步骤逻辑，直接渲染 PublisherMintLayout
export function DesignPublisher() {
  const {
    // 所有需要的状态和方法
  } = useDesignPublisherForm();
  
  return (
    <PublisherMintLayout
      artistName={membershipData?.username || 'Anonymous'}
      artistAddress={currentAccount?.address || ''}
      stlFile={stlFile}
      glbFile={glbFile}
      coverImage={coverImage}
      onSTLUpload={handleSTLUpload}
      onGLBUpload={handleGLBUpload}
      onCoverUpload={handleCoverUpload}
      // ... 其他 props
      onPublish={handlePublish}
      publishButtonState={publishButtonState}
      preview3D={glbFile && <GLBViewer modelUrl={URL.createObjectURL(glbFile)} />}
    />
  );
}
```

---

## ✅ 验证和测试清单

### 功能测试
- [ ] STL 文件上传（拖放 + 点击选择）
- [ ] GLB 文件上传（拖放 + 点击选择）
- [ ] Cover Image 上传（点击选择）
- [ ] 文件移除功能
- [ ] 文件大小验证（超过 50MB 提示错误）
- [ ] 文件类型验证（只接受 .stl, .glb, .jpg/.png）
- [ ] 3D 预览正常加载和显示
- [ ] 基本信息输入（Title, Description, Price, Artist Statement）
- [ ] 参数动态添加/删除
- [ ] 参数配置（Name, Type, Min, Max, Default）
- [ ] 参数验证（Min < Max, Default in range）
- [ ] 发布按钮禁用逻辑（缺少必填项时禁用）
- [ ] 发布流程（文件上传 → 合约调用 → 成功/失败提示）

### UI/UX 测试
- [ ] 所有组件使用 Retro UI 风格
- [ ] 缺省状态清晰易懂
- [ ] 上传状态正确展示（文件名、大小、移除按钮）
- [ ] 3D 预览区域正常工作
- [ ] 表单验证错误清晰提示
- [ ] 发布按钮 tooltip 正确显示错误信息
- [ ] 加载状态和进度提示（如适用）
- [ ] 响应式布局（窗口缩放时正常显示）

### 边界情况测试
- [ ] 未连接钱包时的提示
- [ ] 没有 Membership NFT 时的提示
- [ ] 上传非常大的文件（接近 50MB）
- [ ] 上传错误的文件类型
- [ ] 网络错误时的重试机制
- [ ] 参数配置冲突（Min > Max）
- [ ] 空参数列表
- [ ] 特殊字符在 Title/Description 中

### 性能测试
- [ ] 大文件上传不卡顿
- [ ] 3D 预览渲染流畅
- [ ] 多个参数时 UI 不卡顿

---

## 📚 参考文档

### 现有实施参考
- `frontend/components/features/atelier-viewer/components/AtelierMintLayout.tsx` - 主要布局参考
- `frontend/components/features/atelier-viewer/components/AtelierMintCore.tsx` - Mint 逻辑参考
- `frontend/components/common/Retro*.tsx` - 所有 Retro UI 组件

### Hooks 参考
- `frontend/components/features/design-publisher/hooks/useDesignPublisherForm.ts` - 表单管理
- `frontend/components/features/design-publisher/hooks/useFileUpload.ts` - 文件上传
- `frontend/components/features/atelier-viewer/hooks/useSculptMint.ts` - Mint 流程参考

### 合约调用参考
- `frontend/utils/transactions.ts` - 所有合约交互方法
- 查看 `mint_atelier` 函数签名和参数

---

## 🎨 UI 设计原则提醒

1. **统一性**: 100% 使用 Retro UI 组件，不引入新的样式
2. **清晰性**: 缺省状态要清楚告诉用户需要做什么
3. **反馈性**: 每个操作都要有明确的视觉反馈
4. **简洁性**: 避免过多文字，用图标和简短提示
5. **一致性**: 与 Marketplace 和 Vault 的交互模式保持一致

---

## 🚀 实施建议

### 推荐顺序
1. 先创建 `FileUploadZone` 组件（可独立测试）
2. 再创建 `ParameterConfig` 组件（可独立测试）
3. 然后创建 `PublisherMintLayout` 组件（整合前两者）
4. 更新 `useDesignPublisherForm` hook（集成状态管理）
5. 更新 `index.tsx` 连接所有部分
6. 测试和调优

### 时间分配建议
- Phase 1 (组件创建): 1.5h
- Phase 2 (状态管理): 1h
- Phase 3 (验证和发布): 1h
- Phase 4 (整合和测试): 1.5h

**总计**: 约 5 小时（包含测试和调优时间）

---

## 📌 注意事项

1. **不要创建新的样式系统**: 只使用已有的 Retro UI 组件
2. **保持现有功能**: 所有上传和配置功能必须保留
3. **错误处理**: 每个文件操作都要有完善的错误处理
4. **用户反馈**: 使用 toast 或 notification 告知操作结果
5. **性能优化**: 大文件处理要异步，避免阻塞 UI
6. **代码复用**: 优先复用现有的 hooks 和工具函数

---

## 🎯 完成标准

- ✅ 所有文件上传功能正常工作
- ✅ 所有缺省状态使用 Retro UI 组件
- ✅ 3D 预览正常显示
- ✅ 参数配置功能完整
- ✅ 表单验证完善
- ✅ 发布流程成功
- ✅ E2E 测试通过
- ✅ 代码清晰，无 lint 错误
- ✅ 与现有 UI 风格 100% 统一

---

**祝实施顺利！如有问题，请参考现有代码或查阅上述参考文档。** 🚀

