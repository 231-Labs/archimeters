import { useState, useCallback } from 'react';
import ParametricScene from '@/components/3d/ParametricScene';

interface Parameter {
  label: string;
  type: 'number' | 'color';
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  current?: number | string;
}

interface Parameters {
  [key: string]: Parameter;
}

export default function ParameterTest() {
  const [parameters, setParameters] = useState<Parameters>({});
  const [currentParams, setCurrentParams] = useState<Record<string, any>>({});
  const [geometryScript, setGeometryScript] = useState<{ code: string; filename: string } | null>(null);
  const [error, setError] = useState<string>('');

  // 處理文件上傳
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 檢查文件類型
    if (!file.name.endsWith('.js')) {
      setError('只支持 .js 文件');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const code = e.target?.result as string;
      setGeometryScript({ code, filename: file.name });

      try {
        // 解析參數定義
        const parametersMatch = code.match(/const parameters = ({[\s\S]*?});/);
        if (parametersMatch) {
          // 安全地評估參數對象
          const paramsDef = new Function(`return ${parametersMatch[1]}`)();
          setParameters(paramsDef);
          // 設置初始值
          const initialParams = Object.entries(paramsDef).reduce((acc, [key, value]) => {
            acc[key] = (value as Parameter).default;
            return acc;
          }, {} as Record<string, any>);
          setCurrentParams(initialParams);
          setError('');
        } else {
          setError('未找到參數定義，請確保文件包含正確的參數格式');
        }
      } catch (error) {
        console.error('解析參數時出錯:', error);
        setError('解析參數時出錯');
      }
    };

    reader.onerror = () => {
      setError('讀取文件時出錯');
    };

    reader.readAsText(file);
  }, []);

  const handleParameterChange = (key: string, value: number | string) => {
    setCurrentParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="flex h-full">
      {/* 左側 - 3D 預覽 */}
      <div className="w-2/3 p-8 border-r border-white/5">
        <div className="text-white/50 text-sm mb-4">模型預覽</div>
        <div className="h-[calc(100vh-200px)] bg-black/30 rounded-lg overflow-hidden">
          {geometryScript ? (
            <ParametricScene
              userScript={geometryScript}
              parameters={currentParams}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-white/30">
              請上傳幾何體文件
            </div>
          )}
        </div>
      </div>

      {/* 右側 - 參數控制 */}
      <div className="w-1/3 p-8">
        {/* 文件上傳區域 */}
        <div className="mb-8">
          <div className="text-white/50 text-sm mb-4">上傳幾何體文件</div>
          <div className="relative">
            <input
              type="file"
              accept=".js"
              onChange={handleFileUpload}
              className="block w-full text-sm text-white/60
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-white/10 file:text-white
                hover:file:bg-white/20"
            />
            {error && (
              <div className="mt-2 text-red-500 text-sm">{error}</div>
            )}
            {geometryScript && (
              <div className="mt-2 text-green-500 text-sm">
                已加載: {geometryScript.filename}
              </div>
            )}
          </div>
        </div>

        {/* 參數控制區域 */}
        {Object.keys(parameters).length > 0 ? (
          <>
            <div className="text-white/50 text-sm mb-4">參數控制</div>
            <div className="space-y-4">
              {Object.entries(parameters).map(([key, param]) => (
                <div key={key} className="space-y-2">
                  <label className="text-white/80 text-sm">{param.label}</label>
                  {param.type === 'number' ? (
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step || 0.1}
                        value={currentParams[key] || param.default}
                        onChange={(e) => handleParameterChange(key, parseFloat(e.target.value))}
                        className="flex-1"
                      />
                      <input
                        type="number"
                        min={param.min}
                        max={param.max}
                        step={param.step || 0.1}
                        value={currentParams[key] || param.default}
                        onChange={(e) => handleParameterChange(key, parseFloat(e.target.value))}
                        className="w-20 bg-white/5 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                  ) : param.type === 'color' ? (
                    <div className="flex items-center space-x-4">
                      <input
                        type="color"
                        value={currentParams[key] || param.default}
                        onChange={(e) => handleParameterChange(key, e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={currentParams[key] || param.default}
                        onChange={(e) => handleParameterChange(key, e.target.value)}
                        className="flex-1 bg-white/5 rounded px-2 py-1 text-white text-sm"
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-white/30 text-center py-8">
            上傳文件後將顯示可調整的參數
          </div>
        )}
      </div>
    </div>
  );
} 