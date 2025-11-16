/**
 * Script Detection Utilities
 * 自動偵測用戶上傳的腳本類型，判斷是 3D 可列印還是 2D/動畫作品
 */

export interface ScriptAnalysis {
  isPrintable: boolean;
  confidence: 'high' | 'medium' | 'low';
  detectedFeatures: string[];
  recommendedMode: '3d-static' | '2d-animated';
}

/**
 * 分析用戶腳本，自動偵測是否為可列印的 3D 物件
 * @param code - 用戶上傳的 JavaScript 代碼
 * @returns 分析結果
 */
export function analyzeScript(code: string): ScriptAnalysis {
  const detectedFeatures: string[] = [];
  let isPrintable = true; // 默認假設是可列印的
  let confidence: 'high' | 'medium' | 'low' = 'high';

  // 檢查是否有明確的類型標記
  if (code.includes('isPrintable: false') || code.includes('printable: false')) {
    detectedFeatures.push('explicit-non-printable-flag');
    isPrintable = false;
    confidence = 'high';
  } else if (code.includes('isPrintable: true') || code.includes('printable: true')) {
    detectedFeatures.push('explicit-printable-flag');
    isPrintable = true;
    confidence = 'high';
  }

  // 檢查是否有動畫相關函數
  const hasAnimateFunction = /function\s+animate\s*\(/.test(code) || 
                             /const\s+animate\s*=/.test(code) ||
                             /\.animate\s*=/.test(code);
  
  if (hasAnimateFunction) {
    detectedFeatures.push('animate-function');
    isPrintable = false;
    confidence = 'high';
  }

  // 檢查是否返回 Group 或多個物件（通常是複雜場景）
  if (/return\s+group/.test(code) || /return\s+scene/.test(code)) {
    detectedFeatures.push('scene-group-return');
    if (!isPrintable) {
      confidence = 'high';
    } else {
      confidence = 'medium';
    }
  }

  // 檢查是否使用粒子系統（不可列印）
  if (code.includes('ParticleSystem') || code.includes('Points') || code.includes('PointsMaterial')) {
    detectedFeatures.push('particle-system');
    isPrintable = false;
    confidence = 'high';
  }

  // 檢查是否使用 Shader（可能是藝術作品）
  if (code.includes('ShaderMaterial') || code.includes('vertexShader') || code.includes('fragmentShader')) {
    detectedFeatures.push('custom-shaders');
    isPrintable = false;
    confidence = 'high';
  }

  // 檢查是否使用 Sprite（2D）
  if (code.includes('Sprite') || code.includes('SpriteMaterial')) {
    detectedFeatures.push('sprites');
    isPrintable = false;
    confidence = 'high';
  }

  // 檢查是否使用後處理效果（不可列印）
  if (code.includes('EffectComposer') || code.includes('RenderPass') || code.includes('BloomPass')) {
    detectedFeatures.push('post-processing');
    isPrintable = false;
    confidence = 'high';
  }

  // 檢查是否返回標準的 BufferGeometry（可列印的標誌）
  if (/return\s+geometry/.test(code) && code.includes('BufferGeometry')) {
    detectedFeatures.push('buffer-geometry-return');
    if (isPrintable) {
      confidence = 'high';
    }
  }

  // 檢查是否使用 requestAnimationFrame（動畫循環）
  if (code.includes('requestAnimationFrame')) {
    detectedFeatures.push('animation-loop');
    isPrintable = false;
    confidence = 'high';
  }

  // 檢查是否有時間參數（time parameter）
  if (/createGeometry\s*\(\s*THREE\s*,\s*params\s*,\s*time\s*\)/.test(code)) {
    detectedFeatures.push('time-parameter');
    isPrintable = false;
    confidence = 'high';
  }

  // 如果沒有偵測到任何特徵，降低信心度
  if (detectedFeatures.length === 0) {
    confidence = 'low';
  }

  const recommendedMode = isPrintable ? '3d-static' : '2d-animated';

  return {
    isPrintable,
    confidence,
    detectedFeatures,
    recommendedMode,
  };
}

/**
 * 從腳本中提取明確的 printable 標記（如果有的話）
 * @param code - 用戶腳本
 * @returns boolean | null（null 表示沒有明確標記）
 */
export function extractPrintableFlag(code: string): boolean | null {
  // 檢查 window 物件導出
  const windowExportMatch = code.match(/window\.\w+\s*=\s*\{[^}]*printable:\s*(true|false)/);
  if (windowExportMatch) {
    return windowExportMatch[1] === 'true';
  }

  // 檢查註解標記
  const commentMatch = code.match(/@printable\s+(true|false)/);
  if (commentMatch) {
    return commentMatch[1] === 'true';
  }

  // 檢查常數定義
  const constMatch = code.match(/const\s+IS_PRINTABLE\s*=\s*(true|false)/);
  if (constMatch) {
    return constMatch[1] === 'true';
  }

  return null;
}

/**
 * 生成友好的提示訊息
 * @param analysis - 分析結果
 * @returns 提示訊息
 */
export function getRecommendationMessage(analysis: ScriptAnalysis): string {
  if (analysis.confidence === 'high') {
    if (analysis.isPrintable) {
      return '偵測到標準 3D 幾何體，建議選擇「可列印」模式';
    } else {
      return `偵測到${analysis.detectedFeatures.includes('animate-function') ? '動畫' : '特殊'}效果，建議選擇「動畫/2D」模式`;
    }
  } else if (analysis.confidence === 'medium') {
    return '無法確定作品類型，請手動選擇適合的模式';
  } else {
    return '未偵測到明確特徵，默認為「可列印」模式';
  }
}

