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
    <div className="flex h-full">
      {/* 左側 - 3D 預覽 */}
      <div className="w-2/3 p-8 border-r border-white/5">
        <div className="text-white/50 text-sm mb-4">模型預覽</div>
        <div className="h-[calc(100vh-200px)] bg-black/30 rounded-lg overflow-hidden">
          <ParametricScene userScript={geometryScript} />
        </div>
      </div>

      {/* 右側 - 參數控制 */}
      <div className="w-1/3 p-8">
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
                    step={0.1}
                    value={param.current}
                    onChange={(e) => handleParameterChange(key as keyof Parameters, parseFloat(e.target.value))}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min={param.min}
                    max={param.max}
                    step={0.1}
                    value={param.current}
                    onChange={(e) => handleParameterChange(key as keyof Parameters, parseFloat(e.target.value))}
                    className="w-20 bg-white/5 rounded px-2 py-1 text-white text-sm"
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
                    className="flex-1 bg-white/5 rounded px-2 py-1 text-white text-sm"
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 