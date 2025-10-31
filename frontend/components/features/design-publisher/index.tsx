import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { createArtlier, ATELIER_STATE_ID, PACKAGE_ID } from '@/utils/transactions';
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
    userScript,
    handleImageFileChange,
    handleAlgoFileChange,
    resetFiles,
    setUserScript
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
  const [membershipData, setMembershipData] = useState<{
    username: string;
    description: string;
    address: string;
  } | null>(null);

  // Fetch membership
  useEffect(() => {
    const fetchMembership = async () => {
      if (!currentAccount?.address) {
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
            setMembershipId(id);
          }
        }
      } catch (error) {
        setError('Error fetching membership');
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
      setTransactionError('No membership ID found. Please make sure you have a valid membership.');
      return;
    }

    if (!results?.imageBlobId || !results?.algoBlobId || !results?.metadataBlobId) {
      setTransactionError('Missing required upload results');
      return;
    }

    try {
      const tx = await createArtlier(
        ATELIER_STATE_ID,
        membershipId,
        artworkInfo.workName,
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
            setTransactionDigest(result.digest);
          },
          onError: (error) => {
            setTransactionError(error.message);
          }
        }
      );
    } catch (error) {
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
      address: currentAccount?.address || '',
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl text-white">Design Publisher</h1>
      </div>
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
            onMembershipDataChange={setMembershipData}
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
            onStyleChange={(style) => updateDesignSettings('style', style)}
            onFontStyleChange={(font) => updateDesignSettings('fontStyle', font)}
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
            onParameterChange={updateParameter}
            onMint={goToNextPage}
            userScript={userScript}
            membershipData={membershipData}
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
    </div>
  );
} 