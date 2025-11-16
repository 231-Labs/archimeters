import { useState, useCallback, useEffect } from 'react';
import { useArtworkForm } from './useArtworkForm';
import { useParameters } from './useParameters';
import { useValidation } from './useValidation';
import { useFileUpload } from './useFileUpload';
import { useMembership } from './useMembership';
import { useTransaction } from './useTransaction';
import { useUpload } from './useUpload';
import { useKiosk } from '../../entry/hooks';
import { createMetadataJson } from '../utils/metadata';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { analyzeScript, getRecommendationMessage, type ScriptAnalysis } from '../utils/scriptDetection';
import type { UploadResults } from '../types';

export function useDesignPublisherForm() {
  const currentAccount = useCurrentAccount();
  
  // Script analysis state
  const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysis | null>(null);
  
  // Form state management
  const { artworkInfo, artistInfo, designSettings, updateArtworkInfo, updateArtistInfo, updateDesignSettings } = useArtworkForm();
  
  // Parameter management
  const {
    extractedParameters,
    previewParams,
    showPreview,
    processSceneFile,
    updateParameter,
    togglePreview,
    resetParameters,
    exportParameterRules,
  } = useParameters();
  
  // Validation
  const { validationState, validatePrice, validateForm, resetValidation } = useValidation();
  
  // File management
  const {
    imageFile,
    imageUrl,
    algoFile,
    algoResponse,
    algoError,
    userScript,
    handleImageFileChange: baseHandleImageFileChange,
    handleAlgoFileChange: baseHandleAlgoFileChange,
    resetFiles,
    setUserScript,
  } = useFileUpload();
  
  // Membership
  const { membershipId, membershipData, setMembershipData } = useMembership();
  
  // Kiosk management
  const { selectedKiosk, kiosks } = useKiosk();
  
  // Upload step management
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

  // Transaction management with callbacks
  const handleTransactionSuccess = useCallback((digest: string) => {
    setSteps(prev => {
      const newSteps = [...prev];
      const transactionStep = newSteps.find(step => step.id === 'transaction');
      if (transactionStep) {
        transactionStep.status = 'success';
      }
      return newSteps;
    });
  }, []);

  const handleTransactionError = useCallback((error: string) => {
    setSteps(prev => {
      const newSteps = [...prev];
      const transactionStep = newSteps.find(step => step.id === 'transaction');
      if (transactionStep) {
        transactionStep.status = 'error';
      }
      return newSteps;
    });
  }, []);

  const {
    transactionDigest,
    transactionError,
    isProcessing: isTransactionProcessing,
    handleMint,
    resetTransaction,
  } = useTransaction({
    membershipId,
    kioskId: selectedKiosk?.kioskId || '',
    kioskCapId: selectedKiosk?.kioskCapId || '',
    workName: artworkInfo.workName,
    price: artworkInfo.price,
    parameterRules: exportParameterRules(),
    onSuccess: handleTransactionSuccess,
    onError: handleTransactionError,
  });

  // Upload management
  const {
    isLoading: isUploading,
    uploadStatus,
    uploadResults,
    currentStep: uploadStep,
    steps: uploadSteps,
    handleUpload: uploadFiles,
    resetUpload,
  } = useUpload({
    onSuccess: (results) => {
      console.log('Upload completed with results:', results);
      if (results.success) {
        const transactionStepIndex = 2;
        setCurrentStep(transactionStepIndex);
        
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
    onError: (error) => console.error('Upload error:', error)
  });

  // Update local steps when uploadSteps change
  useEffect(() => {
    if (uploadSteps) {
      setCurrentStep(uploadStep);
      setSteps(prev => {
        const transactionStep = prev.find(step => step.id === 'transaction');
        const newSteps = [...uploadSteps];
        
        if (transactionStep && !newSteps.find(step => step.id === 'transaction')) {
          newSteps.push(transactionStep);
        }
        
        return newSteps;
      });
    }
  }, [uploadStep, uploadSteps]);

  // Sync membershipData to artist info
  useEffect(() => {
    if (membershipData) {
      if (membershipData.username && !artistInfo.name) {
        updateArtistInfo('name', membershipData.username);
      }
      if (membershipData.description && !artistInfo.intro) {
        updateArtistInfo('intro', membershipData.description);
      }
      if (membershipData.address && !artistInfo.social) {
        updateArtistInfo('social', membershipData.address);
      }
    }
  }, [membershipData, artistInfo.name, artistInfo.intro, artistInfo.social, updateArtistInfo]);

  // Enhanced file change handlers
  const handleImageFileChange = useCallback((file: File) => {
    try {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPG, PNG and GIF formats are supported');
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`Image size cannot exceed ${maxSize / 1024 / 1024}MB`);
      }

      baseHandleImageFileChange(file);
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }, [baseHandleImageFileChange]);

  const handleAlgoFileChange = useCallback((file: File) => {
    try {
      const allowedTypes = ['text/javascript', 'application/javascript'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JavaScript files are supported');
      }

      const maxSize = 1 * 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        throw new Error(`Algorithm file size cannot exceed ${maxSize / 1024 / 1024}MB`);
      }

      baseHandleAlgoFileChange(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          
          // Process scene file for parameters
          processSceneFile(content);
          
          // Analyze script to detect artwork type (3D printable vs 2D/animated)
          const analysis = analyzeScript(content);
          setScriptAnalysis(analysis);
          
          // Auto-update isPrintable based on analysis (only if high confidence)
          if (analysis.confidence === 'high') {
            updateArtworkInfo('isPrintable', analysis.isPrintable);
            console.log('Auto-detected artwork type:', analysis.recommendedMode);
          }
        } catch (error) {
          console.error('Error processing algorithm file:', error);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Algorithm file upload error:', error);
      throw error;
    }
  }, [baseHandleAlgoFileChange, processSceneFile, updateArtworkInfo]);

  // Price handler with validation - supports decimals and zero
  const handlePriceChange = useCallback((value: string) => {
    // Allow empty, numbers, and decimal point (e.g., "0", "1.5", ".5", "10.99")
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      updateArtworkInfo('price', value);
      validatePrice(value);
    }
  }, [updateArtworkInfo, validatePrice]);

  // Parameter change handler
  const handleParameterChange = useCallback((key: string, value: string | number | Record<string, any>) => {
    if (key === 'all' && typeof value === 'object') {
      // Batch update for all parameters
      Object.entries(value).forEach(([k, v]) => {
        updateParameter(k, v);
      });
    } else {
      updateParameter(key, value);
    }
  }, [updateParameter]);

  // Publish handler - validates and starts upload process
  const handlePublish = useCallback(() => {
    // Validate all required fields
    const isValid = validateForm({
      workName: artworkInfo.workName,
      description: artworkInfo.description,
      price: artworkInfo.price,
      intro: artistInfo.intro,
      imageFile,
      algoFile,
    });
    
    if (!isValid) return false;

    // Create metadata and start upload
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
    
    if (imageFile && algoFile) {
      uploadFiles(imageFile, algoFile, metadata);
      return true;
    }
    
    return false;
  }, [
    validateForm,
    artworkInfo,
    artistInfo,
    imageFile,
    algoFile,
    designSettings,
    currentAccount,
    membershipData,
    extractedParameters,
    uploadFiles,
  ]);

  // Reset all state
  const resetAll = useCallback(() => {
    resetFiles();
    resetParameters();
    resetValidation();
    resetTransaction();
    resetUpload?.();
    setCurrentStep(0);
    setSteps([
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
  }, [resetFiles, resetParameters, resetValidation, resetTransaction, resetUpload]);

  return {
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
    togglePreview,
    exportParameterRules,
    
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
    
    // Script Analysis
    scriptAnalysis,
    
    // Membership
    membershipId,
    membershipData,
    setMembershipData,
    
    // Upload & Transaction
    isUploading,
    uploadStatus,
    uploadResults,
    currentStep,
    steps,
    transactionDigest,
    transactionError,
    isTransactionProcessing,
    handlePublish,
    uploadFiles,
    
    // Reset
    resetAll,
  };
}

