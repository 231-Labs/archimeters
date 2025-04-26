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
  });

  const processSceneFile = useCallback((code: string) => {
    if (!code || typeof code !== 'string') {
      console.error('Invalid code input:', { code });
      throw new Error('Invalid code input');
    }

    try {
      console.log('Processing scene file');
      console.log('Code length:', code.length);
      
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
          if (pattern.toString().includes('createGeometry')) {
            // 從 createGeometry 函數提取參數
            const geometryCode = match[0];
            const paramMatches = geometryCode.match(/(\w+):\s*([^,}\s]+)/g);
            if (paramMatches) {
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