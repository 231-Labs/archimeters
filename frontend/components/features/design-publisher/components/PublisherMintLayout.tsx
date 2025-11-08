'use client';

import { ReactNode, useRef } from 'react';
import { RetroHeading } from '@/components/common/RetroHeading';
import { RetroSection } from '@/components/common/RetroCard';
import { RetroPreview } from '@/components/common/RetroPreview';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroEmptyState } from '@/components/common/RetroEmptyState';

export interface PublisherMintLayoutProps {
  // Artist info
  artistName: string;
  artistAddress: string;
  intro: string;
  
  // Cover Image
  coverImage: File | null;
  coverImageUrl: string;
  coverImageRequired: boolean;
  onCoverImageUpload: (file: File) => void;
  onCoverImageRemove: () => void;
  
  // Algorithm File
  algoFile: File | null;
  algoFileRequired: boolean;
  onAlgoFileUpload: (file: File) => void;
  onAlgoFileRemove: () => void;
  
  // Basic Info
  workName: string;
  description: string;
  price: string;
  onWorkNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  
  // Extracted Parameters (read-only display)
  extractedParameters: Array<{
    name: string;
    type: string;
    label?: string;
    min?: number;
    max?: number;
    default: any;
  }>;
  
  // 3D Preview
  preview3D?: ReactNode;
  
  // Publish
  onPublish: () => Promise<void>;
  publishButtonState: {
    disabled: boolean;
    tooltip: string;
  };
  isPublishing: boolean;
  
  // Validation Errors
  workNameError?: string;
  descriptionError?: string;
  priceError?: string;
}

/**
 * PublisherMintLayout - Publisher interface using AtelierMintLayout structure
 * Converts display blocks to input fields for creating new Ateliers
 */
export function PublisherMintLayout({
  artistName,
  artistAddress,
  intro,
  coverImage,
  coverImageUrl,
  coverImageRequired,
  onCoverImageUpload,
  onCoverImageRemove,
  algoFile,
  algoFileRequired,
  onAlgoFileUpload,
  onAlgoFileRemove,
  workName,
  description,
  price,
  onWorkNameChange,
  onDescriptionChange,
  onPriceChange,
  extractedParameters,
  preview3D,
  onPublish,
  publishButtonState,
  isPublishing,
  workNameError,
  descriptionError,
  priceError,
}: PublisherMintLayoutProps) {
  const coverInputRef = useRef<HTMLInputElement>(null);
  const algoInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-auto hide-scrollbar">
      <div className="relative min-h-full max-w-[1800px] mx-auto flex flex-col">
        {/* Sticky header */}
        <div className="sticky top-0 z-30">
          <RetroHeading 
            title="CREATE NEW ATELIER"
            author={`BY ${artistName?.toUpperCase() || 'ARTIST'} | @${artistAddress?.slice(0, 6)}...${artistAddress?.slice(-4)}`}
          />
        </div>

        {/* Main content */}
        <div className="px-6 pb-6 mt-4 flex-1 flex flex-col lg:flex-row gap-3">
          {/* Left column: 3D Preview and Artwork Info */}
          <div className="lg:w-[55%] flex flex-col gap-3">
            {/* 3D Preview */}
            <RetroPreview height="500px">
              {preview3D ? (
                preview3D
              ) : (
                <RetroEmptyState
                  icon="box"
                  title="NO ALGORITHM LOADED"
                  message="Upload .js file to generate 3D preview"
                />
              )}
            </RetroPreview>

            {/* Artwork Info - converted to inputs */}
            <RetroSection title="ARTWORK INFO">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Cover Image Upload */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white/90 text-xs font-mono uppercase tracking-wide">COVER IMAGE</h3>
                      {coverImageRequired && (
                        <span className="text-[9px] text-red-400">REQUIRED</span>
                      )}
                    </div>
                    
                    {!coverImage ? (
                      <div 
                        className="relative border-2 rounded cursor-pointer transition-colors hover:border-white/30 aspect-square"
                        style={{
                          borderTop: '2px solid #0a0a0a',
                          borderLeft: '2px solid #0a0a0a',
                          borderBottom: '2px solid #333',
                          borderRight: '2px solid #333',
                          backgroundColor: '#0a0a0a',
                        }}
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                          <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-[10px] text-white/60 font-mono uppercase text-center">
                            CLICK TO UPLOAD
                          </p>
                          <p className="text-[9px] text-white/30 font-mono text-center">
                            JPG, PNG, GIF • MAX 10MB
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="relative border-2 rounded overflow-hidden group aspect-square"
                        style={{
                          borderTop: '2px solid #333',
                          borderLeft: '2px solid #333',
                          borderBottom: '2px solid #0a0a0a',
                          borderRight: '2px solid #0a0a0a',
                          backgroundColor: '#1a1a1a',
                        }}
                      >
                        <img 
                          src={coverImageUrl} 
                          alt="Cover" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <RetroButton 
                            size="sm" 
                            variant="secondary"
                            onClick={() => coverInputRef.current?.click()}
                          >
                            CHANGE
                          </RetroButton>
                          <RetroButton 
                            size="sm" 
                            variant="secondary"
                            onClick={onCoverImageRemove}
                          >
                            REMOVE
                          </RetroButton>
                        </div>
                      </div>
                    )}
                    
                    <input 
                      ref={coverInputRef}
                      type="file" 
                      accept="image/jpeg,image/png,image/gif"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onCoverImageUpload(file);
                      }}
                    />
                    
                    {coverImage && (
                      <div className="mt-2 text-[10px] text-white/40 font-mono">
                        {coverImage.name} • {formatFileSize(coverImage.size)}
                      </div>
                    )}
                  </div>
                  
                  {/* Description Input */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white/90 text-xs font-mono uppercase tracking-wide">DESCRIPTION</h3>
                      {descriptionError && (
                        <span className="text-[9px] text-red-400">REQUIRED</span>
                      )}
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => onDescriptionChange(e.target.value)}
                      placeholder="Describe your artwork and creative concept..."
                      className={`w-full h-full bg-black/60 text-white/90 text-xs p-2 font-mono border ${descriptionError ? 'border-red-400/50' : 'border-white/10'} focus:outline-none focus:border-white/30 resize-none placeholder:text-white/20`}
                      style={{
                        borderTop: '1px solid #0a0a0a',
                        borderLeft: '1px solid #0a0a0a',
                        borderBottom: '1px solid #333',
                        borderRight: '1px solid #333',
                        minHeight: '150px',
                      }}
                    />
                  </div>
                </div>

                {/* Artist Statement - from Membership */}
                <div className="border-t border-white/10 pt-3">
                  <h3 className="text-white/90 text-xs font-mono uppercase mb-2 tracking-wide">ARTIST STATEMENT</h3>
                  <p className="text-white/60 text-xs font-mono leading-relaxed">{intro || 'No artist statement provided'}</p>
                </div>
              </div>
            </RetroSection>
          </div>

          {/* Right column: File Uploads, Basic Info, Parameters, Publish */}
          <div className="lg:w-[45%] flex flex-col gap-3">
            {/* File Uploads */}
            <RetroSection 
              title="FILE UPLOADS"
            >
              <div className="space-y-3">
                {/* Algorithm File Upload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-xs font-mono uppercase">ALGORITHM FILE</span>
                    {algoFileRequired && (
                      <span className="text-[9px] text-red-400">REQUIRED</span>
                    )}
                  </div>
                  
                  {!algoFile ? (
                    <div 
                      className="relative border-2 rounded cursor-pointer transition-colors hover:border-white/30"
                      style={{
                        borderTop: '2px solid #0a0a0a',
                        borderLeft: '2px solid #0a0a0a',
                        borderBottom: '2px solid #333',
                        borderRight: '2px solid #333',
                        backgroundColor: '#0a0a0a',
                        minHeight: '100px'
                      }}
                      onClick={() => algoInputRef.current?.click()}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
                        <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                            d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                          />
                        </svg>
                        <p className="text-xs text-white/60 font-mono uppercase text-center">
                          CLICK TO UPLOAD
                        </p>
                        <p className="text-[9px] text-white/30 font-mono text-center">
                          JAVASCRIPT (.js) • MAX 1MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="relative border-2 rounded"
                      style={{
                        borderTop: '2px solid #333',
                        borderLeft: '2px solid #333',
                        borderBottom: '2px solid #0a0a0a',
                        borderRight: '2px solid #0a0a0a',
                        backgroundColor: '#1a1a1a',
                      }}
                    >
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex items-center justify-center bg-black/40 rounded border border-white/10">
                            <span className="text-xs text-white/60 font-mono">.JS</span>
                          </div>
                          <div>
                            <p className="text-xs text-white/90 font-mono truncate max-w-[200px]">
                              {algoFile.name}
                            </p>
                            <p className="text-[10px] text-white/40 font-mono">
                              {formatFileSize(algoFile.size)}
                            </p>
                            {extractedParameters.length > 0 && (
                              <p className="text-[10px] text-green-400 font-mono mt-1">
                                ✓ {extractedParameters.length} parameters extracted
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <RetroButton 
                            size="sm" 
                            variant="secondary"
                            onClick={() => algoInputRef.current?.click()}
                          >
                            CHANGE
                          </RetroButton>
                          <RetroButton 
                            size="sm" 
                            variant="secondary"
                            onClick={onAlgoFileRemove}
                          >
                            REMOVE
                          </RetroButton>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <input 
                    ref={algoInputRef}
                    type="file" 
                    accept=".js,application/javascript,text/javascript"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onAlgoFileUpload(file);
                    }}
                  />
                </div>
              </div>
            </RetroSection>

            {/* Basic Info */}
            <RetroSection title="BASIC INFO">
              <div className="space-y-3">
                {/* Artwork Title */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/60 text-xs font-mono uppercase">ARTWORK TITLE</span>
                    {workNameError && (
                      <span className="text-[9px] text-red-400">REQUIRED</span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={workName}
                    onChange={(e) => onWorkNameChange(e.target.value)}
                    placeholder="Enter artwork title..."
                    className={`w-full bg-black/60 text-white/90 text-xs p-2 font-mono border ${workNameError ? 'border-red-400/50' : 'border-white/10'} focus:outline-none focus:border-white/30 placeholder:text-white/20`}
                    style={{
                      borderTop: '1px solid #0a0a0a',
                      borderLeft: '1px solid #0a0a0a',
                      borderBottom: '1px solid #333',
                      borderRight: '1px solid #333',
                    }}
                  />
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white/60 text-xs font-mono uppercase">PRICE (SUI)</span>
                    {priceError && (
                      <span className="text-[9px] text-red-400">REQUIRED</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <img src="/sui_symbol_white.png" alt="Sui Symbol" width={14} height={24} />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={price}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || /^\d*\.?\d*$/.test(value)) {
                          onPriceChange(value);
                        }
                      }}
                      placeholder="0 or any amount..."
                      className={`flex-1 bg-black/60 text-white/90 text-xs p-2 font-mono border ${priceError ? 'border-red-400/50' : 'border-white/10'} focus:outline-none focus:border-white/30 placeholder:text-white/20`}
                      style={{
                        borderTop: '1px solid #0a0a0a',
                        borderLeft: '1px solid #0a0a0a',
                        borderBottom: '1px solid #333',
                        borderRight: '1px solid #333',
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[9px] text-white/30 font-mono">
                    Accepts 0 and decimal values (e.g., 0, 1.5, 10.99)
                  </p>
                </div>
              </div>
            </RetroSection>

            {/* Extracted Parameters - Read-only display */}
            <RetroSection 
              title="EXTRACTED PARAMETERS"
              titleRight={
                extractedParameters.length > 0 ? (
                  <span className="text-[9px] text-green-400">
                    ✓ {extractedParameters.length} FOUND
                  </span>
                ) : null
              }
            >
              {extractedParameters.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-white/40 font-mono uppercase">
                    NO PARAMETERS FOUND
                  </p>
                  <p className="text-[10px] text-white/30 font-mono mt-1">
                    Upload algorithm file to extract parameters
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-auto hide-scrollbar">
                  {extractedParameters.map((param, index) => (
                    <div 
                      key={index} 
                      className="bg-black/40 rounded p-2 border border-white/5"
                      style={{
                        borderTop: '1px solid #0a0a0a',
                        borderLeft: '1px solid #0a0a0a',
                        borderBottom: '1px solid #222',
                        borderRight: '1px solid #222',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-white/90 font-mono uppercase font-semibold">
                          {param.label || param.name}
                        </span>
                        <span className="text-[9px] text-white/40 font-mono uppercase px-2 py-0.5 bg-white/5 rounded">
                          {param.type}
                        </span>
                      </div>
                      
                      {param.type === 'number' && (
                        <div className="grid grid-cols-3 gap-2 text-[10px] text-white/50 font-mono">
                          <div>
                            <span className="text-white/40">MIN:</span> {param.min ?? 'N/A'}
                          </div>
                          <div>
                            <span className="text-white/40">MAX:</span> {param.max ?? 'N/A'}
                          </div>
                          <div>
                            <span className="text-white/40">DEFAULT:</span> {param.default ?? 'N/A'}
                          </div>
                        </div>
                      )}
                      
                      {param.type !== 'number' && (
                        <div className="text-[10px] text-white/50 font-mono">
                          <span className="text-white/40">DEFAULT:</span> {String(param.default)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </RetroSection>

            {/* Publish Atelier */}
            <RetroSection title="PUBLISH ATELIER">
              <div className="space-y-3">
                <div className="relative">
                  <RetroButton 
                    onClick={onPublish}
                    disabled={publishButtonState.disabled || isPublishing}
                    size="lg"
                    variant="primary"
                    className="w-full"
                  >
                    {isPublishing ? 'PUBLISHING...' : 'PUBLISH ATELIER'}
                  </RetroButton>
                  {publishButtonState.tooltip && publishButtonState.disabled && (
                    <div className="mt-2 text-[10px] text-red-400 font-mono">
                      {publishButtonState.tooltip}
                    </div>
                  )}
                </div>
              </div>
            </RetroSection>
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
    </div>
  );
}

