import { TemplateSeries, FontStyle, ParameterState } from '../../types';
import { useState, useEffect } from 'react';
import { ParametricViewer } from './ParametricViewer';
import { AlgorithmFileUploader, ParameterList, DesignSettings } from './algorithm';
import { useAlgorithmFile } from '../../hooks/useAlgorithmFile';
import { useGeometryScript } from '../../hooks/useGeometryScript';

interface AlgorithmPageProps extends Pick<ParameterState, 'extractedParameters' | 'previewParams' | 'showPreview'> {
  algoFile: File | null;
  algoResponse: string;
  algoError: string;
  algoRequired: boolean;
  style: TemplateSeries;
  fontStyle: FontStyle;
  onFileChange: (file: File) => void;
  onStyleChange: (style: TemplateSeries) => void;
  onFontStyleChange: (style: FontStyle) => void;
  onUserScriptChange: (script: { code: string; filename: string } | null) => void;
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
  onFileChange,
  onStyleChange,
  onFontStyleChange,
  onUserScriptChange
}: AlgorithmPageProps) => {
  const [jsCode, setJsCode] = useState<string | null>(null);
  
  const { fileTypeError } = useAlgorithmFile(onFileChange);
  const geometryScript = useGeometryScript({
    jsCode,
    fileName: algoFile?.name
  });

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

  useEffect(() => {
    onUserScriptChange(geometryScript);
  }, [geometryScript, onUserScriptChange]);

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
            <AlgorithmFileUploader
              algoFile={algoFile}
              algoResponse={algoResponse}
              algoError={algoError}
              algoRequired={algoRequired}
              fileTypeError={fileTypeError}
              onFileChange={onFileChange}
            />
          )}
        </div>
        <div className="h-16"></div>
      </div>

      {/* Right - Parameter Settings */}
      <div className="w-1/3 p-8 flex flex-col relative">
        <div className="space-y-8 overflow-auto max-h-[calc(100vh-200px)] pr-2 custom-scrollbar">
          <ParameterList
            extractedParameters={extractedParameters}
            algoFile={algoFile}
          />
          
          <DesignSettings
            style={style}
            fontStyle={fontStyle}
            onStyleChange={onStyleChange}
            onFontStyleChange={onFontStyleChange}
          />
        </div>
        <div className="h-16"></div>
      </div>
    </div>
  );
}; 