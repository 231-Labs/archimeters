import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BasicInfoPage } from '../upload/components/pages/BasicInfoPage';
import { AlgorithmPage } from '../upload/components/pages/AlgorithmPage';
import { PreviewPage } from '../upload/components/pages/PreviewPage';
import { UploadStatusPage } from '../upload/components/pages/UploadStatusPage';
import { useUpload } from '../upload/hooks/useUpload';
import { createMetadataJson } from '../upload/utils/metadata';
import { TemplateSeries, FontStyle, UploadResults } from '../upload/types';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { createDesignSeries, ARTLIER_STATE_ID, PACKAGE_ID } from '@/utils/transactions';

export default function WebsiteUpload() {
  const router = useRouter();

  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageRequired, setImageRequired] = useState(false);

  // Algorithm states
  const [algoFile, setAlgoFile] = useState<File | null>(null);
  const [algoResponse, setAlgoResponse] = useState<string>('');
  const [algoError, setAlgoError] = useState<string>('');
  const [algoRequired, setAlgoRequired] = useState(false);
  
  // Parameter states
  const [extractedParameters, setExtractedParameters] = useState<Record<string, any>>({});
  const [hasExtractedParams, setHasExtractedParams] = useState(false);
  const [previewParams, setPreviewParams] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Artwork info
  const [workName, setWorkName] = useState('Parametric Constellation #42');
  const [description, setDescription] = useState('A generative artwork exploring celestial patterns through mathematical algorithms. Parameters can be adjusted to create unique constellations.');
  const [price, setPrice] = useState('1024');

  // Artist info
  const [name, setName] = useState('CryptoArtist#0042');
  const [social, setSocial] = useState('archimeters.lens');
  const [intro, setIntro] = useState('Digital artist exploring the intersection of mathematics and visual aesthetics through parametric art.');

  // Design settings
  const [style, setStyle] = useState<TemplateSeries>('default');
  const [fontStyle, setFontStyle] = useState<FontStyle>('sans');

  // Validation states
  const [workNameRequired, setWorkNameRequired] = useState(false);
  const [descriptionRequired, setDescriptionRequired] = useState(false);
  const [priceRequired, setPriceRequired] = useState(false);
  const [introRequired, setIntroRequired] = useState(false);
  const [priceError, setPriceError] = useState<string>('');

  // Page control
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  // Upload states
  const [error, setError] = useState<string>('');
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
        // 上傳完成後，設置當前步驟為交易步驟
        const transactionStepIndex = 2; // 交易步驟的索引
        setCurrentStep(transactionStepIndex);
        
        // 更新交易步驟狀態為處理中
        setSteps(prev => {
          const newSteps = [...prev];
          if (newSteps[transactionStepIndex]) {
            newSteps[transactionStepIndex].status = 'processing';
          }
          return newSteps;
        });
        
        handleMint(results);
      }
    },
    onError: (error) => setError(error)
  });

  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [transactionDigest, setTransactionDigest] = useState<string>('');
  const [transactionError, setTransactionError] = useState<string>('');

  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [membershipId, setMembershipId] = useState<string>('');

  // 在每次 uploadStep 或 uploadSteps 變化時更新本地狀態
  useEffect(() => {
    if (uploadSteps) {
      setCurrentStep(uploadStep);
      setSteps(prev => {
        // 保留 transaction 步驟（如果存在）
        const transactionStep = prev.find(step => step.id === 'transaction');
        const newSteps = [...uploadSteps];
        
        if (transactionStep && !newSteps.find(step => step.id === 'transaction')) {
          newSteps.push(transactionStep);
        }
        
        return newSteps;
      });
    }
  }, [uploadStep, uploadSteps]);

  // Cleanup function
  useEffect(() => {
    return () => {
      // 清除文件相關的狀態
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageFile(null);
      setImageUrl('');
      setAlgoFile(null);
      setAlgoResponse('');
      
      // 重置所有狀態
      setCurrentPage(1);
      setError('');
      setTransactionDigest('');
      setTransactionError('');
      resetUpload?.();
      
      // 清除參數相關的狀態
      setExtractedParameters({});
      setHasExtractedParams(false);
      setPreviewParams({});
      setShowPreview(false);
      
      // 重置驗證狀態
      setWorkNameRequired(false);
      setDescriptionRequired(false);
      setPriceRequired(false);
      setIntroRequired(false);
      setPriceError('');
    };
  }, []);

  // 獲取 membership
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

  // File handlers
  const handleImageFileChange = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(url);
    setImageRequired(false);
  };

  const handleAlgoFileChange = (file: File) => {
    setAlgoFile(file);
    setHasExtractedParams(false);
    setAlgoError('');
    setAlgoRequired(false);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        setAlgoResponse(content.substring(0, 500));
        processSceneFile(content);
      } catch (error) {
        setAlgoError('Failed to read algorithm file');
        console.error('Error reading algorithm file:', error);
      }
    };
    
    reader.onerror = () => {
      setAlgoError('Failed to read algorithm file');
    };
    
    reader.readAsText(file);
  };

  // Algorithm file processing
  const processSceneFile = (code: string) => {
    try {
      const parametersMatch = code.match(/export\s+const\s+(?:default)?[pP]arameters\s*=\s*({[\s\S]*?})(?:\s+as\s+const)?;/);
      
      if (parametersMatch && parametersMatch[1]) {
        let paramStr = parametersMatch[1];
        paramStr = paramStr.replace(/(\w+):/g, '"$1":');
        paramStr = paramStr.replace(/'([^']*?)'/g, '"$1"');
        paramStr = paramStr.replace(/,(\s*[}\]])/g, '$1');
        
        console.log("Processed param string:", paramStr);
        
        const extractedParams = JSON.parse(paramStr);
        
        const initialParams = Object.fromEntries(
          Object.entries(extractedParams).map(([key, value]: [string, any]) => [key, value.default])
        );
        setPreviewParams(initialParams);
        setShowPreview(true);
        
        setExtractedParameters(extractedParams);
        setHasExtractedParams(true);
        setAlgoError('');
      } else {
        throw new Error("Failed to extract parameters from code");
      }
    } catch (err) {
      console.error("Error processing algorithm file:", err);
      setAlgoError(`Parameter parsing failed: ${err instanceof Error ? err.message : String(err)}`);
      setShowPreview(false);
    }
  };

  // Parameter change handler
  const handleParameterChange = (key: string, value: string | number) => {
    const paramDef = extractedParameters[key];
    if (!paramDef) return;

    let processedValue: any = value;
    if (paramDef.type === 'number') {
      processedValue = value === '' ? '' : Number(value);
      if (typeof processedValue === 'number' && isNaN(processedValue)) return;
    }

    setPreviewParams(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  // Price input handler
  const handlePriceChange = (value: string) => {
    if (value === '' || /^\d+$/.test(value)) {
      setPrice(value);
      setPriceRequired(false);
      setPriceError('');
    }
  };

  const handleMint = async (results?: UploadResults) => {
    if (!membershipId) {
      console.error('No membership ID available');
      setTransactionError('Membership ID not found');
      
      // 更新交易步驟狀態為錯誤
      setSteps(prev => {
        const newSteps = [...prev];
        const transactionStep = newSteps.find(step => step.id === 'transaction');
        if (transactionStep) {
          transactionStep.status = 'error';
        }
        return newSteps;
      });
      
      return;
    }

    const uploadData = results || uploadResults;
    if (!uploadData) {
      console.error('No upload results available');
      setTransactionError('Upload results not found');
      
      // 更新交易步驟狀態為錯誤
      setSteps(prev => {
        const newSteps = [...prev];
        const transactionStep = newSteps.find(step => step.id === 'transaction');
        if (transactionStep) {
          transactionStep.status = 'error';
        }
        return newSteps;
      });
      
      return;
    }

    // 直接使用 uploadResults 中的 blob IDs
    const { imageBlobId, algoBlobId, metadataBlobId } = uploadData;

    console.log('=== Transaction Parameters ===');
    console.log(JSON.stringify({
      artlierState: ARTLIER_STATE_ID,
      membershipId,
      imageBlobId,
      websiteBlobId: metadataBlobId,  // 使用 metadata 的 blobId 作為 website blobId
      algorithmBlobId: algoBlobId,     // 使用 algoBlobId
      clock: '0x6',
      price: parseInt(price)
    }, null, 2));

    if (!imageBlobId || !algoBlobId || !metadataBlobId) {
      const errorMsg = 'Missing blob IDs';
      console.error(errorMsg);
      setTransactionError(errorMsg);
      
      // 更新交易步驟狀態為錯誤
      setSteps(prev => {
        const newSteps = [...prev];
        const transactionStep = newSteps.find(step => step.id === 'transaction');
        if (transactionStep) {
          transactionStep.status = 'error';
        }
        return newSteps;
      });
      
      return;
    }

    try {
      const tx = await createDesignSeries(
        ARTLIER_STATE_ID,
        membershipId,
        imageBlobId,
        metadataBlobId,  // 使用 metadata 的 blobId 作為 website blobId
        algoBlobId,      // 使用 algoBlobId
        '0x6',
        parseInt(price)
      );

      console.log('=== Transaction Object ===');
      console.log(JSON.stringify(tx, null, 2));

      signAndExecuteTransaction(
        {
          transaction: tx as any,
          chain: 'sui:testnet',
        },
        {
          onSuccess: (result) => {
            console.log('=== Transaction Result ===');
            console.log(JSON.stringify(result, null, 2));
            setTransactionDigest(result.digest);
            
            // 更新交易步驟狀態為成功
            setSteps(prev => {
              const newSteps = [...prev];
              const transactionStep = newSteps.find(step => step.id === 'transaction');
              if (transactionStep) {
                transactionStep.status = 'success';
              }
              return newSteps;
            });
          },
          onError: (error) => {
            console.error('=== Transaction Error ===');
            console.error(error);
            setTransactionError(error.message);
            
            // 更新交易步驟狀態為錯誤
            setSteps(prev => {
              const newSteps = [...prev];
              const transactionStep = newSteps.find(step => step.id === 'transaction');
              if (transactionStep) {
                transactionStep.status = 'error';
              }
              return newSteps;
            });
          }
        }
      );
    } catch (error) {
      console.error('=== Error in handleMint ===');
      console.error(error);
      setTransactionError(error instanceof Error ? error.message : String(error));
      
      // 更新交易步驟狀態為錯誤
      setSteps(prev => {
        const newSteps = [...prev];
        const transactionStep = newSteps.find(step => step.id === 'transaction');
        if (transactionStep) {
          transactionStep.status = 'error';
        }
        return newSteps;
      });
    }
  };

  // 修改 handleUpload 函數
  const handleUpload = async (imageFile: File, algoFile: File, metadataFile: File) => {
    try {
      const metadata = createMetadataJson({
        workName,
        description,
        style,
        fontStyle,
        name,
        social,
        intro
      });
      
      await uploadFiles(imageFile, algoFile, metadata);
    } catch (error) {
      console.error('Error in handleUpload:', error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  // Page navigation
  const goToNextPage = () => {
    if (currentPage === 1) {
      let hasError = false;
      
      if (!workName.trim()) {
        setWorkNameRequired(true);
        hasError = true;
      }
      
      if (!description.trim()) {
        setDescriptionRequired(true);
        hasError = true;
      }
      
      if (!price.trim()) {
        setPriceRequired(true);
        setPriceError('Artwork price is required');
        hasError = true;
      } else if (!/^\d+$/.test(price)) {
        setPriceRequired(true);
        setPriceError('Please enter a valid number');
        hasError = true;
      }
      
      if (!intro.trim()) {
        setIntroRequired(true);
        hasError = true;
      }
      
      if (!imageFile) {
        setImageRequired(true);
        hasError = true;
      }

      if (hasError) {
        return;
      }
    }

    if (currentPage === 2 && !algoFile) {
      setAlgoRequired(true);
      return;
    }

    if (currentPage === 3) {
      setCurrentPage(4);
      const metadataFile = createMetadataJson({
        workName,
        description,
        style,
        fontStyle,
        name,
        social,
        intro
      });
      handleUpload(imageFile!, algoFile!, metadataFile);
      return;
    }
    
    if (currentPage < totalPages) {
      setWorkNameRequired(false);
      setDescriptionRequired(false);
      setPriceRequired(false);
      setIntroRequired(false);
      setImageRequired(false);
      setAlgoRequired(false);
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Navigation buttons component
  const NavigationButtons = () => (
    <div className="fixed bottom-6 right-6 flex gap-2 z-20">
      {currentPage > 1 && currentPage < 4 && (
        <button 
          onClick={goToPreviousPage}
          className="group relative w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div className="absolute inset-0 border border-white/10 rotate-45 group-hover:border-white/20 transition-colors" />
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors" />
          <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors">←</span>
        </button>
      )}
      {currentPage < 3 && (
        <button 
          onClick={goToNextPage}
          className="group relative w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div className="absolute inset-0 border border-white/10 rotate-45 group-hover:border-white/20 transition-colors" />
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors" />
          <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors">→</span>
        </button>
      )}
      {currentPage === 3 && (
        <button 
          onClick={goToNextPage}
          className="group relative w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <div className="absolute inset-0 bg-white/5 rounded-sm group-hover:bg-white/10 transition-all duration-300"></div>
          <div className="absolute inset-0 border border-white/20 rotate-45 group-hover:border-white/30 transition-colors"></div>
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors"></div>
          <span className="relative text-sm text-white/80 group-hover:text-white transition-colors">✓</span>
        </button>
      )}
    </div>
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<{
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'success' | 'error';
    subSteps?: {
      id: string;
      label: string;
      status: 'pending' | 'processing' | 'success' | 'error';
    }[];
  }[]>([
    {
      id: 'prepare',
      label: 'PREPARING FILES FOR UPLOAD',
      status: 'pending'
    },
    {
      id: 'upload',
      label: 'UPLOADING FILES TO WALRUS',
      status: 'pending',
      subSteps: [
        {
          id: 'upload-image',
          label: 'IMAGE FILE',
          status: 'pending'
        },
        {
          id: 'upload-algorithm',
          label: 'ALGORITHM FILE',
          status: 'pending'
        },
        {
          id: 'upload-metadata',
          label: 'METADATA FILE',
          status: 'pending'
        }
      ]
    },
    {
      id: 'transaction',
      label: 'EXECUTING MOVE FUNCTION',
      status: 'pending'
    }
  ]);

  return (
    <div className="h-full w-full bg-[rgba(10,10,10,0.3)]">
      {/* Page content */}
      <div className="h-full relative">
        {currentPage === 1 && (
          <BasicInfoPage
            workName={workName}
            description={description}
            price={price}
            name={name}
            social={social}
            intro={intro}
            imageFile={imageFile}
            imageUrl={imageUrl}
            onWorkNameChange={setWorkName}
            onDescriptionChange={setDescription}
            onPriceChange={handlePriceChange}
            onIntroChange={setIntro}
            onImageFileChange={handleImageFileChange}
            workNameRequired={workNameRequired}
            descriptionRequired={descriptionRequired}
            priceRequired={priceRequired}
            introRequired={introRequired}
            imageRequired={imageRequired}
            priceError={priceError}
          />
        )}
        {currentPage === 2 && (
          <AlgorithmPage
            algoFile={algoFile}
            algoResponse={algoResponse}
            algoError={algoError}
            algoRequired={algoRequired}
            showPreview={showPreview}
            previewParams={previewParams}
            extractedParameters={extractedParameters}
            style={style}
            fontStyle={fontStyle}
            onAlgoFileChange={handleAlgoFileChange}
            onParameterChange={handleParameterChange}
            onStyleChange={setStyle}
            onFontStyleChange={setFontStyle}
          />
        )}
        {currentPage === 3 && (
          <PreviewPage
            workName={workName}
            description={description}
            price={price}
            name={name}
            social={social}
            intro={intro}
            imageUrl={imageUrl}
            parameters={extractedParameters}
            previewParams={previewParams}
            onParameterChange={handleParameterChange}
            onMint={goToNextPage}
          />
        )}
        {currentPage === 4 && (
          <UploadStatusPage
            isLoading={isLoading}
            uploadStatus={uploadStatus}
            uploadResults={uploadResults}
            currentStep={currentStep}
            steps={steps}
            workName={workName}
            description={description}
            style={style}
            fontStyle={fontStyle}
            name={name}
            social={social}
            intro={intro}
            price={price}
            transactionDigest={transactionDigest}
            transactionError={transactionError}
          />
        )}
        <NavigationButtons />
      </div>
    </div>
  );
}