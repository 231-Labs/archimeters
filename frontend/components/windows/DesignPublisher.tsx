import { useEffect } from 'react';
import { BasicInfoPage } from '@/components/features/design-publisher/components/pages/BasicInfoPage';
import { AlgorithmPage } from '@/components/features/design-publisher/components/pages/AlgorithmPage';
import { PreviewPage } from '@/components/features/design-publisher/components/pages/PreviewPage';
import { UploadStatusPage } from '@/components/features/design-publisher/components/pages/UploadStatusPage';
import { NavigationButtons } from '@/components/features/design-publisher/components/NavigationButtons';
import { useDesignPublisherForm } from '@/components/features/design-publisher/hooks/useDesignPublisherForm';

export default function DesignPublisher() {
  const {
    // Form state
    artworkInfo,
    artistInfo,
    designSettings,
    updateArtworkInfo,
    updateArtistInfo,
    updateDesignSettings,
    
    // Parameters
    extractedParameters,
    previewParams,
    showPreview,
    handleParameterChange,
    
    // Validation
    validationState,
    
    // Files
    imageFile,
    imageUrl,
    algoFile,
    algoResponse,
    algoError,
    userScript,
    handleImageFileChange,
    handleAlgoFileChange,
    handlePriceChange,
    setUserScript,
    
    // Membership
    membershipData,
    setMembershipData,
    
    // Navigation
    currentPage,
    goToNextPage,
    goToPreviousPage,
    
    // Upload & Transaction
    isUploading,
    uploadStatus,
    uploadResults,
    currentStep,
    steps,
    transactionDigest,
    transactionError,
    handleMint,
    
    // Reset
    resetAll,
  } = useDesignPublisherForm();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetAll();
    };
  }, []);

  return (
    <div className="h-full w-full bg-[#1a1a1a]">
      {/* Page content */}
      <div className="h-full relative">
        {currentPage === 1 && (
          <BasicInfoPage
            workName={artworkInfo.workName}
            description={artworkInfo.description}
            price={artworkInfo.price}
            name={artistInfo.name}
            social={artistInfo.social}
            intro={artistInfo.intro}
            imageFile={imageFile}
            imageUrl={imageUrl}
            onWorkNameChange={(value) => updateArtworkInfo('workName', value)}
            onDescriptionChange={(value) => updateArtworkInfo('description', value)}
            onPriceChange={handlePriceChange}
            onIntroChange={(value) => updateArtistInfo('intro', value)}
            onImageFileChange={handleImageFileChange}
            onMembershipDataChange={setMembershipData}
            workNameRequired={validationState.workNameRequired}
            descriptionRequired={validationState.descriptionRequired}
            priceRequired={validationState.priceRequired}
            introRequired={validationState.introRequired}
            imageRequired={validationState.imageRequired}
            priceError={validationState.priceError}
          />
        )}
        {currentPage === 2 && (
          <AlgorithmPage
            algoFile={algoFile}
            algoResponse={algoResponse}
            algoError={algoError}
            algoRequired={validationState.algoRequired}
            showPreview={showPreview}
            previewParams={previewParams}
            extractedParameters={extractedParameters}
            style={designSettings.style}
            fontStyle={designSettings.fontStyle}
            onFileChange={handleAlgoFileChange}
            onStyleChange={(value) => updateDesignSettings('style', value)}
            onFontStyleChange={(value) => updateDesignSettings('fontStyle', value)}
            onUserScriptChange={setUserScript}
          />
        )}
        {currentPage === 3 && (
          <PreviewPage
            workName={artworkInfo.workName}
            description={artworkInfo.description}
            price={artworkInfo.price}
            name={artistInfo.name}
            social={artistInfo.social}
            intro={artistInfo.intro}
            imageUrl={imageUrl}
            parameters={extractedParameters}
            previewParams={previewParams}
            onParameterChange={handleParameterChange}
            onMint={goToNextPage}
            userScript={userScript}
            membershipData={membershipData}
          />
        )}
        {currentPage === 4 && (
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
            name={artistInfo.name}
            social={artistInfo.social}
            intro={artistInfo.intro}
            price={artworkInfo.price}
            transactionDigest={transactionDigest}
            transactionError={transactionError}
            onSubmit={() => handleMint(uploadResults!)}
            onPrevious={goToPreviousPage}
          />
        )}
        <NavigationButtons
          currentPage={currentPage}
          totalPages={4}
          onNext={goToNextPage}
          onPrevious={goToPreviousPage}
        />
      </div>
    </div>
  );
}
