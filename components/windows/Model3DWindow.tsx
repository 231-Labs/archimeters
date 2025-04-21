'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Parameters, defaultParameters } from '../3d/ParametricScene';
import ParametricScene from '../3d/ParametricScene';

interface Model3DWindowProps {
  onClose: () => void;
}

interface CustomParameterDef {
  type: string;
  default: any;
  label: string;
  [key: string]: any;
}

interface CustomParameters {
  [key: string]: CustomParameterDef;
}

const MODEL_TYPES = {
  BUILT_IN: 'built-in',
  CUSTOM: 'custom',
};

const Model3DWindow: React.FC<Model3DWindowProps> = () => {
  // 基本狀態
  const [parameters, setParameters] = useState<Parameters>(() => 
    Object.fromEntries(
      Object.entries(defaultParameters).map(([key, value]) => [key, value.default])
    ) as Parameters
  );
  const [inputValues, setInputValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(defaultParameters).map(([key, value]) => [key, value.default.toString()])
    )
  );

  // 文件上傳狀態
  const [activeTab, setActiveTab] = useState('parameters'); // 'parameters' | 'upload'
  const [modelType, setModelType] = useState(MODEL_TYPES.BUILT_IN);
  const [customParameters, setCustomParameters] = useState<CustomParameters>({});
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // 當選擇內置模型時，使用默認參數
  useEffect(() => {
    if (modelType === MODEL_TYPES.BUILT_IN) {
      setParameters(() => 
        Object.fromEntries(
          Object.entries(defaultParameters).map(([key, value]) => [key, value.default])
        ) as Parameters
      );
      setInputValues(() =>
        Object.fromEntries(
          Object.entries(defaultParameters).map(([key, value]) => [key, value.default.toString()])
        )
      );
    }
  }, [modelType]);

  // 參數變更處理函數
  const handleParameterChange = useCallback((key: string, value: string) => {
    const currentParams = modelType === MODEL_TYPES.BUILT_IN 
      ? (defaultParameters as unknown as Record<string, CustomParameterDef>)
      : customParameters;
    
    const paramDef = currentParams[key];
    
    if (!paramDef) return;
    
    setInputValues(prev => ({ ...prev, [key]: value }));

    if (paramDef.type === 'number') {
      const defaultValue = paramDef.default as number;
      const parsedValue = value === '' ? defaultValue : Number(value);
      if (isNaN(parsedValue)) return;
      setParameters(prev => ({
        ...prev,
        [key]: parsedValue
      }));
    } else if (paramDef.type === 'color') {
      setParameters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  }, [modelType, customParameters]);

  // 處理文件上傳
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        processSceneFile(content);
        setActiveTab('parameters');
      } catch (err: any) {
        setError(`Error reading file: ${err.message || err}`);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsText(file);
  };

  // 處理場景文件分析
  const processSceneFile = (code: string) => {
    try {
      // 使用正則表達式提取 defaultParameters
      const parametersMatch = code.match(/export\s+const\s+defaultParameters\s*=\s*({[\s\S]*?})(?:\s+as\s+const)?;/);
      
      if (parametersMatch && parametersMatch[1]) {
        // 將提取的參數字符串轉換為有效的 JSON
        let paramStr = parametersMatch[1];
        
        // 1. 將屬性名稱轉換為帶雙引號的格式
        paramStr = paramStr.replace(/(\w+):/g, '"$1":');
        
        // 2. 將單引號字符串轉換為雙引號字符串
        paramStr = paramStr.replace(/'([^']*?)'/g, '"$1"');
        
        // 3. 處理尾隨逗號
        paramStr = paramStr.replace(/,(\s*[}\]])/g, '$1');
        
        console.log("Processed param string:", paramStr);
        
        // 嘗試解析 JSON
        const extractedParams = JSON.parse(paramStr);
        
        setCustomParameters(extractedParams);
        setModelType(MODEL_TYPES.CUSTOM);
        
        // 更新輸入參數
        const initialParams = Object.fromEntries(
          Object.entries(extractedParams).map(([key, value]: [string, any]) => [key, value.default])
        );
        setParameters(initialParams as any);
        
        const initialInputs = Object.fromEntries(
          Object.entries(extractedParams).map(([key, value]: [string, any]) => [key, value.default.toString()])
        );
        setInputValues(initialInputs);
      } else {
        throw new Error("Could not extract parameters from code");
      }
    } catch (err) {
      console.error("Error processing scene file:", err);
      setError(`Failed to process scene file: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 切換回內置模型
  const switchToBuiltIn = () => {
    setModelType(MODEL_TYPES.BUILT_IN);
    setFileName(null);
    setError(null);
  };

  // 渲染參數輸入
  const renderParameterInput = (key: string, paramDef: CustomParameterDef) => {
    const value = inputValues[key] ?? (parameters as any)[key] ?? paramDef.default;

    if (paramDef.type === 'color') {
      return (
        <div key={key} className="mb-6">
          <label className="block text-sm font-medium mb-1 text-white/90">
            {paramDef.label}
          </label>
          <input
            type="color"
            value={value}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="w-full h-8 cursor-pointer"
          />
        </div>
      );
    }

    return (
      <div key={key} className="mb-6">
        <label className="block text-sm font-medium mb-1 text-white/90">
          {paramDef.label}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => handleParameterChange(key, e.target.value)}
          className="w-full px-3 py-1.5 bg-[#2a2a2a] text-white border border-[#3a3a3a] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    );
  };

  // 渲染參數面板
  const renderParametersPanel = () => {
    const paramsToRender = modelType === MODEL_TYPES.BUILT_IN 
      ? defaultParameters 
      : customParameters;

    return (
      <div className="space-y-2">
        {modelType === MODEL_TYPES.CUSTOM && (
          <div className="mb-6 bg-blue-900/20 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white text-sm font-medium">Custom scene: {fileName}</p>
              </div>
              <button 
                onClick={switchToBuiltIn}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Switch to Default
              </button>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-900/50 text-red-200 rounded-md">
            {error}
          </div>
        )}
        {Object.entries(paramsToRender).map(([key, value]) => 
          renderParameterInput(key, value as CustomParameterDef)
        )}
      </div>
    );
  };

  // 渲染上傳面板
  const renderUploadPanel = () => {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 w-full text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-500 mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-white mb-4">Upload your scene file (.tsx) with parameter definitions</p>
          <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer hover:bg-blue-700 transition-colors">
            Browse Files
            <input 
              type="file" 
              className="hidden" 
              accept=".tsx,.ts,.js,.jsx"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      <div className="flex-grow">
        <ParametricScene parameters={parameters} />
      </div>
      <div className="w-80 min-w-[320px] max-w-[320px] p-4 bg-[#1a1a1a] border-l border-white/10 overflow-y-auto h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Scene Settings</h2>
        </div>
        
        <div className="mb-6">
          <div className="bg-[#2a2a2a] rounded-md">
            <div className="flex border-b border-[#3a3a3a]">
              <button 
                className={`flex-1 px-4 py-2 ${activeTab === 'parameters' ? 'bg-[#3a3a3a] text-white' : 'text-white/70'}`}
                onClick={() => setActiveTab('parameters')}
              >
                Parameters
              </button>
              <button 
                className={`flex-1 px-4 py-2 ${activeTab === 'upload' ? 'bg-[#3a3a3a] text-white' : 'text-white/70'}`}
                onClick={() => setActiveTab('upload')}
              >
                Upload Scene
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-grow">
          {activeTab === 'parameters' && renderParametersPanel()}
          {activeTab === 'upload' && renderUploadPanel()}
        </div>
      </div>
    </div>
  );
};

export default Model3DWindow; 