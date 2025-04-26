import { TemplateSeries, FontStyle, ParameterState } from '../../types';
import { useState, useEffect, useCallback, useRef } from 'react';
import ParametricScene from '@/components/3d/ParametricScene';
import Sandbox3DIframe from '../../components/Sandbox3DIframe';

interface AlgorithmPageProps extends Pick<ParameterState, 'extractedParameters' | 'previewParams' | 'showPreview'> {
  algoFile: File | null;
  algoResponse: string;
  algoError: string;
  algoRequired: boolean;
  style: TemplateSeries;
  fontStyle: FontStyle;
  onFileChange: (file: File) => void;
  onExtractParameters: (params: Record<string, any>) => void;
  onUpdatePreviewParams: (params: Record<string, any>) => void;
  onTogglePreview: () => void;
  onStyleChange: (style: TemplateSeries) => void;
  onFontStyleChange: (style: FontStyle) => void;
  onNext: () => void;
  onPrevious: () => void;
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
  onFileChange,
  onExtractParameters,
  onUpdatePreviewParams,
  onTogglePreview,
  onStyleChange,
  onFontStyleChange,
  onNext,
  onPrevious
}: AlgorithmPageProps) => {
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);
  const [jsCode, setJsCode] = useState<string | null>(null);
  const sandboxRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (algoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setJsCode(content);
      };
      reader.readAsText(algoFile);
    }
  }, [algoFile]);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.name.toLowerCase().endsWith('.tsx') || file.name.toLowerCase().endsWith('.ts') || file.name.toLowerCase().endsWith('.js')) {
        setFileTypeError(null);
        onFileChange(file);
      } else {
        setFileTypeError(`Invalid file type. Only .tsx, .ts or .js files are allowed. You uploaded: ${file.name}`);
      }
    }
  }, [onFileChange]);

  const handleParameterChange = useCallback((key: string, value: any) => {
    onUpdatePreviewParams({ ...previewParams, [key]: value });
  }, [previewParams, onUpdatePreviewParams]);

  return (
    <div className="flex h-full">
      {/* Left - Algorithm Upload and Preview */}
      <div className="w-2/3 p-8 border-r border-white/5 flex flex-col">
        <div className="text-white/50 text-sm mb-4">Algorithm File</div>
        <div className="flex-1 group relative max-h-[calc(100vh-200px)]">
          {showPreview && Object.keys(previewParams).length > 0 ? (
            <Sandbox3DIframe
              ref={sandboxRef}
              jsCode={jsCode}
              parameters={previewParams}
              onParametersExtracted={onExtractParameters}
              onError={(err) => setFileTypeError(err)}
            />
          ) : (
            <>
              <input
                type="file"
                accept=".tsx,.ts,.js"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.name.toLowerCase().endsWith('.tsx') || file.name.toLowerCase().endsWith('.ts') || file.name.toLowerCase().endsWith('.js')) {
                      setFileTypeError(null);
                      onFileChange(file);
                    } else {
                      setFileTypeError(`Invalid file type. Only .tsx, .ts or .js files are allowed. You uploaded: ${file.name}`);
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
                      <span className="text-xs text-white/30">Only .tsx, .ts or .js files are allowed</span>
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