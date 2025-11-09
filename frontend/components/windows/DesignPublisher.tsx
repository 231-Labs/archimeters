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
              placeholder="Enter artwork title..."
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
            {/* 3D Preview */}
            <div 
              className="relative overflow-hidden"
              style={{
                borderTop: '2px solid #444',
                borderLeft: '2px solid #444',
                borderBottom: '2px solid #000',
                borderRight: '2px solid #000',
                backgroundColor: '#0a0a0a',
                boxShadow: 'inset 1px 1px 3px rgba(255, 255, 255, 0.08), inset -1px -1px 3px rgba(0, 0, 0, 0.5)',
                height: '400px',
              }}
            >
              {userScript && algoFile ? (
          <ParametricViewer
            userScript={userScript}
            parameters={previewParams}
          />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <svg className="w-16 h-16 text-white/10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <p className="text-white/30 text-sm font-mono">NO ALGORITHM LOADED</p>
                  <p className="text-white/20 text-xs font-mono mt-2">Upload .js file to generate 3D preview</p>
                </div>
              )}
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
                <h4 className="text-white/60 text-xs font-mono uppercase mb-2">Artist Statement</h4>
                <p className="text-white/50 text-xs font-mono leading-relaxed">
                  {membershipData?.description || artistInfo.intro || 'No artist statement provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:w-[45%] flex flex-col gap-3">
            {/* Algorithm File Upload */}
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white/90 text-xs font-mono uppercase tracking-wide">Algorithm File</h3>
                {validationState.algoRequired && (
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
                    height: '120px',
                  }}
                  onClick={() => algoInputRef.current?.click()}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-[10px] text-white/60 font-mono uppercase">CLICK TO UPLOAD</p>
                    <p className="text-[9px] text-white/30 font-mono">JAVASCRIPT (.js) • MAX 1MB</p>
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
                    height: '120px',
                    backgroundColor: '#0a0a0a',
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <svg className="w-10 h-10 text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-white/70 text-xs font-mono">{algoFile.name}</p>
                    <p className="text-white/40 text-[10px] font-mono mt-1">
                      {(algoFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <RetroButton 
                      size="sm" 
                      variant="secondary"
                      onClick={() => algoInputRef.current?.click()}
                    >
                      CHANGE
                    </RetroButton>
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
                  if (file) handleAlgoFileChange(file);
                }}
              />
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
