import { GeometryParameter } from '../../../types';

interface ParameterListProps {
  extractedParameters: Record<string, GeometryParameter>;
  algoFile: File | null;
}

export const ParameterList = ({
  extractedParameters,
  algoFile
}: ParameterListProps) => {
  const hasParameters = Object.keys(extractedParameters).length > 0;

  if (!algoFile) {
    return (
      <div className="text-white/40 text-sm text-center py-8">
        Upload an algorithm file to view parameters
      </div>
    );
  }

  if (!hasParameters) {
    return (
      <div className="text-white/40 text-sm text-center py-8">
        Processing algorithm file...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-white/50 text-sm">Default Parameters</div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        {Object.entries(extractedParameters).map(([key, param]) => (
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
  );
};

