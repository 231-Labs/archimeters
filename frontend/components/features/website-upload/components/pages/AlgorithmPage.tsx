import { TemplateSeries, FontStyle, ParameterState } from '../../types';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ParametricViewer } from './ParametricViewer';

interface NumberParameter {
  type: 'number';
  label: string;
  default: number;
  min: number;
  max: number;
  current: number;
}

interface ColorParameter {
  type: 'color';
  label: string;
  default: string;
  current: string;
}

type Parameter = NumberParameter | ColorParameter;

interface Parameters {
  [key: string]: Parameter;
}

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

const defaultParameters: Parameters = {
  radius: {
    type: 'number',
    label: 'Radius',
    default: 5,
    min: 2,
    max: 10,
    current: 5
  },
  tubeRadius: {
    type: 'number',
    label: 'Tube Radius',
    default: 1,
    min: 0.5,
    max: 3,
    current: 1
  },
  radialSegments: {
    type: 'number',
    label: 'Radial Segments',
    default: 30,
    min: 8,
    max: 50,
    current: 30
  },
  tubularSegments: {
    type: 'number',
    label: 'Tubular Segments',
    default: 50,
    min: 8,
    max: 100,
    current: 50
  },
  color: {
    type: 'color',
    label: 'Color',
    default: '#ff3366',
    current: '#ff3366'
  },
  emissive: {
    type: 'color',
    label: 'Emissive Color',
    default: '#000000',
    current: '#000000'
  }
};

const PreviewComponent = ({ parameters }: { parameters: Record<string, any> }) => {
  const geometryScript = {
    code: `
      function createGeometry(THREE, params) {
        return new THREE.TorusGeometry(
          ${parameters.radius || 2},
          ${parameters.tubeRadius || 0.5},
          ${parameters.radialSegments || 16},
          ${parameters.tubularSegments || 100}
        );
      }
    `,
    filename: 'preview.js'
  };

  return (
    <div className="h-full rounded-lg overflow-hidden bg-black/30">
      <ParametricViewer userScript={geometryScript} parameters={parameters} />
    </div>
  );
};

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
  const [parameters, setParameters] = useState<Parameters>({});
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

  const handleParameterChange = useCallback((key: string, value: number | string) => {
    setParameters((prev: Parameters) => {
      const param = prev[key];
      if (param.type === 'number') {
        return {
          ...prev,
          [key]: {
            ...param,
            current: Number(value)
          } as NumberParameter
        };
      } else {
        return {
          ...prev,
          [key]: {
            ...param,
            current: value as string
          } as ColorParameter
        };
      }
    });
    onUpdatePreviewParams((prev: Record<string, any>) => ({
      ...prev,
      [key]: value
    }));
  }, [onUpdatePreviewParams]);

  const geometryScript = useMemo(() => {
    if (!jsCode) {
      return {
        code: `
          function createGeometry(THREE, params) {
            return new THREE.TorusGeometry(
              params.radius || 2,
              params.tubeRadius || 0.5,
              params.radialSegments || 16,
              params.tubularSegments || 100
            );
          }
        `,
        filename: 'preview.js'
      };
    }
    return {
      code: jsCode,
      filename: algoFile?.name || 'preview.js'
    };
  }, [jsCode, previewParams, algoFile]);

  return (
    <div className="flex h-full">
      {/* Left - Algorithm Upload and Preview */}
      <div className="w-2/3 p-8 border-r border-white/5 flex flex-col">
        <div className="text-white/50 text-sm mb-4">Algorithm File</div>
        <div className="flex-1 group relative max-h-[calc(100vh-200px)]">
          {showPreview ? (
            <div className="h-full rounded-lg overflow-hidden bg-black/30">
              <ParametricViewer 
                userScript={geometryScript}
                parameters={previewParams}
              />
            </div>
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
          {Object.keys(extractedParameters).length > 0 ? (
            <div className="space-y-4">
              <div className="text-white/50 text-sm">Default Parameters</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(extractedParameters).map(([key, param]: [string, any]) => (
                  <div key={key} className="bg-white/5 rounded-md p-3">
                    <div className="text-white/60 mb-1 capitalize">{param.label || key}</div>
                    <div className="text-white font-mono">
                      {typeof param.default === 'object' 
                        ? JSON.stringify(param.default) 
                        : param.default}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : algoFile ? (
            <div className="text-white/40 text-sm text-center py-8">
              Processing algorithm file...
            </div>
          ) : (
            <div className="text-white/40 text-sm text-center py-8">
              Upload an algorithm file to view parameters
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