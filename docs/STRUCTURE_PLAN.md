# 📁 Docs 文件結構重組計劃

## 現況分析

### 😵 當前混亂之處

```
docs/
├── hackathon/ (10 個混亂的檔案)
│   ├── DAILY_LOGS_ARCHIVE.md
│   ├── DAY3_TASKS.md
│   ├── FEATURE_COMPLETION_MATRIX.md
│   ├── implementation-plan.md (重複)
│   ├── notes.md
│   ├── PAVILION_IFRAME_INTEGRATION.md
│   ├── progress.md
│   ├── README.md
│   ├── SEAL_IMPLEMENTATION_PLAN.md
│   └── WINDOW_SYSTEM_REFACTOR.md
├── deployment/ (6 個部署檔案)
├── archive/ (過時歷史檔案)
└── architecture/ (系統設計文檔)
```

**問題**:
- ❌ hackathon/ 太多混亂的檔案沒有分類
- ❌ deployment/ 文檔應該移到其他地方
- ❌ archive/ 東西太舊，沒有清晰的索引
- ❌ 沒有明確的文檔導航

---

## ✅ 推薦的新結構

```
docs/
├── README.md ⭐ (主導航索引)
│
├── quickstart/
│   ├── README.md (3 分鐘快速開始)
│   ├── LOCAL_SETUP.md (本地開發環境)
│   ├── DEPLOYMENT.md (部署指南)
│   └── FAQ.md (常見問題)
│
├── architecture/
│   ├── README.md (系統架構概述)
│   ├── MARKETPLACE.md (已有)
│   ├── SECURITY.md (已有)
│   └── COMPONENTS.md (新增 - 組件說明)
│
├── hackathon/ (當前黑客松進度)
│   ├── README.md ⭐ (黑客松概述)
│   ├── progress.md ⭐ (進度表 - 每日更新)
│   │
│   ├── 📊 Status/
│   │   ├── FEATURE_COMPLETION_MATRIX.md ⭐
│   │   └── DAILY_LOGS_ARCHIVE.md (歷史日誌)
│   │
│   ├── 🛠️ Implementation/ (具體實施計劃)
│   │   ├── SEAL_IMPLEMENTATION_PLAN.md
│   │   ├── PUBLISHER_RETRO_UI_REDESIGN.md
│   │   ├── PAVILION_IFRAME_INTEGRATION.md
│   │   └── WINDOW_SYSTEM_REFACTOR.md
│   │
│   └── 📋 Tasks/ (具體任務)
│       └── DAY3_TASKS.md
│
├── archive/ (歷史版本 & 已完成的項目)
│   ├── README.md (檔案說明)
│   │
│   ├── phase1/ (Phase 1 開發日誌)
│   │   ├── PHASE1_SUMMARY.md
│   │   ├── development-logs/
│   │   │   ├── DEPLOYMENT_LOG.md
│   │   │   ├── FRONTEND_UPDATE_GUIDE.md
│   │   │   └── PHASE1.5_ATELIER_GENERIC.md
│   │   └── MIGRATION_GUIDES/
│   │       └── GENERIC_TYPE_SAFETY.md
│   │
│   ├── phase2/ (Phase 2 開發日誌)
│   │   ├── PHASE2_SUMMARY.md
│   │   ├── DEPLOYMENT_SUMMARY_PHASE2.4.md
│   │   ├── PHASE2_2_DEPLOYMENT.md
│   │   ├── development-logs/
│   │   │   ├── DEPLOYMENT_GUIDE.md
│   │   │   └── TESTING_SUMMARY.md
│   │   └── SECURITY/
│   │       └── POOL_CAP_SECURITY.md
│   │
│   └── migration-guides/
│       ├── GENERIC_TYPE_SAFETY.md
│       ├── PARTY_TRANSFER_MIGRATION.md
│       └── REFACTORING_PLAN.md
│
└── deprecated/ (完全過時的文檔)
    ├── deployment/ (移自 docs/deployment/)
    │   ├── DEPLOY_SCRIPTS.md
    │   ├── DEPLOYMENT_SUCCESS.md
    │   ├── QUICK_START.md
    │   └── deploy_output.log
    └── legacy-notes.md (移自 hackathon/notes.md & implementation-plan.md)
```

---

## 📋 執行步驟

### Step 1: 建立新的目錄結構

```bash
# 新增主目錄
mkdir -p docs/quickstart
mkdir -p docs/hackathon/{status,implementation,tasks}
mkdir -p docs/deprecated/deployment
mkdir -p docs/archive/{phase1,phase2}/{development-logs,migration-guides}
```

### Step 2: 移動黑客松相關文檔

**保留在 `hackathon/`**:
- ✅ progress.md (進度表 - 實時更新)
- ✅ FEATURE_COMPLETION_MATRIX.md → `hackathon/status/`
- ✅ DAILY_LOGS_ARCHIVE.md → `hackathon/status/`
- ✅ SEAL_IMPLEMENTATION_PLAN.md → `hackathon/implementation/`
- ✅ PAVILION_IFRAME_INTEGRATION.md → `hackathon/implementation/`
- ✅ WINDOW_SYSTEM_REFACTOR.md → `hackathon/implementation/`
- ✅ DAY3_TASKS.md → `hackathon/tasks/`
- ✅ README.md (黑客松概述)

**刪除 (已過時)**:
- ❌ implementation-plan.md (功能被 FEATURE_COMPLETION_MATRIX 和 progress 取代)
- ❌ notes.md (不重要的零散筆記)

### Step 3: 處理 archive 文檔

**重組 archive/**:
- 按 Phase 1 / Phase 2 分類
- 保留所有 SUMMARY 和 TESTING 文檔
- migration-guides 保留

### Step 4: 遷移 deployment 文檔

**移至 `deprecated/deployment/`**:
- deployment/ 底下的所有檔案都是過時的
- 新的部署指南應該在 `quickstart/DEPLOYMENT.md`

### Step 5: 建立新的導航文檔

- `docs/README.md` (主導航)
- `docs/hackathon/README.md` (黑客松導航)
- `docs/archive/README.md` (存檔說明)
- `docs/deprecated/README.md` (過時文檔說明)

---

## 🎯 優先級

### 立即執行 (High Priority)

1. **創建新目錄結構** (10 分鐘)
2. **移動黑客松文檔到 subdirs** (5 分鐘)
3. **更新 README 導航** (15 分鐘)

### 後續完成 (Medium Priority)

4. **建立快速開始指南** (`quickstart/`)
5. **重組 archive 文檔**
6. **更新所有 import 路徑** (如果檔案在代碼中被引用)

### 可選 (Low Priority)

7. 整理過時的 deployment 文檔

---

## 📝 涉及的檔案

### 需要移動的

| 源檔案 | 目標位置 | 操作 |
|--------|---------|------|
| `hackathon/FEATURE_COMPLETION_MATRIX.md` | `hackathon/status/` | Move |
| `hackathon/DAILY_LOGS_ARCHIVE.md` | `hackathon/status/` | Move |
| `hackathon/SEAL_IMPLEMENTATION_PLAN.md` | `hackathon/implementation/` | Move |
| `hackathon/PAVILION_IFRAME_INTEGRATION.md` | `hackathon/implementation/` | Move |
| `hackathon/WINDOW_SYSTEM_REFACTOR.md` | `hackathon/implementation/` | Move |
| `hackathon/DAY3_TASKS.md` | `hackathon/tasks/` | Move |
| `deployment/*` | `deprecated/deployment/` | Move |

### 需要刪除的

| 檔案 | 原因 |
|------|------|
| `hackathon/implementation-plan.md` | 功能被新文檔取代 |
| `hackathon/notes.md` | 不重要的零散筆記 |

### 需要建立的

| 檔案 | 用途 |
|------|------|
| `docs/README.md` | 主導航索引 |
| `docs/quickstart/README.md` | 快速開始 |
| `docs/quickstart/LOCAL_SETUP.md` | 本地開發 |
| `docs/quickstart/DEPLOYMENT.md` | 部署指南 |
| `docs/hackathon/README.md` | 黑客松概述 |
| `docs/deprecated/README.md` | 過時檔案說明 |

---

## ✨ 完成後的優點

✅ **更清晰的結構**：一目了然的層級和分類  
✅ **易於導航**：每個目錄都有 README 導航  
✅ **易於維護**：新增檔案時知道放在哪裡  
✅ **更好的可讀性**：相關檔案聚集在一起  
✅ **歷史保留**：重要文檔不會丟失  

---

## 🎬 是否執行?

請確認，我會立即執行：
- [ ] 是，全部執行
- [ ] 是，只做 Step 1-3 (高優先級)
- [ ] 其他調整...

