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
Step 1: BasicInfoPage.tsx
  └── 上传 Cover Image + 填写作品信息（标题、描述、价格）+ 艺术家信息

Step 2: AlgorithmPage.tsx
  └── 上传算法文件（.js）→ 自动提取参数 → 3D 预览

Step 3: PreviewPage.tsx (✅ 已使用 AtelierMintLayout)
  └── 调整参数 + 预览和发布

Step 4: UploadStatusPage.tsx
  └── 上传进度 + 合约调用
```

**关键发现**:
- ❌ **不需要上传 STL/GLB**: Publisher 只上传 Cover Image 和算法 .js 文件
- 🔧 **参数自动提取**: 从算法 .js 文件中自动解析参数定义（`extractedParameters`）
- 🎨 **3D 实时预览**: 使用 `ParametricViewer` 根据算法代码和参数生成 3D 预览

### 问题分析
1. **多步骤流程复杂**: 用户需要在 4 个页面之间切换
2. **视觉不一致**: BasicInfoPage 和 AlgorithmPage 未使用 Retro UI 组件
3. **用户体验割裂**: PreviewPage 是 Retro 风格，但前面的页面不是
4. **冗余代码**: Page 1 和 Page 2 可以合并为单页面

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
│  │  🎨 3D PREVIEW              │  │  📦 FILE UPLOADS        │
│  │  ┌──────────────────────┐  │  │  ┌──────────────────┐  │
│  │  │  [缺省 or 3D 预览]    │  │  │  │ Cover Image *    │  │
│  │  │  (ParametricViewer)  │  │  │  │ [Click Upload]   │  │
│  │  │                      │  │  │  └──────────────────┘  │
│  │  └──────────────────────┘  │  │  ┌──────────────────┐  │
│  │                            │  │  │ Algorithm File * │  │
│  │  📋 ARTWORK INFO           │  │  │ [Click Upload]   │  │
│  │  ┌──────────────────────┐  │  │  │ (.js only)       │  │
│  │  │ Cover Image Preview  │  │  │  └──────────────────┘  │
│  │  │ [Square 1:1]         │  │  │                          │
│  │  ├──────────────────────┤  │  │  ⚙️ BASIC INFO          │
│  │  │ Title *              │  │  │  ┌──────────────────┐  │
│  │  ├──────────────────────┤  │  │  │ Artwork Title *  │  │
│  │  │ Description *        │  │  │  ├──────────────────┤  │
│  │  ├──────────────────────┤  │  │  │ Description *    │  │
│  │  │ Artist Statement     │  │  │  ├──────────────────┤  │
│  │  │ [From Membership]    │  │  │  │ Price (SUI) *    │  │
│  │  └──────────────────────┘  │  │  │ [0 or decimal]   │  │
│  └────────────────────────────┘  │  └──────────────────┘  │
│                                  │                          │
│                                  │  🔧 EXTRACTED PARAMS    │
│                                  │  ┌──────────────────┐  │
│                                  │  │ [Auto from .js]  │  │
│                                  │  │ [Read-only list] │  │
│                                  │  └──────────────────┘  │
│                                  │                          │
│                                  │  🚀 PUBLISH             │
│                                  │  ┌──────────────────┐  │
│                                  │  │ [PUBLISH ATELIER]│  │
│                                  │  └──────────────────┘  │
│                                  └──────────────────────────┘
└──────────────────────────────────────────────────────────────┘
```

**关键设计要点**:
- ✅ 左侧 3D 预览使用 `ParametricViewer`（根据算法实时生成）
- ✅ 右侧上传区只有 Cover Image 和 Algorithm File（.js）
- ✅ 参数区显示从 .js 文件自动提取的参数（只读，供用户查看）
- ✅ 艺术家信息自动从 Membership NFT 获取
- ✅ 所有必填项标记为 *

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

### 1. Cover Image 上传区（未上传状态）

```tsx
<RetroSection title="COVER IMAGE" titleRight={<span className="text-[9px] text-red-400">REQUIRED</span>}>
  <div 
    className="relative border-2 rounded cursor-pointer transition-colors hover:border-white/30"
    style={{
      borderTop: '2px solid #0a0a0a',
      borderLeft: '2px solid #0a0a0a',
      borderBottom: '2px solid #333',
      borderRight: '2px solid #333',
      backgroundColor: '#0a0a0a',
      minHeight: '200px',
      aspectRatio: '1/1' // Square aspect ratio
    }}
    onClick={() => imageInputRef.current?.click()}
  >
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
      {/* 图片图标 */}
      <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      
      {/* 提示文字 */}
      <div className="text-center">
        <p className="text-xs text-white/60 font-mono uppercase mb-1">
          COVER IMAGE
        </p>
        <p className="text-[10px] text-white/40 font-mono">
          CLICK TO UPLOAD
        </p>
      </div>
      
      {/* 文件大小提示 */}
      <div className="text-[9px] text-white/30 font-mono">
        JPG, PNG, GIF • MAX 10MB
      </div>
    </div>
    
    <input 
      ref={imageInputRef}
      type="file" 
      accept="image/jpeg,image/png,image/gif"
      className="hidden"
      onChange={handleImageChange}
    />
  </div>
</RetroSection>
```

### 2. Cover Image 上传区（已上传状态）

```tsx
<RetroSection title="COVER IMAGE" titleRight={<span className="text-[9px] text-green-400">✓ UPLOADED</span>}>
  <div 
    className="relative border-2 rounded overflow-hidden group"
    style={{
      borderTop: '2px solid #333',
      borderLeft: '2px solid #333',
      borderBottom: '2px solid #0a0a0a',
      borderRight: '2px solid #0a0a0a',
      backgroundColor: '#1a1a1a',
      aspectRatio: '1/1'
    }}
  >
    {/* 图片预览 */}
    <img 
      src={imageUrl} 
      alt="Cover" 
      className="w-full h-full object-cover"
    />
    
    {/* Hover 操作层 */}
    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
      <RetroButton 
        size="sm" 
        variant="secondary"
        onClick={() => imageInputRef.current?.click()}
      >
        CHANGE
      </RetroButton>
      <RetroButton 
        size="sm" 
        variant="secondary"
        onClick={handleImageRemove}
      >
        REMOVE
      </RetroButton>
    </div>
    
    <input 
      ref={imageInputRef}
      type="file" 
      accept="image/jpeg,image/png,image/gif"
      className="hidden"
      onChange={handleImageChange}
    />
  </div>
  
  {/* 文件信息 */}
  <div className="mt-2 text-[10px] text-white/40 font-mono">
    {imageFile?.name} • {formatFileSize(imageFile?.size || 0)}
  </div>
</RetroSection>
```

### 3. Algorithm File 上传区（未上传状态）

```tsx
<RetroSection title="ALGORITHM FILE" titleRight={<span className="text-[9px] text-red-400">REQUIRED</span>}>
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
    onClick={() => algoInputRef.current?.click()}
  >
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
      {/* 代码文件图标 */}
      <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
          d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
        />
      </svg>
      
      {/* 提示文字 */}
      <div className="text-center">
        <p className="text-xs text-white/60 font-mono uppercase mb-1">
          ALGORITHM FILE
        </p>
        <p className="text-[10px] text-white/40 font-mono">
          CLICK TO UPLOAD .JS FILE
        </p>
      </div>
      
      {/* 文件大小提示 */}
      <div className="text-[9px] text-white/30 font-mono">
        JAVASCRIPT ONLY • MAX 1MB
      </div>
    </div>
    
    <input 
      ref={algoInputRef}
      type="file" 
      accept=".js,application/javascript,text/javascript"
      className="hidden"
      onChange={handleAlgoChange}
    />
  </div>
</RetroSection>
```

### 4. Algorithm File 上传区（已上传状态）

```tsx
<RetroSection title="ALGORITHM FILE" titleRight={<span className="text-[9px] text-green-400">✓ UPLOADED</span>}>
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
          <span className="text-xs text-white/60 font-mono">.JS</span>
        </div>
        <div>
          <p className="text-xs text-white/90 font-mono truncate max-w-[200px]">
            {algoFile.name}
          </p>
          <p className="text-[10px] text-white/40 font-mono">
            {formatFileSize(algoFile.size)}
          </p>
          {extractedParameters.length > 0 && (
            <p className="text-[10px] text-green-400 font-mono mt-1">
              ✓ {extractedParameters.length} parameters extracted
            </p>
          )}
        </div>
      </div>
      
      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-2">
        <RetroButton 
          size="sm" 
          variant="secondary"
          onClick={() => algoInputRef.current?.click()}
        >
          CHANGE
        </RetroButton>
        <RetroButton 
          size="sm" 
          variant="secondary"
          onClick={handleAlgoRemove}
        >
          REMOVE
        </RetroButton>
      </div>
    </div>
  </div>
  
  <input 
    ref={algoInputRef}
    type="file" 
    accept=".js,application/javascript,text/javascript"
    className="hidden"
    onChange={handleAlgoChange}
  />
</RetroSection>
```

### 5. 3D 预览区（未上传算法文件）

```tsx
<RetroPreview height="500px">
  <RetroEmptyState
    icon="box"
    title="NO ALGORITHM LOADED"
    message="Upload .js file to generate 3D preview"
  />
</RetroPreview>
```

### 6. 3D 预览区（算法已上传，使用 ParametricViewer）

```tsx
<RetroPreview height="500px">
  <div className="w-full h-full">
    <ParametricViewer
      userScript={geometryScript}
      parameters={previewParams}
    />
  </div>
</RetroPreview>
```

### 7. 提取的参数列表展示区（无参数）

```tsx
<RetroSection title="EXTRACTED PARAMETERS">
  <div className="py-8 text-center">
    <p className="text-xs text-white/40 font-mono uppercase">
      NO PARAMETERS FOUND
    </p>
    <p className="text-[10px] text-white/30 font-mono mt-1">
      Upload algorithm file to extract parameters
    </p>
  </div>
</RetroSection>
```

### 8. 提取的参数列表展示区（有参数，只读显示）

```tsx
<RetroSection 
  title="EXTRACTED PARAMETERS"
  titleRight={
    <span className="text-[9px] text-green-400">
      ✓ {extractedParameters.length} FOUND
    </span>
  }
>
  <div className="space-y-2 max-h-[300px] overflow-auto hide-scrollbar">
    {extractedParameters.map((param, index) => (
      <div 
        key={index} 
        className="bg-black/40 rounded p-2 border border-white/5"
        style={{
          borderTop: '1px solid #0a0a0a',
          borderLeft: '1px solid #0a0a0a',
          borderBottom: '1px solid #222',
          borderRight: '1px solid #222',
        }}
      >
        {/* 参数名称和类型 */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-white/90 font-mono uppercase font-semibold">
            {param.label || param.name}
          </span>
          <span className="text-[9px] text-white/40 font-mono uppercase px-2 py-0.5 bg-white/5 rounded">
            {param.type}
          </span>
        </div>
        
        {/* 参数值范围（仅 number 类型）*/}
        {param.type === 'number' && (
          <div className="grid grid-cols-3 gap-2 text-[10px] text-white/50 font-mono">
            <div>
              <span className="text-white/40">MIN:</span> {param.min ?? 'N/A'}
            </div>
            <div>
              <span className="text-white/40">MAX:</span> {param.max ?? 'N/A'}
            </div>
            <div>
              <span className="text-white/40">DEFAULT:</span> {param.default ?? 'N/A'}
            </div>
          </div>
        )}
        
        {/* 参数默认值（非 number 类型）*/}
        {param.type !== 'number' && (
          <div className="text-[10px] text-white/50 font-mono">
            <span className="text-white/40">DEFAULT:</span> {String(param.default)}
          </div>
        )}
      </div>
    ))}
  </div>
  
  <style jsx>{`
    .hide-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `}</style>
</RetroSection>
```

**说明**:
- ✅ 只读展示，用户无法修改
- ✅ 显示参数名称、类型、min/max/default
- ✅ 自动从上传的 .js 文件中提取
- ✅ 使用 Retro inset 边框效果
- ✅ 支持滚动（当参数较多时）

---

## ⚠️ 关键技术说明

### 实际实施要点

**与文档初稿的主要差异**:

1. **❌ 不上传 STL/GLB 文件**
   - Publisher 只上传 Cover Image（封面图）和 Algorithm File（.js 算法文件）
   - 不需要处理 STL 加密或 GLB 预览文件

2. **🔧 参数自动提取**
   - 参数不是手动配置的，而是从上传的 .js 文件中自动提取
   - 使用 `useParameters` hook 中的 `processSceneFile(content)` 处理算法文件
   - 提取结果存储在 `extractedParameters` 中
   - Publisher 页面只需**展示**这些参数（只读），不需要编辑功能

3. **🎨 3D 预览生成方式**
   - 使用 `ParametricViewer` 组件
   - 根据上传的算法代码和提取的参数实时生成 3D 几何体
   - 不是加载预先上传的 GLB 文件

4. **📄 现有代码复用**
   - `BasicInfoPage.tsx` - 基本信息和封面上传（可直接复用）
   - `AlgorithmPage.tsx` - 算法上传和预览（可直接复用）
   - `useDesignPublisherForm.ts` - 完整的表单逻辑（可直接复用）
   - `useParameters` hook - 参数提取逻辑（已实现）
   - `ParametricViewer` - 3D 预览组件（已实现）

5. **🎯 重构目标**
   - 将 Page 1 (BasicInfoPage) 和 Page 2 (AlgorithmPage) 合并为单页面
   - 使用 Retro UI 组件重新设计界面
   - 保持所有现有功能和逻辑

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


