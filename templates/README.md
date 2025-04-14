# Project Configuration File Documentation

[English](#project-configuration-file-documentation) | [中文](#專案配置文件說明)

## Configuration File Structure

The configuration file uses JSON format and contains the following main sections:

### Basic Information
- `project.name`: Project name (required)
- `project.description`: Project description (required)
- `project.designFee`: Design fee in ETH (required, must be positive)

### Timeline
- `project.timeline.startDate`: Start date (required, format: YYYY-MM-DD)
- `project.timeline.endDate`: End date (required, format: YYYY-MM-DD)

### Design Settings
- `project.design.modelFile`: Path to 3D model file (required)
- `project.design.previewImage`: Path to preview image (required)

#### Design Overrides (Optional)
- `project.design.overrides.parameters`:
  - `width`: Model width (optional, number)
  - `height`: Model height (optional, number)
  - `depth`: Model depth (optional, number)
- `project.design.overrides.camera`:
  - `position`: Camera position [x, y, z] (optional)
  - `target`: Camera target [x, y, z] (optional)
- `project.design.overrides.materials`:
  - `color`: Material color (optional, format: #RRGGBB)

### Website Output Settings
- `project.output.website.title`: Website title (required)
- `project.output.website.description`: Website description (required)
- `project.output.website.theme`: Theme choice ('light' or 'dark', required)
- `project.output.website.features`:
  - `modelViewer`: Enable 3D model viewer (boolean)
  - `parameterControls`: Enable parameter controls (boolean)
  - `materialPreview`: Enable material preview (boolean)

## Example

```json
{
  "project": {
    "name": "Modern Parametric Table",
    "description": "A customizable parametric table design",
    "designFee": 1.5,
    "timeline": {
      "startDate": "2024-04-15",
      "endDate": "2024-05-15"
    },
    "design": {
      "modelFile": "models/table.glb",
      "previewImage": "images/preview.png",
      "overrides": {
        "parameters": {
          "width": 1200,
          "height": 750,
          "depth": 600
        },
        "camera": {
          "position": [0, 5, 10],
          "target": [0, 0, 0]
        },
        "materials": {
          "color": "#8B4513"
        }
      }
    },
    "output": {
      "website": {
        "title": "Parametric Table Configurator",
        "description": "Interactive 3D table configurator",
        "theme": "light",
        "features": {
          "modelViewer": true,
          "parameterControls": true,
          "materialPreview": true
        }
      }
    }
  }
}
```

## Notes
1. All numeric values must be valid numbers
2. Dates must follow YYYY-MM-DD format
3. Color codes must use hexadecimal format (#RRGGBB)
4. Design fee must be a positive number in ETH
5. File paths should be relative to the project root
6. Camera positions and targets use [x, y, z] coordinate arrays

---

# 專案配置文件說明

## 配置文件結構

配置文件使用 JSON 格式，包含以下主要部分：

### 基本信息
- `project.name`：專案名稱（必填）
- `project.description`：專案描述（必填）
- `project.designFee`：設計費用，單位為 ETH（必填，必須為正數）

### 時間線
- `project.timeline.startDate`：開始日期（必填，格式：YYYY-MM-DD）
- `project.timeline.endDate`：結束日期（必填格式：YYYY-MM-DD）

### 設計設置
- `project.design.modelFile`：3D 模型文件路徑（必填）
- `project.design.previewImage`：預覽圖片路徑（必填）

#### 設計覆蓋選項（可選）
- `project.design.overrides.parameters`：
  - `width`：模型寬度（可選，數字）
  - `height`：模型高度（可選，數字）
  - `depth`：模型深度（可選，數字）
- `project.design.overrides.camera`：
  - `position`：相機位置 [x, y, z]（可選）
  - `target`：相機目標點 [x, y, z]（可選）
- `project.design.overrides.materials`：
  - `color`：材質顏色（可選，格式：#RRGGBB）

### 網站輸出設置
- `project.output.website.title`：網站標題（必填）
- `project.output.website.description`：網站描述（必填）
- `project.output.website.theme`：主題選擇（'light' 或 'dark'，必填）
- `project.output.website.features`：
  - `modelViewer`：啟用 3D 模型查看器（布爾值）
  - `parameterControls`：啟用參數控制（布爾值）
  - `materialPreview`：啟用材質預覽（布爾值）

## 示例

```json
{
  "project": {
    "name": "現代參數化桌子",
    "description": "一個可自定義的參數化桌子設計",
    "designFee": 1.5,
    "timeline": {
      "startDate": "2024-04-15",
      "endDate": "2024-05-15"
    },
    "design": {
      "modelFile": "models/table.glb",
      "previewImage": "images/preview.png",
      "overrides": {
        "parameters": {
          "width": 1200,
          "height": 750,
          "depth": 600
        },
        "camera": {
          "position": [0, 5, 10],
          "target": [0, 0, 0]
        },
        "materials": {
          "color": "#8B4513"
        }
      }
    },
    "output": {
      "website": {
        "title": "參數化桌子配置器",
        "description": "互動式 3D 桌子配置器",
        "theme": "light",
        "features": {
          "modelViewer": true,
          "parameterControls": true,
          "materialPreview": true
        }
      }
    }
  }
}
```

## 注意事項
1. 所有數值必須是有效的數字
2. 日期必須遵循 YYYY-MM-DD 格式
3. 顏色代碼必須使用十六進制格式（#RRGGBB）
4. 設計費用必須是正數，單位為 ETH
5. 文件路徑應相對於專案根目錄
6. 相機位置和目標點使用 [x, y, z] 坐標數組 