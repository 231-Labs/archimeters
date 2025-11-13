'use client';

interface ParameterDef {
  type: string;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  default: any;
}

interface ParameterControlsProps {
  parameters: Record<string, ParameterDef>;
  previewParams: Record<string, any>;
  onParameterChange: (key: string, value: string | number | Record<string, any>) => void;
  showResetAll?: boolean;
  onResetAll?: () => void;
}

export function ParameterControls({
  parameters,
  previewParams,
  onParameterChange,
  showResetAll = true,
  onResetAll
}: ParameterControlsProps) {
  const handleResetAll = () => {
    if (onResetAll) {
      onResetAll();
    } else {
      const defaults = Object.fromEntries(
        Object.entries(parameters).map(([key, param]) => [key, param.default])
      );
      onParameterChange('all', defaults);
    }
  };

  return (
    <div className="space-y-2">
      {/* Header with Reset All */}
      {showResetAll && Object.keys(parameters).length > 0 && (
        <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
          <span className="text-white/50 text-[10px] font-mono uppercase">
            {Object.keys(parameters).length} Parameters
          </span>
          <button
            onClick={handleResetAll}
            className="text-[9px] text-white/40 hover:text-white/60 transition-colors font-mono uppercase"
          >
            Reset All
          </button>
        </div>
      )}

      {/* Parameters grid */}
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(parameters).map(([key, paramDef]) => (
          <div key={key} className="bg-black/40 border border-white/5 p-2">
            <div className="flex justify-between items-center mb-1.5">
              <div className="text-white/60 capitalize text-xs font-mono truncate pr-1">
                {paramDef.label || key}
              </div>
              <button 
                className="text-[9px] text-white/40 hover:text-white/60 transition-colors flex-shrink-0 font-mono"
                onClick={() => onParameterChange(key, paramDef.default)}
              >
                RST
              </button>
            </div>
            {paramDef.type === 'number' ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <input
                    type="range"
                    min={paramDef.min || 0}
                    max={paramDef.max || 100}
                    step={paramDef.step || 1}
                    value={previewParams[key] ?? paramDef.default}
                    onChange={(e) => onParameterChange(key, Number(e.target.value))}
                    className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/80 [&::-webkit-slider-thumb]:hover:bg-white [&::-webkit-slider-thumb]:transition-colors [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white/80 [&::-moz-range-thumb]:hover:bg-white [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:border-0"
                  />
                  <input
                    type="number"
                    min={paramDef.min || 0}
                    max={paramDef.max || 100}
                    step={paramDef.step || 1}
                    value={previewParams[key] ?? paramDef.default}
                    onChange={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '' || inputValue === '-' || inputValue.endsWith('.')) {
                        onParameterChange(key, inputValue);
                        return;
                      }
                      const numValue = Number(inputValue);
                      if (!isNaN(numValue)) {
                        onParameterChange(key, numValue);
                      }
                    }}
                    onBlur={(e) => {
                      const inputValue = e.target.value;
                      if (inputValue === '' || inputValue === '-' || inputValue === '.' || isNaN(Number(inputValue))) {
                        onParameterChange(key, paramDef.default);
                      } else {
                        const numValue = Number(inputValue);
                        const minValue = paramDef.min || 0;
                        const maxValue = paramDef.max || 100;
                        const clampedValue = Math.max(minValue, Math.min(maxValue, numValue));
                        onParameterChange(key, clampedValue);
                      }
                    }}
                    className="w-12 bg-black/60 text-white/90 text-right text-xs p-1 font-mono border border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:border-white/30"
                    style={{
                      borderTop: '1px solid #0a0a0a',
                      borderLeft: '1px solid #0a0a0a',
                      borderBottom: '1px solid #333',
                      borderRight: '1px solid #333',
                    }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-white/30 px-0.5">
                  <span>{paramDef.min || 0}</span>
                  <span>{paramDef.max || 100}</span>
                </div>
              </div>
            ) : paramDef.type === 'color' ? (
              <div className="flex items-center gap-1.5 relative group">
                <button
                  className="w-5 h-5 rounded relative overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors flex-shrink-0"
                  onClick={(e) => {
                    const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                    input?.click();
                  }}
                  style={{
                    backgroundColor: previewParams[key] ?? paramDef.default,
                  }}
                />
                <input
                  type="color"
                  value={previewParams[key] ?? paramDef.default}
                  onChange={(e) => onParameterChange(key, e.target.value)}
                  className="absolute opacity-0 w-0 h-0"
                />
                <input
                  type="text"
                  value={previewParams[key] ?? paramDef.default}
                  onChange={(e) => onParameterChange(key, e.target.value)}
                  className="flex-1 bg-black/60 text-white/90 text-xs p-1 font-mono border border-white/10 focus:outline-none focus:border-white/30"
                  style={{
                    borderTop: '1px solid #0a0a0a',
                    borderLeft: '1px solid #0a0a0a',
                    borderBottom: '1px solid #333',
                    borderRight: '1px solid #333',
                  }}
                />
              </div>
            ) : (
              <input
                type="text"
                value={previewParams[key] ?? paramDef.default}
                onChange={(e) => onParameterChange(key, e.target.value)}
                className="w-full bg-black/60 text-white/90 text-xs p-1 font-mono border border-white/10 focus:outline-none focus:border-white/30"
                style={{
                  borderTop: '1px solid #0a0a0a',
                  borderLeft: '1px solid #0a0a0a',
                  borderBottom: '1px solid #333',
                  borderRight: '1px solid #333',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

