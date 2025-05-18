'use client';

import { ReactNode } from 'react';

export interface TemplateProps {
  workName: string;
  description: string;
  price: string;
  author: string;
  social: string;
  intro: string;
  imageUrl: string;
  parameters: Record<string, { type: string; default: any; label?: string; min?: number; max?: number; step?: number }>;
  previewParams: Record<string, any>;
  mintButtonState: {
    disabled: boolean;
    tooltip: string;
    tooltipComponent?: ReactNode;
  };
  preview3D?: ReactNode;
  alias?: string;
  onAliasChange?: (value: string) => void;
  onParameterChange: (key: string, value: string | number) => void;
  onMint: () => Promise<void>;
}

export default function DefaultTemplate({
  workName,
  description,
  price,
  intro,
  imageUrl,
  parameters,
  previewParams,
  onParameterChange,
  onMint,
  mintButtonState,
  preview3D,
  alias = '',
  onAliasChange
}: TemplateProps) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6">
      <div className="lg:w-[55%] flex flex-col gap-4">
        <div className="flex-1 relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 min-h-[500px]">
          <div className="relative bg-black/50 backdrop-blur-sm p-6 h-full">
            <div className="absolute left-0 top-0 w-6 h-6 border-l border-t border-white/20"></div>
            <div className="absolute right-0 top-0 w-6 h-6 border-r border-t border-white/20"></div>
            <div className="absolute left-0 bottom-0 w-6 h-6 border-l border-b border-white/20"></div>
            <div className="absolute right-0 bottom-0 w-6 h-6 border-r border-b border-white/20"></div>

            <div className="relative w-full h-full bg-black/70 border border-white/10" style={{ minHeight: '400px' }}>
              {preview3D ? (
                preview3D
              ) : (
                <div className="flex h-full items-center justify-center text-white/50">
                  No 3D preview available
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10">
          <div className="relative bg-black/50 backdrop-blur-sm p-6">
            <div className="space-y-6">
              <div className="flex gap-6">
                <div className="w-1/2">
                  <div className="relative aspect-square bg-black/70 border border-white/10 overflow-hidden">
                    {imageUrl ? (
                      <div className="relative group h-full">
                        <img
                          src={imageUrl}
                          alt={workName}
                          className="w-full h-full object-contain transition-all duration-1000 group-hover:contrast-125 group-hover:brightness-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/50">
                        No image available
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-1/2">
                  <h2 className="text-lg font-semibold mb-2 text-white/90">Artwork Description</h2>
                  <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{description}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h2 className="text-lg font-semibold mb-2 text-white/90">Artist Statement</h2>
                <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">{intro}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-[45%] flex flex-col gap-4">
        <div className="relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10">
          <div className="relative bg-black/50 backdrop-blur-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white/90">Parameters</h2>
              <button 
                onClick={() => {
                  const defaultParams = Object.fromEntries(
                    Object.entries(parameters).map(([key, value]) => [key, value.default])
                  );
                  Object.entries(defaultParams).forEach(([key, value]) => {
                    onParameterChange(key, value);
                  });
                  onAliasChange?.('');
                }}
                className="text-sm text-white/50 hover:text-white/70 transition-colors"
              >
                Reset All
              </button>
            </div>

            <div className="mb-4 bg-white/5 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-white/60 text-sm">Model Alias</div>
                <div className="text-xs text-white/40">Required</div>
              </div>
              <input
                type="text"
                value={alias}
                onChange={(e) => onAliasChange?.(e.target.value)}
                placeholder="Name Your Model"
                className="w-full bg-black/30 text-white/90 text-sm p-2 rounded border border-white/10 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {Object.entries(parameters).map(([key, paramDef]) => (
                <div key={key} className="bg-white/5 rounded-md p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-white/60 capitalize text-sm">{paramDef.label || key}</div>
                    <button 
                      className="text-xs text-white/40 hover:text-white/60 transition-colors"
                      onClick={() => onParameterChange(key, paramDef.default)}
                    >
                      Reset
                    </button>
                  </div>
                  {paramDef.type === 'number' ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={paramDef.min || 0}
                          max={paramDef.max || 100}
                          step={paramDef.step || 1}
                          value={previewParams[key] ?? paramDef.default}
                          onChange={(e) => onParameterChange(key, Number(e.target.value))}
                          className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/80 [&::-webkit-slider-thumb]:hover:bg-white [&::-webkit-slider-thumb]:transition-colors [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white/80 [&::-moz-range-thumb]:hover:bg-white [&::-moz-range-thumb]:transition-colors [&::-moz-range-thumb]:border-0"
                        />
                        <input
                          type="number"
                          value={previewParams[key] ?? paramDef.default}
                          onChange={(e) => {
                            const value = e.target.value === '' ? paramDef.default : Number(e.target.value);
                            onParameterChange(key, value);
                          }}
                          className="w-14 bg-black/30 text-white/90 text-right text-sm p-1 rounded border border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-white/30">
                        <span>{paramDef.min || 0}</span>
                        <span>{paramDef.max || 100}</span>
                      </div>
                    </div>
                  ) : paramDef.type === 'color' ? (
                    <div className="flex items-center gap-2 relative group">
                      <button
                        className="w-6 h-6 rounded relative overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors"
                        onClick={(e) => {
                          const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                          input?.click();
                        }}
                      >
                        <div className="absolute inset-0" style={{ backgroundColor: previewParams[key] || paramDef.default }} />
                      </button>
                      <input
                        type="color"
                        value={previewParams[key] || paramDef.default}
                        onChange={(e) => onParameterChange(key, e.target.value)}
                        className="absolute opacity-0 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={previewParams[key] || paramDef.default}
                        onChange={(e) => onParameterChange(key, e.target.value)}
                        className="flex-1 bg-black/30 text-white/90 text-sm p-1 rounded border border-white/10 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={previewParams[key] || paramDef.default}
                      onChange={(e) => onParameterChange(key, e.target.value)}
                      className="w-full bg-black/30 text-white/90 text-sm p-1 rounded border border-white/10 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10">
          <div className="relative bg-black/50 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white/60 mb-1">Price</div>
                <div className="flex items-baseline gap-4">
                  <img src="/sui_symbol_white.png" alt="Sui Symbol" width={18} height={30} />
                  <span className="text-3xl font-light bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80">
                    {price}
                  </span>
                </div>
              </div>
              <div className="relative group">
                <button 
                  onClick={onMint}
                  disabled={mintButtonState.disabled}
                  className="relative px-8 py-3 bg-black border border-white/10 rounded-sm hover:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-white/10"
                >
                  <div className="flex flex-col items-center">
                    <span className="text-base font-light text-white/90 group-hover:text-white transition-colors">
                      Mint Sculpt
                    </span>
                    <span className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">
                      Initialize Sculpture
                    </span>
                  </div>
                </button>
                {mintButtonState.tooltipComponent}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 