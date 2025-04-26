import { useState, useCallback } from 'react';
import type { ParameterState } from '../types';

export function useParameters() {
  const [parameterState, setParameterState] = useState<ParameterState>({
    extractedParameters: {},
    hasExtractedParams: false,
    previewParams: {},
    showPreview: false,
  });

  const processSceneFile = useCallback((code: string) => {
    if (!code || typeof code !== 'string') {
      console.error('無效的代碼輸入:', { code });
      throw new Error('無效的代碼輸入');
    }

    try {
      console.log('開始處理場景檔案');
      console.log('代碼長度:', code.length);
      
      // 嘗試匹配不同的參數定義格式
      let parametersMatch = code.match(/(?:export\s+)?const\s+parameters\s*=\s*(\[[\s\S]*?\])\s*;/) ||  // 陣列格式
                           code.match(/(?:export\s+)?const\s+parameters\s*=\s*({[\s\S]*?})\s*;/) ||     // 對象格式
                           code.match(/module\.parameters\s*=\s*(\[[\s\S]*?\])\s*;/);                    // CommonJS 格式
      
      if (!parametersMatch) {
        console.error('無法找到參數定義，完整代碼:', code);
        throw new Error('無法在代碼中找到 parameters 定義');
      }

      console.log('找到參數定義:', parametersMatch[0]);

      // 提取參數代碼
      const parametersCode = parametersMatch[1].trim();
      console.log('提取的參數代碼:', parametersCode);

      // 判斷是陣列還是對象格式
      const isArray = parametersCode.startsWith('[');
      
      let parameters;
      try {
        // 清理代碼，處理可能的格式問題
        let cleanCode = parametersCode
          .replace(/(\w+):/g, '"$1":')  // 將鍵名轉換為字符串
          .replace(/'([^']*?)'/g, '"$1"')  // 將單引號轉換為雙引號
          .replace(/,(\s*[}\]])/g, '$1')  // 移除尾隨逗號
          .replace(/\/\/.*/g, '');  // 移除單行註釋
        
        console.log('清理後的代碼:', cleanCode);
        
        parameters = JSON.parse(cleanCode);
        console.log('解析後的參數:', parameters);
      } catch (parseError: unknown) {
        console.error('JSON解析失敗，嘗試使用 Function:', parseError);
        // 如果 JSON.parse 失敗，嘗試使用 Function
        try {
          const func = new Function(`return ${parametersCode}`);
          parameters = func();
          console.log('使用 Function 解析的參數:', parameters);
        } catch (funcError: unknown) {
          if (funcError instanceof Error) {
            throw new Error(`參數解析失敗: ${funcError.message}`);
          }
          throw new Error('參數解析失敗：未知錯誤');
        }
      }

      // 將參數轉換為標準格式
      const extractedParams: Record<string, any> = {};
      
      if (Array.isArray(parameters)) {
        // 處理陣列格式
        parameters.forEach((param: any, index: number) => {
          if (!param.key) {
            throw new Error(`參數 ${index} 缺少 key 屬性`);
          }
          extractedParams[param.key] = {
            type: param.type || 'string',
            label: param.label || param.key,
            default: param.default,
            min: param.min,
            max: param.max,
            current: param.default,
          };
        });
      } else if (typeof parameters === 'object' && parameters !== null) {
        // 處理對象格式
        Object.entries(parameters).forEach(([key, param]: [string, any]) => {
          extractedParams[key] = {
            type: param.type || 'string',
            label: param.label || key,
            default: param.default,
            min: param.min,
            max: param.max,
            current: param.default,
          };
        });
      } else {
        throw new Error('無效的參數格式');
      }

      console.log('成功提取所有參數:', extractedParams);

      setParameterState((prev: ParameterState) => {
        const newState = {
          ...prev,
          extractedParameters: extractedParams,
          hasExtractedParams: Object.keys(extractedParams).length > 0,
          previewParams: Object.fromEntries(
            Object.entries(extractedParams).map(([key, value]) => [key, value.default])
          ),
        };
        console.log('更新後的狀態:', newState);
        return newState;
      });

      return extractedParams;
    } catch (error: any) {
      console.error('處理場景檔案時出錯:', {
        error,
        errorMessage: error.message,
        errorStack: error.stack
      });
      throw new Error(`參數解析失敗: ${error.message}`);
    }
  }, []);

  const updateParameter = useCallback((key: string, value: string | number) => {
    setParameterState((prev: ParameterState) => ({
      ...prev,
      previewParams: {
        ...prev.previewParams,
        [key]: value,
      },
    }));
  }, []);

  const togglePreview = useCallback(() => {
    setParameterState((prev: ParameterState) => ({
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