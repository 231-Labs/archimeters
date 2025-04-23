import { TemplateSeries, FontStyle } from '../../types';
import ParametricScene from '../../../3d/ParametricScene';

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
  onParameterChange: (key: string, value: string | number) => void;
  onStyleChange: (style: TemplateSeries) => void;
  onFontStyleChange: (style: FontStyle) => void;
}

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
  return (
    <div className="flex h-full">
      {/* Left - Algorithm Upload and Preview */}
      <div className="w-2/3 p-8 border-r border-white/5">
        <div className="text-white/50 text-sm mb-4">Algorithm File</div>
        <div className="h-[calc(100vh-480px)] group relative">
          {showPreview && Object.keys(previewParams).length > 0 ? (
            <div className="h-full rounded-lg overflow-hidden bg-black/30">
              <ParametricScene parameters={previewParams} />
            </div>
          ) : (
            <>
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onAlgoFileChange(file);
                }}
                className="w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
              />
              <div className={`h-full border border-dashed ${algoRequired ? 'border-red-400' : 'border-white/20'} rounded-lg flex items-center justify-center ${!algoRequired && 'group-hover:border-white/40'} transition-colors`}>
                {algoFile ? (
                  <pre className="p-6 w-full h-full overflow-auto text-sm text-white/80 font-mono">
                    {algoResponse || '// Processing...'}
                  </pre>
                ) : (
                  <div className="text-center">
                    <div className={`text-4xl mb-3 ${algoRequired ? 'text-red-400' : 'text-white/40'}`}>+</div>
                    <div className={`text-sm ${algoRequired ? 'text-red-400' : 'text-white/40'}`}>
                      {algoRequired ? 'Algorithm file is required' : 'Click or drag to upload algorithm'}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {algoError && (
            <div className="mt-2 text-red-400 text-sm">
              <span className="font-mono">Error: </span>{algoError}
            </div>
          )}
        </div>
      </div>

      {/* Right - Parameter Settings */}
      <div className="w-1/3 p-8">
        <div className="space-y-8">
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
      </div>
    </div>
  );
}; 