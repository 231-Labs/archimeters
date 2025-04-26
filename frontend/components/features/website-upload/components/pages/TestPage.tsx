import { useState, useMemo } from 'react';
import ParametricScene from '@/components/3d/ParametricScene';

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
  radius: NumberParameter;
  tubeRadius: NumberParameter;
  radialSegments: NumberParameter;
  tubularSegments: NumberParameter;
  color: ColorParameter;
  emissive: ColorParameter;
}

const defaultParameters: Parameters = {
  radius: {
    type: 'number',
    label: '主半徑',
    default: 5,
    min: 2,
    max: 10,
    current: 5
  },
  tubeRadius: {
    type: 'number',
    label: '管半徑',
    default: 1,
    min: 0.5,
    max: 3,
    current: 1
  },
  radialSegments: {
    type: 'number',
    label: '徑向分段',
    default: 30,
    min: 8,
    max: 50,
    current: 30
  },
  tubularSegments: {
    type: 'number',
    label: '管向分段',
    default: 50,
    min: 8,
    max: 100,
    current: 50
  },
  color: {
    type: 'color',
    label: '主顏色',
    default: '#ff3366',
    current: '#ff3366'
  },
  emissive: {
    type: 'color',
    label: '發光顏色',
    default: '#000000',
    current: '#000000'
  }
};

export const TestPage = () => {
  const [parameters, setParameters] = useState<Parameters>(defaultParameters);
  const [previewParams, setPreviewParams] = useState(
    Object.fromEntries(
      Object.entries(defaultParameters).map(([key, value]) => [key, value.default])
    )
  );

  const handleParameterChange = (key: keyof Parameters, value: number | string) => {
    setParameters(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        current: value
      }
    }));
    setPreviewParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const geometryScript = useMemo(() => {
    const code = `
      function createGeometry(THREE) {
        return new THREE.TorusGeometry(
          ${previewParams.radius},
          ${previewParams.tubeRadius},
          ${previewParams.radialSegments},
          ${previewParams.tubularSegments}
        );
      }
    `;
    return { code, filename: 'torus.js' };
  }, [previewParams]);

  return (
    <div className="flex h-full overflow-hidden">
      {/* 左側 - 3D 預覽 */}
      <div className="w-2/3 p-8 border-r border-white/5 overflow-hidden">
        <div className="text-white/50 text-sm mb-4">模型預覽</div>
        <div className="h-[calc(100vh-200px)] bg-black/30 rounded-lg overflow-hidden">
          <ParametricScene userScript={geometryScript} />
        </div>
      </div>

      {/* 右側 - 參數控制 */}
      <div className="w-1/3 p-8 h-full flex flex-col overflow-hidden">
        <div className="text-white/50 text-sm mb-4 sticky top-0 bg-black/50 backdrop-blur-sm py-2 z-10 border-b border-white/10">參數控制</div>
        <div className="space-y-4 flex-1 overflow-y-auto pr-4 pb-8 custom-scrollbar">
          {Object.entries(parameters).map(([key, param]) => (
            <div key={key} className="space-y-2 bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-colors">
              <label className="text-white/80 text-sm font-medium">{param.label}</label>
              {param.type === 'number' ? (
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={0.1}
                    value={param.current}
                    onChange={(e) => handleParameterChange(key as keyof Parameters, parseFloat(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                  <input
                    type="number"
                    min={param.min}
                    max={param.max}
                    step={0.1}
                    value={param.current}
                    onChange={(e) => handleParameterChange(key as keyof Parameters, parseFloat(e.target.value))}
                    className="w-20 bg-white/5 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ) : param.type === 'color' ? (
                <div className="flex items-center space-x-4">
                  <input
                    type="color"
                    value={param.current}
                    onChange={(e) => handleParameterChange(key as keyof Parameters, e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={param.current}
                    onChange={(e) => handleParameterChange(key as keyof Parameters, e.target.value)}
                    className="flex-1 bg-white/5 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              ) : null}
            </div>
          ))}
          
          {/* 添加更多參數 - 示例 */}
          <div className="pt-6 border-t border-white/10">
            <h3 className="text-white/80 text-sm font-medium mb-4">高級參數</h3>
            {[...Array(8)].map((_, i) => (
              <div key={`advanced-${i}`} className="mb-6 bg-black/20 p-4 rounded-lg hover:bg-black/30 transition-colors">
                <label className="text-white/80 text-sm font-medium">高級參數 {i+1}</label>
                <div className="flex items-center space-x-4 mt-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={50}
                    className="flex-1 accent-blue-500"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={50}
                    className="w-20 bg-white/5 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}; 