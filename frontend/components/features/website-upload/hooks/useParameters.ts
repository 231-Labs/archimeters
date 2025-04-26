import { useState, useCallback } from 'react';
import type { ParameterState } from '../types';

interface GeometryParameter {
  type: 'number' | 'color';
  label: string;
  default: number | string;
  min?: number;
  max?: number;
  current: number | string;
}

interface GeometryParameters {
  [key: string]: GeometryParameter;
}

export function useParameters() {
  const [parameterState, setParameterState] = useState<ParameterState>({
    extractedParameters: {},
    hasExtractedParams: false,
    previewParams: {},
    showPreview: false,
    customScript: null,
  });

  // 創建兼容的腳本對象，保證符合ParametricViewer的要求
  const createCompatibleScript = useCallback((code: string, filename: string = 'script.js') => {
    console.log('Creating compatible script for:', filename);
    
    // 檢查代碼是否已包含createGeometry函數
    if (code.includes('function createGeometry(') || code.includes('createGeometry = function(')) {
      console.log('Using existing createGeometry function');
      return { code, filename };
    }
    
    // 判斷是否為模塊格式並提取必要代碼
    if (code.includes('export') || code.includes('module.exports')) {
      console.log('Converting module format to compatible script');
      let wrappedCode = `
// Original file: ${filename}
// Wrapped for ParametricViewer compatibility
${code}

function createGeometry(THREE, params) {
  // 使用params參數調用模塊中的函數或類
  try {
    // 嘗試ES模塊模式
    if (typeof createMesh === 'function') {
      return createMesh(THREE, params);
    }
    
    // 嘗試CommonJS模式
    if (typeof module !== 'undefined' && module.exports && typeof module.exports.createGeometry === 'function') {
      return module.exports.createGeometry(THREE, params);
    }
    
    // 默認返回一個基本幾何體
    console.warn('Could not find geometry creation function, using fallback');
    return new THREE.TorusGeometry(
      params.radius || 2,
      params.tubeRadius || 0.5,
      params.radialSegments || 16,
      params.tubularSegments || 100
    );
  } catch (error) {
    console.error('Error in createGeometry wrapper:', error);
    return new THREE.SphereGeometry(1, 32, 32);
  }
}`;
      return { code: wrappedCode, filename };
    }
    
    // 如果是普通代碼，也包裝為兼容格式
    console.log('Wrapping plain code with createGeometry function');
    let wrappedCode = `
// Original code wrapped with createGeometry function
${code}

function createGeometry(THREE, params) {
  // 使用上面原始代碼中的變量和函數
  try {
    // 如果代碼中定義了createMesh或類似函數，則調用它
    if (typeof createMesh === 'function') {
      return createMesh(THREE, params);
    }
    
    // 默認返回一個基本幾何體
    return new THREE.TorusGeometry(
      params.radius || 2,
      params.tubeRadius || 0.5,
      params.radialSegments || 16,
      params.tubularSegments || 100
    );
  } catch (error) {
    console.error('Error in createGeometry wrapper:', error);
    return new THREE.SphereGeometry(1, 32, 32);
  }
}`;
    return { code: wrappedCode, filename };
  }, []);

  const processSceneFile = useCallback((code: string) => {
    if (!code || typeof code !== 'string') {
      console.error('Invalid code input:', { code });
      throw new Error('Invalid code input');
    }

    try {
      console.log('====== Processing scene file ======');
      console.log('Code length:', code.length);
      console.log('First 100 chars:', code.substring(0, 100));
      console.log('File format detection...');
      
      // 簡單判斷檔案格式
      if (code.includes('createGeometry')) {
        console.log('✓ Found createGeometry function');
      }
      if (code.includes('export') || code.includes('import')) {
        console.log('✓ Likely ES module format');
      }
      if (code.includes('module.exports') || code.includes('require(')) {
        console.log('✓ Likely CommonJS format');
      }
      if (code.includes('parameters')) {
        console.log('✓ Found parameters reference');
      }
      
      // 支援更多參數定義格式
      const paramPatterns = [
        /(?:export\s+)?const\s+parameters\s*=\s*(\{[\s\S]*?\})\s*;/,    // 對象格式
        /(?:export\s+)?const\s+parameters\s*=\s*(\[[\s\S]*?\])\s*;/,    // 陣列格式
        /(?:export\s+)?const\s+defaultParameters\s*=\s*(\{[\s\S]*?\})\s*;/, // TestPage 格式
        /module\.parameters\s*=\s*(\{[\s\S]*?\})\s*;/,                  // CommonJS 對象格式
        /module\.parameters\s*=\s*(\[[\s\S]*?\])\s*;/,                  // CommonJS 陣列格式
        /function\s+createGeometry\s*\([^)]*\)\s*\{[\s\S]*?return[^;]*;/  // 直接從 createGeometry 函數提取
      ];

      let parametersMatch = null;
      let extractedCode = '';

      // 嘗試所有模式
      for (const pattern of paramPatterns) {
        const match = code.match(pattern);
        if (match) {
          console.log('Matched pattern:', pattern.toString().substring(0, 50));
          if (pattern.toString().includes('createGeometry')) {
            // 從 createGeometry 函數提取參數
            const geometryCode = match[0];
            console.log('Extracted geometry code:', geometryCode.substring(0, 100));
            const paramMatches = geometryCode.match(/(\w+):\s*([^,}\s]+)/g);
            if (paramMatches) {
              console.log('Found param matches in createGeometry:', paramMatches);
              const paramsObj: Record<string, any> = {};
              paramMatches.forEach(param => {
                const [key, value] = param.split(':').map(s => s.trim());
                if (key && !['new', 'return', 'function'].includes(key)) {
                  (paramsObj as Record<string, any>)[key] = {
                    type: 'number',
                    label: key,
                    default: parseFloat(value) || 0,
                    min: 0,
                    max: 100,
                    current: parseFloat(value) || 0
                  };
                }
              });
              extractedCode = JSON.stringify(paramsObj);
              break;
            }
          } else {
            extractedCode = match[1];
            break;
          }
        }
      }

      if (!extractedCode) {
        // 沒有找到模式匹配，嘗試從函數參數中提取
        console.log('No pattern match, attempting to extract from function directly');
        const funcMatch = code.match(/function\s+createGeometry\s*\(\s*THREE\s*(?:,\s*params)?\s*\)/);
        if (funcMatch) {
          console.log('Found createGeometry function, extracting default parameters');
          // 從普通的參數聲明中提取
          const paramExtractions = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*params\.(\w+)\s*\|\|\s*([^;]+);/g);
          if (paramExtractions && paramExtractions.length > 0) {
            console.log('Found param declarations:', paramExtractions);
            const paramsObj: Record<string, any> = {};
            paramExtractions.forEach(extraction => {
              const match = extraction.match(/(?:const|let|var)\s+(\w+)\s*=\s*params\.(\w+)\s*\|\|\s*([^;]+);/);
              if (match) {
                const [_, varName, paramName, defaultValue] = match;
                console.log(`Found param: ${paramName} with default ${defaultValue}`);
                let parsedValue: string | number = defaultValue.trim();
                // 嘗試將數值字符串轉換為數字
                if (!isNaN(Number(parsedValue)) && typeof parsedValue === 'string') {
                  parsedValue = Number(parsedValue);
                }
                // 處理顏色值
                if (typeof parsedValue === 'string' && parsedValue.startsWith('#')) {
                  paramsObj[paramName] = {
                    type: 'color',
                    label: paramName,
                    default: parsedValue,
                    current: parsedValue
                  };
                } else {
                  // 確保是數字類型
                  paramsObj[paramName] = {
                    type: 'number',
                    label: paramName,
                    default: typeof parsedValue === 'number' ? parsedValue : 0,
                    min: 0,
                    max: typeof parsedValue === 'number' ? parsedValue * 2 : 100,
                    current: typeof parsedValue === 'number' ? parsedValue : 0
                  };
                }
              }
            });
            
            if (Object.keys(paramsObj).length > 0) {
              console.log('Extracted params from declarations:', paramsObj);
              extractedCode = JSON.stringify(paramsObj);
            }
          }
        }
      }

      if (!extractedCode) {
        console.error('Could not find parameters definition in code:', code);
        throw new Error('Could not find parameters definition in code');
      }

      console.log('Found parameters definition:', extractedCode);

      let parameters: GeometryParameters | GeometryParameter[];
      try {
        // 清理代碼
        let cleanCode = extractedCode
          .replace(/(\w+):/g, '"$1":')  // 將鍵名轉換為字符串
          .replace(/'([^']*?)'/g, '"$1"')  // 將單引號轉換為雙引號
          .replace(/,(\s*[}\]])/g, '$1')  // 移除尾隨逗號
          .replace(/\/\/.*/g, '')  // 移除單行註釋
          .replace(/\/\*[\s\S]*?\*\//g, ''); // 移除多行註釋
        
        console.log('Cleaned code:', cleanCode);
        
        parameters = JSON.parse(cleanCode);
      } catch (parseError) {
        console.error('JSON parsing failed, trying Function:', parseError);
        try {
          parameters = new Function(`return ${extractedCode}`)();
        } catch (funcError) {
          console.error('Function parsing failed:', funcError);
          // 如果都失敗了，嘗試直接從 createGeometry 提取
          const geometryMatch = code.match(/function\s+createGeometry\s*\([^)]*\)\s*\{[\s\S]*?return[^;]*;/);
          if (geometryMatch) {
            const geometryCode = geometryMatch[0];
            const paramMatches = geometryCode.match(/(\w+):\s*([^,}\s]+)/g);
            if (paramMatches) {
              parameters = {};
              paramMatches.forEach(param => {
                const [key, value] = param.split(':').map(s => s.trim());
                if (key && !['new', 'return', 'function'].includes(key)) {
                  (parameters as Record<string, any>)[key] = {
                    type: 'number',
                    label: key,
                    default: parseFloat(value) || 0,
                    min: 0,
                    max: 100,
                    current: parseFloat(value) || 0
                  };
                }
              });
            } else {
              throw new Error('Could not extract parameters from geometry function');
            }
          } else {
            throw new Error('Parameter parsing failed');
          }
        }
      }

      // 標準化參數格式
      const extractedParams: GeometryParameters = {};
      
      if (Array.isArray(parameters)) {
        parameters.forEach((param: any, index: number) => {
          const key = param.key || `param${index}`;
          extractedParams[key] = {
            type: param.type || 'number',
            label: param.label || key,
            default: param.default ?? 0,
            min: param.min ?? 0,
            max: param.max ?? 100,
            current: param.default ?? 0
          };
        });
      } else if (typeof parameters === 'object' && parameters !== null) {
        Object.entries(parameters).forEach(([key, param]: [string, any]) => {
          if (typeof param === 'object') {
            extractedParams[key] = {
              type: param.type || 'number',
              label: param.label || key,
              default: param.default ?? param.current ?? 0,
              min: param.min ?? 0,
              max: param.max ?? 100,
              current: param.current ?? param.default ?? 0
            };
          } else {
            extractedParams[key] = {
              type: typeof param === 'string' && param.startsWith('#') ? 'color' : 'number',
              label: key,
              default: param,
              min: 0,
              max: typeof param === 'number' ? param * 2 : 100,
              current: param
            };
          }
        });
      }

      console.log('Successfully extracted parameters:', extractedParams);

      if (Object.keys(extractedParams).length === 0) {
        throw new Error('No valid parameters found in code');
      }

      setParameterState(prev => ({
        ...prev,
        extractedParameters: extractedParams,
        hasExtractedParams: true,
        previewParams: Object.fromEntries(
          Object.entries(extractedParams).map(([key, value]) => [key, value.default])
        ),
      }));

      return extractedParams;
    } catch (error: any) {
      console.error('Error processing scene file:', error);
      throw new Error(`Parameter parsing failed: ${error.message}`);
    }
  }, []);

  const updateParameter = useCallback((key: string, value: any) => {
    setParameterState(prev => ({
      ...prev,
      previewParams: {
        ...prev.previewParams,
        [key]: value,
      },
    }));
  }, []);

  const togglePreview = useCallback(() => {
    setParameterState(prev => ({
      ...prev,
      showPreview: !prev.showPreview,
    }));
  }, []);

  const resetParameters = useCallback(() => {
    setParameterState({
      extractedParameters: {},
      hasExtractedParams: false,
      previewParams: {},
      showPreview: false,
      customScript: null,
    });
  }, []);

  return {
    ...parameterState,
    processSceneFile,
    updateParameter,
    togglePreview,
    resetParameters,
  };
} 