import { useEffect, useRef, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { ParametricViewer } from '@/components/features/design-publisher/components/pages/ParametricViewer';
import { UploadStatusPage } from '@/components/features/design-publisher/components/pages/UploadStatusPage';
import { useDesignPublisherForm } from '@/components/features/design-publisher/hooks/useDesignPublisherForm';
import { createMetadataJson } from '@/components/features/design-publisher/utils/metadata';
import { RetroButton } from '@/components/common/RetroButton';
import { RetroInput } from '@/components/common/RetroInput';
import { ParameterControls } from '@/components/common/ParameterControls';
import { WindowName } from '@/components/features/window-manager/types';

interface DesignPublisherProps {
  onOpenWindow?: (windowName: WindowName) => void;
}

export default function DesignPublisher({ onOpenWindow }: DesignPublisherProps = {}) {
  const currentAccount = useCurrentAccount();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const algoInputRef = useRef<HTMLInputElement>(null);
  const [showUploadStatus, setShowUploadStatus] = useState(false);
  const [isDraggingAlgo, setIsDraggingAlgo] = useState(false);

  const {
    // Form state
    artworkInfo,
    artistInfo,
    designSettings,
    updateArtworkInfo,
    
    // Parameters
    extractedParameters,
    previewParams,
    handleParameterChange,
    
    // Validation
    validationState,
    
    // Files
    imageFile,
    imageUrl,
    algoFile,
    userScript,
    handleImageFileChange,
    handleAlgoFileChange,
    handlePriceChange,
    
    // Script Analysis
    scriptAnalysis,
    
    // Membership
    membershipData,
    
    // Upload & Transaction
    isUploading,
    uploadStatus,
    uploadResults,
    currentStep,
    steps,
    transactionDigest,
    transactionError,
    
    // Upload function
    uploadFiles,
    
    // Reset
    resetAll,
  } = useDesignPublisherForm();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetAll();
    };
  }, []);

  // Handle drag and drop for algorithm file
  const handleAlgoDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAlgo(true);
  };

  const handleAlgoDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAlgo(false);
  };

  const handleAlgoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAlgoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAlgo(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.js')) {
        handleAlgoFileChange(file);
      } else {
        alert('Please upload a JavaScript (.js) file');
      }
    }
  };

  // Handle publish
  const handlePublish = async () => {
    if (!imageFile || !algoFile) {
      alert('Please upload both cover image and algorithm file');
      return;
    }
    if (!artworkInfo.workName.trim()) {
      alert('Please enter artwork title');
      return;
    }
    if (!artworkInfo.description.trim()) {
      alert('Please enter description');
      return;
    }

    // Show upload status page
    setShowUploadStatus(true);

    const metadata = createMetadataJson({
      workName: artworkInfo.workName,
      description: artworkInfo.description,
      style: designSettings.style,
      fontStyle: designSettings.fontStyle,
      name: artistInfo.name,
      address: currentAccount?.address || '',
      intro: artistInfo.intro,
      isPrintable: artworkInfo.isPrintable,
      membershipData: membershipData,
      extractedParameters: extractedParameters
    });

    uploadFiles(imageFile, algoFile, metadata);
  };

  const isPublishDisabled = 
    !imageFile || 
    !algoFile || 
    !artworkInfo.workName.trim() || 
    !artworkInfo.description.trim() ||
    isUploading;

  // Show upload status page if upload is in progress or has started
  if (showUploadStatus) {
    return (
      <div className="h-full bg-[#0a0a0a] text-white">
        <UploadStatusPage
          isLoading={isUploading}
          uploadStatus={uploadStatus}
          uploadResults={uploadResults}
          currentStep={currentStep}
          steps={steps}
          workName={artworkInfo.workName}
          description={artworkInfo.description}
          style={designSettings.style}
          fontStyle={designSettings.fontStyle}
          name={membershipData?.username || artistInfo.name}
          social={currentAccount?.address || ''}
          intro={membershipData?.description || artistInfo.intro}
          price={artworkInfo.price}
          transactionDigest={transactionDigest}
          transactionError={transactionError}
          onSubmit={() => {
            // Handle mint transaction if needed
          }}
          onPrevious={() => {
            setShowUploadStatus(false);
          }}
          onGoToVault={() => {
            onOpenWindow?.('vault');
          }}
          onGoToMarketplace={() => {
            onOpenWindow?.('marketplace');
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-auto hide-scrollbar">
      <div className="relative min-h-full max-w-[1800px] mx-auto flex flex-col">
        {/* Sticky header */}
        <div 
          className="sticky top-0 z-30 px-6 py-3 flex items-center gap-4"
          style={{
            background: '#1a1a1a',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div className="flex-1">
            <RetroInput
              type="text"
              value={artworkInfo.workName}
              onChange={(e) => updateArtworkInfo('workName', e.target.value)}
              placeholder="ENTER ARTWORK TITLE"
              className="text-xl"
            />
          </div>
          <div className="flex items-center text-white/40 text-sm font-mono">
            <span className="font-light">by</span>
            <span className="mx-2">{membershipData?.username || artistInfo.name || 'Artist'}</span>
            <span className="text-white/30">|</span>
            <span className="ml-2 text-xs">@{(currentAccount?.address || '0x0000...0000').slice(0, 6)}...{(currentAccount?.address || '0x0000...0000').slice(-4)}</span>
          </div>
        </div>

        {/* Main content */}
        <div className="px-6 pb-6 mt-4 flex-1 flex flex-col lg:flex-row gap-3">
          {/* Left column: 3D Preview and Artwork Info */}
          <div className="lg:w-[55%] flex flex-col gap-3">
            {/* 3D Preview with Upload */}
            <div 
              className="relative overflow-hidden group"
              style={{
                borderTop: '2px solid #444',
                borderLeft: '2px solid #444',
                borderBottom: '2px solid #000',
                borderRight: '2px solid #000',
                backgroundColor: '#0a0a0a',
                boxShadow: 'inset 1px 1px 3px rgba(255, 255, 255, 0.08), inset -1px -1px 3px rgba(0, 0, 0, 0.5)',
                height: '400px',
              }}
              onDragEnter={handleAlgoDragEnter}
              onDragLeave={handleAlgoDragLeave}
              onDragOver={handleAlgoDragOver}
              onDrop={handleAlgoDrop}
            >
              {userScript && algoFile ? (
                <>
                  <ParametricViewer
                    userScript={userScript}
                    parameters={previewParams}
                    isPrintable={artworkInfo.isPrintable}
                  />
                  {/* Floating change button */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => algoInputRef.current?.click()}
                      className="bg-black/80 hover:bg-black/90 text-white/90 text-[10px] font-mono px-3 py-1.5 border border-white/20 hover:border-white/40 transition-all"
                      style={{
                        borderTop: '2px solid #666',
                        borderLeft: '2px solid #666',
                        borderBottom: '2px solid #000',
                        borderRight: '2px solid #000',
                      }}
                    >
                      CHANGE ALGORITHM
                    </button>
                  </div>
                  {/* File info badge */}
                  <div className="absolute bottom-3 left-3 bg-black/60 px-2 py-1 border border-white/10">
                    <div className="flex items-center gap-2">
                      <svg className="w-3 h-3 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-white/60 text-[9px] font-mono">{algoFile.name}</span>
                      <span className="text-white/30 text-[9px] font-mono">
                        ({(algoFile.size / 1024).toFixed(1)}KB)
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div 
                  className={`w-full h-full flex flex-col items-center justify-center cursor-pointer transition-all ${
                    isDraggingAlgo ? 'bg-cyan-500/10 border-2 border-cyan-400/40 border-dashed' : 'hover:bg-white/[0.02]'
                  }`}
                  onClick={() => algoInputRef.current?.click()}
                >
                  {isDraggingAlgo && (
                    <div className="absolute inset-0 bg-cyan-500/5 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <svg className="w-16 h-16 text-cyan-400 mx-auto mb-3 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                        <p className="text-cyan-400 text-sm font-mono uppercase">DROP FILE HERE</p>
                      </div>
                    </div>
                  )}
                  <div className={`flex flex-col items-center ${isDraggingAlgo ? 'opacity-20' : ''}`}>
                    <svg className="w-20 h-20 text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M9 12h6m-3-3v6"
                      />
                    </svg>
                    <p className="text-white/60 text-sm font-mono uppercase mb-2">Upload Algorithm File</p>
                    <p className="text-white/30 text-xs font-mono mb-4">Click to browse or drag & drop</p>
                    <div className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                      <span className="text-white/50 text-[10px] font-mono uppercase">JAVASCRIPT (.js) • MAX 1MB</span>
                    </div>
                  </div>
                  {validationState.algoRequired && (
                    <p className="text-red-400 text-[10px] font-mono mt-4 uppercase">ALGORITHM FILE REQUIRED</p>
                  )}
                </div>
              )}
              <input 
                ref={algoInputRef}
                type="file" 
                accept=".js,application/javascript,text/javascript"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAlgoFileChange(file);
                }}
              />
            </div>

            {/* Artwork Info */}
            <div 
              className="p-4"
              style={{
                borderTop: '2px solid #444',
                borderLeft: '2px solid #444',
                borderBottom: '2px solid #000',
                borderRight: '2px solid #000',
                backgroundColor: '#1a1a1a',
                boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h3 className="text-white/90 text-xs font-mono uppercase tracking-wide mb-3">ARTWORK INFO</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Cover Image */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-xs font-mono uppercase">Cover Image</span>
                    {validationState.imageRequired && (
                      <span className="text-[9px] text-red-400">REQUIRED</span>
                    )}
                  </div>
                  {!imageFile ? (
                    <div 
                      className="relative border-2 rounded cursor-pointer transition-colors hover:border-white/30"
                      style={{
                        borderTop: '2px solid #0a0a0a',
                        borderLeft: '2px solid #0a0a0a',
                        borderBottom: '2px solid #333',
                        borderRight: '2px solid #333',
                        backgroundColor: '#0a0a0a',
                        height: '180px',
                      }}
                      onClick={() => coverInputRef.current?.click()}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-[10px] text-white/60 font-mono uppercase">CLICK TO UPLOAD</p>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="relative border-2 rounded overflow-hidden group"
                      style={{
                        borderTop: '2px solid #333',
                        borderLeft: '2px solid #333',
                        borderBottom: '2px solid #0a0a0a',
                        borderRight: '2px solid #0a0a0a',
                        height: '180px',
                      }}
                    >
                      <img 
                        src={imageUrl} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <RetroButton 
                          size="sm" 
                          variant="secondary"
                          onClick={() => coverInputRef.current?.click()}
                        >
                          CHANGE
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
                      if (file) handleImageFileChange(file);
                    }}
                  />
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/60 text-xs font-mono uppercase">Description</span>
                    {validationState.descriptionRequired && (
                      <span className="text-[9px] text-red-400">REQUIRED</span>
                    )}
                  </div>
                  <textarea
                    value={artworkInfo.description}
                    onChange={(e) => updateArtworkInfo('description', e.target.value)}
                    placeholder="Describe your artwork..."
                    className="w-full bg-black/60 text-white/90 text-xs p-2 font-mono border border-white/10 focus:outline-none focus:border-white/30 resize-none placeholder:text-white/20"
                    style={{
                      height: '180px',
                    }}
                  />
                </div>
              </div>

              {/* Artist Statement */}
              <div className="border-t border-white/10 pt-3">
                <h4 className="text-white/60 text-xs font-mono uppercase mb-2">ARTIST INFORMATION</h4>
                <p className="text-white/50 text-xs font-mono leading-relaxed">
                  {membershipData?.description || artistInfo.intro || 'No artist statement provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:w-[45%] flex flex-col gap-3">
            {/* Artwork Type Selection */}
            <div 
              className="p-4"
              style={{
                borderTop: '2px solid #444',
                borderLeft: '2px solid #444',
                borderBottom: '2px solid #000',
                borderRight: '2px solid #000',
                backgroundColor: '#1a1a1a',
                boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h3 className="text-white/90 text-xs font-mono uppercase tracking-wide mb-3">Artwork Type</h3>
              
              {/* Auto-detection result */}
              {scriptAnalysis && algoFile && (
                <div className="mb-3 p-2 bg-black/40 border border-white/10 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${
                      scriptAnalysis.confidence === 'high' ? 'bg-green-400' : 
                      scriptAnalysis.confidence === 'medium' ? 'bg-yellow-400' : 
                      'bg-gray-400'
                    }`} />
                    <span className="text-white/70 text-[10px] font-mono uppercase">
                      Auto-detected: {scriptAnalysis.recommendedMode === '3d-static' ? '3D Printable' : '2D/Animated'}
                    </span>
                  </div>
                  {scriptAnalysis.detectedFeatures.length > 0 && (
                    <p className="text-white/40 text-[9px] font-mono">
                      Features: {scriptAnalysis.detectedFeatures.slice(0, 3).join(', ')}
                    </p>
                  )}
                </div>
              )}

              {/* Manual toggle */}
              <div className="flex items-center justify-between py-2 px-3 bg-black/30 border border-white/10 rounded">
                <div className="flex-1">
                  <div className="text-white/70 text-xs font-mono">
                    {artworkInfo.isPrintable ? '3D Printable Object' : '2D / Animated Artwork'}
                  </div>
                  <div className="text-white/40 text-[9px] font-mono mt-1">
                    {artworkInfo.isPrintable 
                      ? 'Static 3D geometry for physical printing' 
                      : 'Supports animations, shaders, and visual effects'}
                  </div>
                </div>
                <button
                  onClick={() => updateArtworkInfo('isPrintable', !artworkInfo.isPrintable as any)}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                    ${artworkInfo.isPrintable ? 'bg-white/20' : 'bg-cyan-500/60'}
                  `}
                  disabled={!algoFile}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                      ${artworkInfo.isPrintable ? 'translate-x-1' : 'translate-x-6'}
                    `}
                  />
                </button>
              </div>

              {/* Info message */}
              {!algoFile ? (
                <p className="text-white/30 text-[9px] font-mono mt-2 text-center">
                  Upload algorithm file to enable type selection
                </p>
              ) : (
                <div className="mt-2 p-2 bg-black/20 border border-white/5 rounded">
                  <p className="text-white/40 text-[9px] font-mono leading-relaxed">
                    {artworkInfo.isPrintable ? (
                      <>
                        <span className="text-white/60">3D Mode:</span> Uses static rendering. Best for parametric designs that can be 3D printed.
                      </>
                    ) : (
                      <>
                        <span className="text-cyan-400/80">2D/Animation Mode:</span> Enables animation loops and shader effects. Perfect for digital art displays.
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Parameters */}
            <div 
              className="p-4"
              style={{
                borderTop: '2px solid #444',
                borderLeft: '2px solid #444',
                borderBottom: '2px solid #000',
                borderRight: '2px solid #000',
                backgroundColor: '#1a1a1a',
                boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h3 className="text-white/90 text-xs font-mono uppercase tracking-wide mb-3">Parameters</h3>
              
              {Object.keys(extractedParameters).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/40 text-xs font-mono">NO PARAMETERS FOUND</p>
                  <p className="text-white/30 text-[10px] font-mono mt-2">Upload algorithm file to extract parameters</p>
                </div>
              ) : (
                <div className="max-h-[350px] overflow-y-auto pr-2">
                  <ParameterControls
                    parameters={extractedParameters}
                    previewParams={previewParams}
                    onParameterChange={handleParameterChange}
                    showResetAll={true}
                  />
                </div>
              )}
            </div>

            {/* Publish */}
            <div 
              className="p-4"
              style={{
                borderTop: '2px solid #444',
                borderLeft: '2px solid #444',
                borderBottom: '2px solid #000',
                borderRight: '2px solid #000',
                backgroundColor: '#1a1a1a',
                boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
              }}
            >
              <h3 className="text-white/90 text-xs font-mono uppercase tracking-wide mb-3">Publish Atelier</h3>
              
              {/* Price */}
              <div className="flex items-center justify-between py-2 mb-4 border-b border-white/10">
                <span className="text-white/60 text-xs font-mono uppercase">Price</span>
                <div className="flex items-baseline gap-2">
                  <img src="/sui_symbol_white.png" alt="Sui" width={14} height={24} />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={artworkInfo.price}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="0"
                    className="bg-transparent text-white/90 text-xl font-mono text-right w-32 border-b border-transparent focus:outline-none focus:border-white/30 placeholder:text-white/20"
                  />
                </div>
              </div>

              <RetroButton 
                onClick={handlePublish}
                disabled={isPublishDisabled}
                size="lg"
                variant="primary"
                className="w-full"
              >
                {isUploading ? 'PUBLISHING...' : 'PUBLISH ATELIER'}
              </RetroButton>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
