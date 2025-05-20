import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BasicInfoPage } from '@/components/features/design-publisher/components/pages/BasicInfoPage';
import { AlgorithmPage } from '@/components/features/design-publisher/components/pages/AlgorithmPage';
import { PreviewPage } from '@/components/features/design-publisher/components/pages/PreviewPage';
import { UploadStatusPage } from '@/components/features/design-publisher/components/pages/UploadStatusPage';
import { useUpload } from '@/components/features/design-publisher/hooks/useUpload';
import { createMetadataJson } from '@/components/features/design-publisher/utils/metadata';
import { TemplateSeries, FontStyle, UploadResults } from '@/components/features/design-publisher/types';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { createArtlier, ATELIER_STATE_ID, PACKAGE_ID } from '@/utils/transactions';
import { defaultWindowConfigs } from '@/config/windows';

export default function WebsiteUpload() {
  const router = useRouter();

  // State Management Section
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

  // Artwork information
  const [workName, setWorkName] = useState('Parametric Constellation #42');
  const [description, setDescription] = useState('A generative artwork exploring celestial patterns through mathematical algorithms. Parameters can be adjusted to create unique constellations.');
  const [price, setPrice] = useState('1024');

  // Artist information
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

  // Upload hook configuration
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
        // Set current step to transaction step after upload completion
        const transactionStepIndex = 2; // Index of transaction step
        setCurrentStep(transactionStepIndex);
        
        // Update transaction step status to processing
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

  // Transaction states
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [transactionDigest, setTransactionDigest] = useState<string>('');
  const [transactionError, setTransactionError] = useState<string>('');

  // User account states
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [membershipId, setMembershipId] = useState<string>('');
  const [membershipData, setMembershipData] = useState<{
    username: string;
    description: string;
    address: string;
  } | null>(null);

  // User script state
  const [userScript, setUserScript] = useState<{ code: string; filename: string } | null>(null);

  // Update local state when uploadStep or uploadSteps change
  useEffect(() => {
    if (uploadSteps) {
      setCurrentStep(uploadStep);
      setSteps(prev => {
        // Preserve transaction step if exists
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
      // Clear file-related states
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageFile(null);
      setImageUrl('');
      setAlgoFile(null);
      setAlgoResponse('');
      
      // Reset all states
      setCurrentPage(1);
      setError('');
      setTransactionDigest('');
      setTransactionError('');
      resetUpload?.();
      
      // Clear parameter-related states
      setExtractedParameters({});
      setHasExtractedParams(false);
      setPreviewParams({});
      setShowPreview(false);
      
      // Reset validation states
      setWorkNameRequired(false);
      setDescriptionRequired(false);
      setPriceRequired(false);
      setIntroRequired(false);
      setPriceError('');
    };
  }, []);

  // Fetch membership ID only
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
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        setImageRequired(true);
        throw new Error('Only JPG, PNG and GIF formats are supported');
      }

      // Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setImageRequired(true);
        throw new Error(`Image size cannot exceed ${maxSize / 1024 / 1024}MB`);
      }

      const url = URL.createObjectURL(file);
      setImageFile(file);
      setImageUrl(url);
      setImageRequired(false);
    } catch (error) {
      console.error('Image upload error:', error);
      setImageRequired(true);
      setError(error instanceof Error ? error.message : 'Image upload failed');
    }
  };

  const handleAlgoFileChange = (file: File) => {
    try {
      // Validate file type
      const allowedTypes = ['text/javascript', 'application/javascript'];
      if (!allowedTypes.includes(file.type)) {
        setAlgoRequired(true);
        throw new Error('Only JavaScript files are supported');
      }

      // Validate file size
      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        setAlgoRequired(true);
        throw new Error(`Algorithm file size cannot exceed ${maxSize / 1024 / 1024}MB`);
      }

      setAlgoFile(file);
      setHasExtractedParams(false);
      setAlgoError('');
      setAlgoRequired(false);
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          setAlgoResponse(content.substring(0, 500));
          // Set userScript
          setUserScript({
            code: content,
            filename: file.name
          });
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
    } catch (error) {
      console.error('Algorithm file upload error:', error);
      setAlgoRequired(true);
      setAlgoError(error instanceof Error ? error.message : 'Algorithm file upload failed');
    }
  };

  // Algorithm file processing
  const processSceneFile = (code: string) => {
    try {
      // Support multiple parameter definition formats
      const paramPatterns = [
        /(?:export\s+)?const\s+parameters\s*=\s*(\{[\s\S]*?\})\s*;/,    // Object format
        /(?:export\s+)?const\s+parameters\s*=\s*(\[[\s\S]*?\])\s*;/,    // Array format
        /(?:export\s+)?const\s+defaultParameters\s*=\s*(\{[\s\S]*?\})\s*;/, // TestPage format
        /module\.parameters\s*=\s*(\{[\s\S]*?\})\s*;/,                  // CommonJS object format
        /module\.parameters\s*=\s*(\[[\s\S]*?\])\s*;/,                  // CommonJS array format
        /function\s+createGeometry\s*\([^)]*\)\s*\{[\s\S]*?return[^;]*;/  // Extract directly from createGeometry function
      ];

      let extractedCode = '';
      
      // Try all patterns
      for (const pattern of paramPatterns) {
        const match = code.match(pattern);
        if (match) {
          if (pattern.toString().includes('createGeometry')) {
            // Extract parameters from createGeometry function
            const geometryCode = match[0];
            const paramMatches = geometryCode.match(/(\w+):\s*([^,}\s]+)/g);
            if (paramMatches) {
              const paramsObj: Record<string, any> = {};
              paramMatches.forEach(param => {
                const [key, value] = param.split(':').map(s => s.trim());
                if (key && !['new', 'return', 'function'].includes(key)) {
                  paramsObj[key] = {
                    type: 'number',
                    label: key,
                    default: parseFloat(value) || 0,
                    min: 0,
                    max: 100,
                    current: parseFloat(value) || 0
                  };
                }
              });
              extractedCode = JSON.stringify(paramsObj);
              break;
            }
          } else {
            extractedCode = match[1];
            break;
          }
        }
      }

      if (!extractedCode) {
        throw new Error("Failed to extract parameters from code");
      }

      console.log("Found parameters definition:", extractedCode);
      
      // Clean code
      let cleanCode = extractedCode
        .replace(/(\w+):/g, '"$1":')  // Convert key names to strings
        .replace(/'([^']*?)'/g, '"$1"')  // Convert single quotes to double quotes
        .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
        .replace(/\/\/.*/g, '')  // Remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
      
      console.log("Cleaned code:", cleanCode);
      
      let extractedParams: Record<string, any>;
      
      try {
        // Try JSON.parse first
        const parsedParams = JSON.parse(cleanCode);
        
        // Standardize parameter format
        extractedParams = {};
        
        if (Array.isArray(parsedParams)) {
          parsedParams.forEach((param: any, index: number) => {
            const key = param.key || `param${index}`;
            extractedParams[key] = {
              type: param.type || 'number',
              label: param.label || key,
              default: param.default ?? 0,
              min: param.min ?? 0,
              max: param.max ?? 100,
              current: param.default ?? 0
            };
          });
        } else if (typeof parsedParams === 'object' && parsedParams !== null) {
          Object.entries(parsedParams).forEach(([key, param]: [string, any]) => {
            if (typeof param === 'object') {
              extractedParams[key] = {
                type: param.type || 'number',
                label: param.label || key,
                default: param.default ?? param.current ?? 0,
                min: param.min ?? 0,
                max: param.max ?? 100,
                current: param.current ?? param.default ?? 0
              };
            } else {
              // If parameter is a direct value
              extractedParams[key] = {
                type: typeof param === 'string' && param.startsWith('#') ? 'color' : 'number',
                label: key,
                default: param,
                min: 0,
                max: typeof param === 'number' ? param * 2 : 100,
                current: param
              };
            }
          });
        } else {
          throw new Error("Invalid parameters format");
        }
      } catch (parseError) {
        console.error("JSON parsing failed, trying Function:", parseError);
        try {
          // If JSON.parse fails, try using Function
          const func = new Function(`return ${extractedCode}`);
          const funcParams = func();
          
          // Standardize parameter format
          extractedParams = {};
          
          if (Array.isArray(funcParams)) {
            funcParams.forEach((param: any, index: number) => {
              const key = param.key || `param${index}`;
              extractedParams[key] = {
                type: param.type || 'number',
                label: param.label || key,
                default: param.default ?? 0,
                min: param.min ?? 0,
                max: param.max ?? 100,
                current: param.default ?? 0
              };
            });
          } else if (typeof funcParams === 'object' && funcParams !== null) {
            Object.entries(funcParams).forEach(([key, param]: [string, any]) => {
              if (typeof param === 'object') {
                extractedParams[key] = {
                  type: param.type || 'number',
                  label: param.label || key,
                  default: param.default ?? param.current ?? 0,
                  min: param.min ?? 0,
                  max: param.max ?? 100,
                  current: param.current ?? param.default ?? 0
                };
              } else {
                // If parameter is a direct value
                extractedParams[key] = {
                  type: typeof param === 'string' && param.startsWith('#') ? 'color' : 'number',
                  label: key,
                  default: param,
                  min: 0,
                  max: typeof param === 'number' ? param * 2 : 100,
                  current: param
                };
              }
            });
          } else {
            throw new Error("Invalid parameters format");
          }
        } catch (funcError) {
          console.error("Function parsing failed:", funcError);
          throw new Error("Failed to parse parameters");
        }
      }
      
      if (Object.keys(extractedParams).length === 0) {
        throw new Error("No valid parameters found in code");
      }
      
      const initialParams = Object.fromEntries(
        Object.entries(extractedParams).map(([key, value]) => [key, value.default])
      );
      
      setPreviewParams(initialParams);
      setShowPreview(true);
      
      setExtractedParameters(extractedParams);
      setHasExtractedParams(true);
      setAlgoError('');
    } catch (err) {
      console.error("Error processing algorithm file:", err);
      setAlgoError(`Parameter parsing failed: ${err instanceof Error ? err.message : String(err)}`);
      setShowPreview(false);
    }
  };

  // Parameter change handler
  const handleParameterChange = (key: string, value: string | number | Record<string, any>) => {

    // 批量更新
    setPreviewParams((prev) => {
      if (key === 'all' && typeof value === 'object') {
        return { ...value };
      }

      const paramDef = extractedParameters[key];
      if (!paramDef) return;

      let processedValue: any = value;
      if (paramDef.type === 'number') {
        processedValue = value === '' ? '' : Number(value);
        if (typeof processedValue === 'number' && isNaN(processedValue)) return;
      }

      if (prev[key] === processedValue) return prev;
      return { ...prev, [key]: processedValue };
    });
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
      
      // Update transaction step status to error
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
      
      // Update transaction step status to error
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

    // Directly use blob IDs from uploadResults
    const { imageBlobId, algoBlobId, metadataBlobId } = uploadData;

    console.log('=== Transaction Parameters ===');
    console.log(JSON.stringify({
      artlierState: ATELIER_STATE_ID,
      membershipId,
      imageBlobId,
      websiteBlobId: metadataBlobId,  // Use metadata blobId as website blobId
      algorithmBlobId: algoBlobId,     // Use algoBlobId
      clock: '0x6',
      price: parseInt(price)
    }, null, 2));

    if (!imageBlobId || !algoBlobId || !metadataBlobId) {
      const errorMsg = 'Missing blob IDs';
      console.error(errorMsg);
      setTransactionError(errorMsg);
      
      // Update transaction step status to error
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
      const tx = await createArtlier(
        ATELIER_STATE_ID,
        membershipId,
        workName,
        imageBlobId,
        metadataBlobId,  // Use metadata blobId as website blobId
        algoBlobId,      // Use algoBlobId
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
            
            // Update transaction step status to success
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
            
            // Update transaction step status to error
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
      
      // Update transaction step status to error
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

  // Modify handleUpload function
  const handleUpload = async (imageFile: File, algoFile: File, metadataFile: File) => {
    try {
      const metadata = createMetadataJson({
        workName,
        description,
        style,
        fontStyle,
        name,
        address: currentAccount?.address || '',
        intro,
        membershipData: membershipData
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
        address: currentAccount?.address || '',
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
          className="group relative w-10 h-10 flex items-center justify-center bg-transparent backdrop-blur-sm"
        >
          <div className="absolute inset-0 border border-white/10 rotate-45 group-hover:border-white/20 transition-colors" />
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors" />
          <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors">←</span>
        </button>
      )}
      {currentPage < 3 && (
        <button 
          onClick={goToNextPage}
          className="group relative w-10 h-10 flex items-center justify-center bg-transparent backdrop-blur-sm"
        >
          <div className="absolute inset-0 border border-white/10 rotate-45 group-hover:border-white/20 transition-colors" />
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors" />
          <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors">→</span>
        </button>
      )}
      {currentPage === 3 && (
        <button 
          onClick={goToNextPage}
          className="group relative w-10 h-10 flex items-center justify-center bg-transparent backdrop-blur-sm"
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
    <div className="h-full w-full bg-[#1a1a1a]">
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
            onMembershipDataChange={setMembershipData}
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
            onFileChange={handleAlgoFileChange}
            onUpdatePreviewParams={(params) => setPreviewParams(params)}
            onStyleChange={setStyle}
            onFontStyleChange={setFontStyle}
            onExtractParameters={setExtractedParameters}
            onTogglePreview={() => setShowPreview(!showPreview)}
            onNext={goToNextPage}
            onPrevious={goToPreviousPage}
            userScript={userScript}
            onUserScriptChange={setUserScript}
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
            userScript={userScript}
            membershipData={membershipData}
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
            onSubmit={() => handleMint()}
            onPrevious={goToPreviousPage}
          />
        )}
        <NavigationButtons />
      </div>
    </div>
  );
}