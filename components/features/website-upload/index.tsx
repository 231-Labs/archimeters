import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { createDesignSeries, ARTLIER_STATE_ID, PACKAGE_ID } from '@/utils/transactions';
import { createMetadataJson } from './utils/metadata';
import { useUpload } from './hooks/useUpload';
import { useFileUpload } from './hooks/useFileUpload';
import { useArtworkForm } from './hooks/useArtworkForm';
import { useValidation } from './hooks/useValidation';
import { useParameters } from './hooks/useParameters';
import { BasicInfoPage } from './components/pages';
import { AlgorithmPage } from './components/pages';
import { PreviewPage } from './components/pages';
import { UploadStatusPage } from './components/pages';
import type { UploadResults, ArtworkInfo, ArtistInfo, DesignSettings } from './types';

export default function WebsiteUpload() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string>('');
  const totalPages = 4;

  // Custom hooks
  const {
    imageFile,
    imageUrl,
    algoFile,
    algoResponse,
    algoError,
    handleImageFileChange,
    handleAlgoFileChange,
    resetFiles
  } = useFileUpload();

  const {
    artworkInfo,
    artistInfo,
    designSettings,
    updateArtworkInfo,
    updateArtistInfo,
    updateDesignSettings,
    resetForm
  } = useArtworkForm();

  const {
    validationState,
    validatePrice,
    validateForm,
    resetValidation
  } = useValidation();

  const {
    extractedParameters,
    hasExtractedParams,
    previewParams,
    showPreview,
    processSceneFile,
    updateParameter,
    togglePreview,
    resetParameters
  } = useParameters();

  const { 
    isLoading, 
    uploadStatus, 
    uploadResults, 
    currentStep: uploadStep,
    steps: uploadSteps,
    handleUpload: uploadFiles, 
    resetUpload
  } = useUpload({
    onSuccess: (results) => {
      console.log('Upload completed with results:', results);
      if (results.success) {
        handleMint(results);
      }
    },
    onError: (error) => setError(error)
  });

  // Blockchain related
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [transactionDigest, setTransactionDigest] = useState<string>('');
  const [transactionError, setTransactionError] = useState<string>('');
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [membershipId, setMembershipId] = useState<string>('');

  // Fetch membership
  useEffect(() => {
    const fetchMembership = async () => {
      if (!currentAccount?.address) {
        console.error('No wallet connected');
        return;
      }

      try {
        const { data: objects } = await suiClient.getOwnedObjects({
          owner: currentAccount.address,
          filter: {
            StructType: `${PACKAGE_ID}::archimeters::MemberShip`
          },
          options: {
            showType: true,
          }
        });

        if (objects && objects.length > 0) {
          const id = objects[0].data?.objectId;
          if (id) {
            console.log('Found membership ID:', id);
            setMembershipId(id);
          } else {
            console.error('Membership object found but no ID');
          }
        } else {
          console.error('No membership found for address:', currentAccount.address);
        }
      } catch (error) {
        console.error('Error fetching membership:', error);
      }
    };

    fetchMembership();
  }, [currentAccount, suiClient]);

  // Cleanup
  useEffect(() => {
    return () => {
      resetFiles();
      resetForm();
      resetValidation();
      resetParameters();
      resetUpload?.();
    };
  }, []);

  const handleMint = async (results?: UploadResults) => {
    if (!membershipId) {
      const error = 'No membership ID found. Please make sure you have a valid membership.';
      console.error(error);
      setTransactionError(error);
      return;
    }

    if (!results?.imageBlobId || !results?.algoBlobId || !results?.metadataBlobId) {
      const error = 'Missing required upload results';
      console.error(error);
      setTransactionError(error);
      return;
    }

    try {
      const tx = await createDesignSeries(
        ARTLIER_STATE_ID,
        membershipId,
        results.imageBlobId,
        results.metadataBlobId,
        results.algoBlobId,
        '0x6',
        Number(artworkInfo.price)
      );

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            console.log("Transaction successful:", result);
            setTransactionDigest(result.digest);
          },
          onError: (error) => {
            console.error("Transaction failed:", error);
            setTransactionError(error.message);
          }
        }
      );
    } catch (error) {
      console.error('Error in handleMint:', error);
      setTransactionError('Failed to create transaction');
    }
  };

  const handleUploadSubmit = async () => {
    if (!imageFile || !algoFile) return;

    const metadataJson = createMetadataJson({
      workName: artworkInfo.workName,
      description: artworkInfo.description,
      style: designSettings.style,
      fontStyle: designSettings.fontStyle,
      name: artistInfo.name,
      social: artistInfo.social,
      intro: artistInfo.intro
    });

    const metadataBlob = new Blob([JSON.stringify(metadataJson, null, 2)], {
      type: 'application/json',
    });

    const metadataFile = new File([metadataBlob], 'metadata.json', {
      type: 'application/json',
    });

    await uploadFiles(imageFile, algoFile, metadataFile);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="h-full flex flex-col">
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
          onPriceChange={(value) => updateArtworkInfo('price', value)}
          onIntroChange={(value) => updateArtistInfo('intro', value)}
          onImageFileChange={handleImageFileChange}
          workNameRequired={false}
          descriptionRequired={false}
          priceRequired={false}
          introRequired={false}
          imageRequired={false}
          priceError=""
        />
      )}

      {currentPage === 2 && (
        <AlgorithmPage
          algoFile={algoFile}
          algoResponse={algoResponse}
          algoError={algoError}
          algoRequired={false}
          showPreview={showPreview}
          previewParams={previewParams}
          extractedParameters={extractedParameters}
          style={designSettings.style}
          fontStyle={designSettings.fontStyle}
          onFileChange={handleAlgoFileChange}
          onExtractParameters={(params) => {
            const extracted = processSceneFile(algoResponse);
            if (extracted && typeof extracted === 'object') {
              Object.entries(extracted).forEach(([key, value]) => {
                updateParameter(key, value);
              });
            }
          }}
          onUpdatePreviewParams={(params) => {
            Object.entries(params).forEach(([key, value]) => {
              updateParameter(key, value);
            });
          }}
          onTogglePreview={togglePreview}
          onStyleChange={(style) => updateDesignSettings('style', style)}
          onFontStyleChange={(font) => updateDesignSettings('fontStyle', font)}
          onNext={goToNextPage}
          onPrevious={goToPreviousPage}
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
          onParameterChange={updateParameter}
          onMint={goToNextPage}
        />
      )}

      {currentPage === 4 && (
        <UploadStatusPage
          isLoading={isLoading}
          uploadStatus={uploadStatus}
          uploadResults={uploadResults}
          currentStep={uploadStep}
          steps={uploadSteps}
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
          onSubmit={handleMint}
          onPrevious={goToPreviousPage}
        />
      )}
    </div>
  );
} 