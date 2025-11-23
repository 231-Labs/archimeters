'use client';

import { ReactNode } from 'react';
import { RetroHeading } from '@/components/common/RetroHeading';
import { RetroSection } from '@/components/common/RetroCard';
import { RetroPreview, RetroImage } from '@/components/common/RetroPreview';
import { RetroButton } from '@/components/common/RetroButton';

export interface AtelierMintLayoutProps {
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
  exportFormatToggle?: ReactNode;
  onParameterChange: (key: string, value: string | number | Record<string, any>) => void;
  onMint: () => Promise<void>;
}

/**
 * AtelierMintLayout - Unified layout for Atelier minting interface
 * Combines header, 3D preview, parameters, and mint functionality
 */
export function AtelierMintLayout({
  workName,
  description,
  price,
  author,
  social,
  intro,
  imageUrl,
  parameters,
  previewParams,
  onParameterChange,
  onMint,
  mintButtonState,
  preview3D,
  alias = '',
  onAliasChange,
  exportFormatToggle
}: AtelierMintLayoutProps) {
  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-auto hide-scrollbar">
      <div className="relative min-h-full max-w-[1800px] mx-auto flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-30">
          <RetroHeading 
            title={workName}
            author={`BY ${author?.toUpperCase()} | @${social}`}
          />
        </div>

        {/* Main content */}
        <div className="px-6 pb-6 mt-4">
          <div className="flex-1 flex flex-col lg:flex-row gap-3">
            {/* Left column: Preview and artwork info */}
            <div className="lg:w-[55%] flex flex-col gap-3">
              <RetroPreview height="500px">
                {preview3D ? (
                  preview3D
                ) : (
                  <div className="flex h-full items-center justify-center text-white/50 font-mono text-xs">
                    NO 3D PREVIEW
                  </div>
                )}
              </RetroPreview>

              <RetroSection title="ARTWORK INFO">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <RetroImage 
                      src={imageUrl || '/placeholder.png'} 
                      alt={workName}
                    />
                    
                    <div>
                      <h3 className="text-white/90 text-xs font-mono uppercase mb-2 tracking-wide">DESCRIPTION</h3>
                      <p className="text-white/60 text-xs font-mono leading-relaxed">{description}</p>
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3">
                    <h3 className="text-white/90 text-xs font-mono uppercase mb-2 tracking-wide">ARTIST STATEMENT</h3>
                    <p className="text-white/60 text-xs font-mono leading-relaxed">{intro}</p>
                  </div>
                </div>
              </RetroSection>
            </div>

            {/* Right column: Parameters and mint */}
            <div className="lg:w-[45%] flex flex-col gap-3">
              <RetroSection 
                title="PARAMETERS"
                titleRight={
                  <RetroButton 
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      const defaultParams = Object.fromEntries(
                        Object.entries(parameters).map(([key, value]) => [key, value.default])
                      );
                      onParameterChange('all', defaultParams);
                      onAliasChange?.('');
                    }}
                    className="text-[10px] px-2 py-0.5"
                  >
                    RESET
                  </RetroButton>
                }
              >
                <div className="space-y-3">
                  {/* Model alias input */}
                  <div className="bg-black/40 rounded p-2 border border-white/5">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="text-white/60 text-xs font-mono uppercase tracking-wide">Model Alias</div>
                      <div className="text-[9px] text-white/40 font-mono">REQUIRED</div>
                    </div>
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => onAliasChange?.(e.target.value)}
                      placeholder="NAME YOUR MODEL"
                      className="w-full bg-black/60 text-white/90 text-xs p-1.5 font-mono border border-white/10 focus:outline-none focus:border-white/30 transition-colors"
                      style={{
                        borderTop: '1px solid #0a0a0a',
                        borderLeft: '1px solid #0a0a0a',
                        borderBottom: '1px solid #333',
                        borderRight: '1px solid #333',
                      }}
                    />
                  </div>

                  {/* Parameters section with scrollable container */}
                  <div className="space-y-2">
                    {/* Header with parameter count and reset all */}
                    {Object.keys(parameters).length > 0 && (
                      <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                        <span className="text-white/50 text-[10px] font-mono uppercase">
                          {Object.keys(parameters).length} Parameters
                        </span>
                        <button
                          onClick={() => {
                            const defaults = Object.fromEntries(
                              Object.entries(parameters).map(([key, param]) => [key, param.default])
                            );
                            onParameterChange('all', defaults);
                          }}
                          className="text-[9px] text-white/40 hover:text-white/60 transition-colors font-mono uppercase"
                        >
                          Reset All
                        </button>
                      </div>
                    )}

                    {/* Scrollable parameters grid - 4x2 layout with overflow scroll */}
                    <div className="max-h-[350px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(parameters).map(([key, paramDef]) => (
                          <div key={key} className="bg-black/40 border border-white/5 p-2">
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="text-white/60 capitalize text-xs font-mono truncate pr-1">{paramDef.label || key}</div>
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
                  </div>
                </div>
              </RetroSection>

              <RetroSection title="MINT SCULPT">
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-1 border-b border-white/10">
                    <span className="text-white/60 text-xs font-mono uppercase tracking-wide">Price</span>
                    <div className="flex items-baseline gap-2">
                      <img src="/sui_symbol_white.png" alt="Sui Symbol" width={14} height={24} />
                      <span className="text-white/90 text-xl font-mono">{price}</span>
                    </div>
                  </div>

                  {exportFormatToggle && (
                    <div className="py-1">
                      {exportFormatToggle}
                    </div>
                  )}

                  <div className="relative">
                    <RetroButton 
                      onClick={onMint}
                      disabled={mintButtonState.disabled}
                      size="lg"
                      variant="primary"
                      className="w-full"
                    >
                      MINT SCULPT
                    </RetroButton>
                    {mintButtonState.tooltipComponent}
                  </div>
                </div>
              </RetroSection>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

