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
import { BasicInfoPage } from './components/pages/BasicInfoPage';
import { AlgorithmPage } from './components/pages/AlgorithmPage';
import { PreviewPage } from './components/pages/PreviewPage';
import { UploadStatusPage } from './components/pages/UploadStatusPage';
import type { UploadResults } from './types';

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
      if (!currentAccount?.address) return;

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
          setMembershipId(objects[0].data?.objectId || '');
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
    if (!results?.blobIds || !membershipId) return;

    try {
      const tx = await createDesignSeries({
        membershipId,
        artlierId: ARTLIER_STATE_ID,
        name: artworkInfo.workName,
        description: artworkInfo.description,
        price: Number(artworkInfo.price),
        imageId: results.blobIds.image,
        algorithmId: results.blobIds.algorithm,
        metadataId: results.blobIds.metadata,
      });

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
      artworkInfo,
      artistInfo,
      designSettings,
      parameters: extractedParameters,
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
          artworkInfo={artworkInfo}
          artistInfo={artistInfo}
          designSettings={designSettings}
          validationState={validationState}
          onUpdateArtworkInfo={updateArtworkInfo}
          onUpdateArtistInfo={updateArtistInfo}
          onUpdateDesignSettings={updateDesignSettings}
          onNext={goToNextPage}
        />
      )}

      {currentPage === 2 && (
        <AlgorithmPage
          imageFile={imageFile}
          imageUrl={imageUrl}
          algoFile={algoFile}
          algoResponse={algoResponse}
          algoError={algoError}
          validationState={validationState}
          onImageChange={handleImageFileChange}
          onAlgoChange={handleAlgoFileChange}
          onNext={goToNextPage}
          onPrevious={goToPreviousPage}
        />
      )}

      {currentPage === 3 && (
        <PreviewPage
          previewParams={previewParams}
          showPreview={showPreview}
          onParameterChange={updateParameter}
          onTogglePreview={togglePreview}
          onNext={goToNextPage}
          onPrevious={goToPreviousPage}
        />
      )}

      {currentPage === 4 && (
        <UploadStatusPage
          isLoading={isLoading}
          uploadStatus={uploadStatus}
          error={error}
          transactionDigest={transactionDigest}
          transactionError={transactionError}
          onSubmit={handleUploadSubmit}
          onPrevious={goToPreviousPage}
        />
      )}
    </div>
  );
} 