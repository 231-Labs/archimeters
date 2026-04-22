'use client';

import { ReactNode } from 'react';
import { RetroHeading } from '@/components/common/RetroHeading';
import { RetroSection } from '@/components/common/RetroCard';
import { RetroPreview, RetroImage } from '@/components/common/RetroPreview';
import { RetroButton } from '@/components/common/RetroButton';
import { SuiLogo } from '@/components/common/SuiLogo';

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
  exportFormatToggle,
}: AtelierMintLayoutProps) {
  const inputClass =
    'w-full publisher-input-embed text-foreground text-xs p-1.5 font-mono placeholder:text-muted-foreground focus:outline-none';
  const smallInputClass =
    'w-12 publisher-input-embed text-foreground text-right text-xs p-1 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none';
  const paramCardClass = 'publisher-inset-well p-2 rounded-sm';
  const sliderTrackClass =
    'flex-1 h-1 rounded-lg appearance-none cursor-pointer bg-foreground/15 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-foreground/70 [&::-webkit-slider-thumb]:hover:bg-foreground [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-foreground/70 [&::-moz-range-thumb]:border-0';

  return (
    <div className="h-full bg-background text-foreground overflow-auto hide-scrollbar">
      <div className="relative min-h-full max-w-[1800px] mx-auto flex flex-col">
        <div className="sticky top-0 z-30">
          <RetroHeading title={workName} author={`BY ${author?.toUpperCase()} | @${social}`} />
        </div>

        <div className="px-6 pb-6 mt-4">
          <div className="flex-1 flex flex-col lg:flex-row gap-3">
            <div className="lg:w-[55%] flex flex-col gap-3">
              <RetroPreview height="500px">
                {preview3D ? (
                  preview3D
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground font-mono text-xs">
                    NO 3D PREVIEW
                  </div>
                )}
              </RetroPreview>

              <RetroSection title="ARTWORK INFO">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <RetroImage src={imageUrl || '/placeholder.png'} alt={workName} />

                    <div>
                      <h3 className="text-foreground/90 text-xs font-mono uppercase mb-2 tracking-wide">DESCRIPTION</h3>
                      <p className="text-muted-foreground text-xs font-mono leading-relaxed">{description}</p>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <h3 className="text-foreground/90 text-xs font-mono uppercase mb-2 tracking-wide">ARTIST STATEMENT</h3>
                    <p className="text-muted-foreground text-xs font-mono leading-relaxed">{intro}</p>
                  </div>
                </div>
              </RetroSection>
            </div>

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
                  <div className={`${paramCardClass}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="text-muted-foreground text-xs font-mono uppercase tracking-wide">Model Alias</div>
                      <div className="text-[9px] text-muted-foreground/80 font-mono">REQUIRED</div>
                    </div>
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => onAliasChange?.(e.target.value)}
                      placeholder="NAME YOUR MODEL"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-2">
                    {Object.keys(parameters).length > 0 && (
                      <div className="flex justify-between items-center pb-1.5 border-b border-border">
                        <span className="text-muted-foreground text-[10px] font-mono uppercase">
                          {Object.keys(parameters).length} Parameters
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const defaults = Object.fromEntries(
                              Object.entries(parameters).map(([key, param]) => [key, param.default])
                            );
                            onParameterChange('all', defaults);
                          }}
                          className="text-[9px] text-muted-foreground hover:text-foreground/80 transition-colors font-mono uppercase"
                        >
                          Reset All
                        </button>
                      </div>
                    )}

                    <div className="max-h-[350px] overflow-y-auto pr-2">
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(parameters).map(([key, paramDef]) => (
                          <div key={key} className={paramCardClass}>
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="text-muted-foreground capitalize text-xs font-mono truncate pr-1">
                                {paramDef.label || key}
                              </div>
                              <button
                                type="button"
                                className="text-[9px] text-muted-foreground hover:text-foreground/80 transition-colors flex-shrink-0 font-mono"
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
                                    className={sliderTrackClass}
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
                                    className={smallInputClass}
                                  />
                                </div>
                                <div className="flex justify-between text-[9px] text-muted-foreground/70 px-0.5">
                                  <span>{paramDef.min || 0}</span>
                                  <span>{paramDef.max || 100}</span>
                                </div>
                              </div>
                            ) : paramDef.type === 'color' ? (
                              <div className="flex items-center gap-1.5 relative group">
                                <button
                                  type="button"
                                  className="w-5 h-5 rounded relative overflow-hidden border border-border group-hover:border-border-strong transition-colors flex-shrink-0"
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
                                  className={`flex-1 ${inputClass} p-1`}
                                />
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={previewParams[key] ?? paramDef.default}
                                onChange={(e) => onParameterChange(key, e.target.value)}
                                className={inputClass}
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
                  <div className="flex items-center justify-between py-1 border-b border-border">
                    <span className="text-muted-foreground text-xs font-mono uppercase tracking-wide">Price</span>
                    <div className="flex items-baseline gap-2">
                      <SuiLogo width={14} height={22} className="text-foreground shrink-0" />
                      <span className="text-foreground/90 text-xl font-mono">{price}</span>
                    </div>
                  </div>

                  {exportFormatToggle && <div className="py-1">{exportFormatToggle}</div>}

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
