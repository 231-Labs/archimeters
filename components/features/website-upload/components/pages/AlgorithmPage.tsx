import { TemplateSeries, FontStyle } from '../../types';
import { useState, useEffect } from 'react';
import ParametricScene from '@/components/3d/ParametricScene';

interface AlgorithmPageProps {
  algoFile: File | null;
  algoResponse: string;
  algoError: string;
  algoRequired: boolean;
  showPreview: boolean;
  previewParams: Record<string, any>;
  extractedParameters: Record<string, any>;
  style: TemplateSeries;
  fontStyle: FontStyle;
  onAlgoFileChange: (file: File) => void;
  onParameterChange: (key: string, value: any) => void;
  onStyleChange: (style: TemplateSeries) => void;
  onFontStyleChange: (style: FontStyle) => void;
}

const PreviewComponent = ({ parameters }: { parameters: Record<string, any> }) => (
  <div className="h-full rounded-lg overflow-hidden bg-black/30">
    <ParametricScene parameters={parameters} />
  </div>
);

export const AlgorithmPage = ({
  algoFile,
  algoResponse,
  algoError,
  algoRequired,
  showPreview,
  previewParams,
  extractedParameters,
  style,
  fontStyle,
  onAlgoFileChange,
  onParameterChange,
  onStyleChange,
  onFontStyleChange
}: AlgorithmPageProps) => {
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);

  useEffect(() => {
    if (algoFile) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          
          // 使用正則表達式提取 defaultParameters
          const parametersMatch = content.match(/export\s+const\s+defaultParameters\s*=\s*({[\s\S]*?});/);
          
          if (parametersMatch && parametersMatch[1]) {
            try {
              // 清理並解析參數對象
              let paramStr = parametersMatch[1]
                .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行註釋
                .replace(/\/\/.*/g, '') // 移除單行註釋
                .replace(/\s+/g, ' ') // 標準化空白
                .replace(/(\w+):/g, '"$1":') // 將屬性名加上引號
                .replace(/,(\s*[}\]])/g, '$1') // 移除尾隨逗號
                .replace(/'/g, '"'); // 將單引號替換為雙引號

              console.log('Cleaned parameter string:', paramStr);
              
              const extractedParams = JSON.parse(paramStr);
              console.log('Parsed parameters:', extractedParams);

              // 設置初始參數值
              const initialParams = Object.fromEntries(
                Object.entries(extractedParams).map(([key, value]: [string, any]) => [
                  key,
                  value.default
                ])
              );

              onParameterChange('', initialParams);
              setFileTypeError(null);
            } catch (err: any) {
              console.error('Error parsing parameters:', err);
              setFileTypeError('Failed to parse parameters: ' + (err.message || String(err)));
            }
          } else {
            setFileTypeError('No defaultParameters found in the file');
          }
        } catch (err: any) {
          console.error('Error reading file:', err);
          setFileTypeError('Failed to read file: ' + (err.message || String(err)));
        }
      };
      
      reader.readAsText(algoFile);
    }
  }, [algoFile]);
  
  return (
    <div className="flex h-full">
      {/* Left - Algorithm Upload and Preview */}
      <div className="w-2/3 p-8 border-r border-white/5 flex flex-col">
        <div className="text-white/50 text-sm mb-4">Algorithm File</div>
        <div className="flex-1 group relative max-h-[calc(100vh-200px)]">
          {showPreview && Object.keys(previewParams).length > 0 ? (
            <PreviewComponent parameters={previewParams} />
          ) : (
            <>
              <input
                type="file"
                accept=".tsx,.ts"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.name.toLowerCase().endsWith('.tsx') || file.name.toLowerCase().endsWith('.ts')) {
                      setFileTypeError(null);
                      onAlgoFileChange(file);
                    } else {
                      setFileTypeError(`Invalid file type. Only .tsx or .ts files are allowed. You uploaded: ${file.name}`);
                    }
                  }
                }}
                className="w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
              />
              <div className={`h-full border border-dashed ${algoRequired || fileTypeError ? 'border-red-400' : 'border-white/20'} rounded-lg flex items-center justify-center ${!algoRequired && !fileTypeError && 'group-hover:border-white/40'} transition-colors overflow-hidden`}>
                {algoFile ? (
                  <pre className="p-6 w-full h-full overflow-auto text-sm text-white/80 font-mono">
                    {algoResponse || '// Processing...'}
                  </pre>
                ) : (
                  <div className="text-center p-4">
                    <div className={`text-4xl mb-3 ${algoRequired || fileTypeError ? 'text-red-400' : 'text-white/40'}`}>+</div>
                    <div className={`text-sm ${algoRequired || fileTypeError ? 'text-red-400' : 'text-white/40'} flex flex-col gap-1`}>
                      {algoRequired ? 'Algorithm file is required' : 'Click or drag to upload algorithm'}
                      <span className="text-xs text-white/30">Only .tsx or .ts files are allowed</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {(algoError || fileTypeError) && (
            <div className="mt-2 text-red-400 text-sm">
              <span className="font-mono">Error: </span>{algoError || fileTypeError}
            </div>
          )}
        </div>
        <div className="h-16"></div>
      </div>

      {/* Right - Parameter Settings */}
      <div className="w-1/3 p-8 flex flex-col relative">
        <div className="space-y-8 overflow-auto max-h-[calc(100vh-200px)] pr-2">
          {/* Parameter List */}
          {Object.keys(extractedParameters).length > 0 && (
            <div className="space-y-4">
              <div className="text-white/50 text-sm">Algorithm Parameters</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(extractedParameters).map(([key, paramDef]) => (
                  <div key={key} className="bg-white/5 rounded-md p-3">
                    <div className="text-white/60 mb-1 capitalize">{paramDef.label || key}</div>
                    <div className="text-white font-mono">
                      {typeof paramDef.default === 'object' 
                        ? JSON.stringify(paramDef.default) 
                        : paramDef.default}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Design Options */}
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm block mb-2">Page Style</label>
              <select
                value={style}
                onChange={(e) => onStyleChange(e.target.value as TemplateSeries)}
                className="w-full bg-transparent text-white border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
              >
                <option value="default">Default</option>
                <option value="minimal">Minimal</option>
                <option value="elegant">Elegant</option>
              </select>
            </div>

            <div>
              <label className="text-white/60 text-sm block mb-2">Font Style</label>
              <select
                value={fontStyle}
                onChange={(e) => onFontStyleChange(e.target.value as FontStyle)}
                className="w-full bg-transparent text-white border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
              >
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </div>
          </div>
        </div>
        <div className="h-16"></div>
      </div>
    </div>
  );
}; 