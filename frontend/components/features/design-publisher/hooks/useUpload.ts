import { useState } from 'react';
import { UploadStatuses, UploadResults } from '../types';

interface UseUploadProps {
  onSuccess?: (results: UploadResults) => void;
  onError?: (error: string) => void;
}

interface UploadStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  subSteps?: {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'success' | 'error';
  }[];
}

const INITIAL_STEPS: UploadStep[] = [
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
      { id: 'upload-image', label: 'IMAGE FILE', status: 'pending' },
      { id: 'upload-algorithm', label: 'ALGORITHM FILE', status: 'pending' },
      { id: 'upload-metadata', label: 'METADATA FILE', status: 'pending' }
    ]
  },
  {
    id: 'transaction',
    label: 'EXECUTING MOVE FUNCTION',
    status: 'pending'
  }
];

export const useUpload = ({ onSuccess, onError }: UseUploadProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatuses>('pending');
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<UploadStep[]>(INITIAL_STEPS);

  const updateStepStatus = (
    stepId: string,
    status: 'pending' | 'processing' | 'success' | 'error',
    subStepId?: string
  ) => {
    setSteps(prev => prev.map(step => {
      if (step.id !== stepId) return step;
      
      if (subStepId && step.subSteps) {
        const updatedSubSteps = step.subSteps.map(sub =>
          sub.id === subStepId ? { ...sub, status } : sub
        );
        
        const allSuccess = updatedSubSteps.every(sub => sub.status === 'success');
        const hasError = updatedSubSteps.some(sub => sub.status === 'error');
        const hasProcessing = updatedSubSteps.some(sub => sub.status === 'processing');
        
        const parentStatus = allSuccess ? 'success' : hasError ? 'error' : hasProcessing ? 'processing' : step.status;
        
        return { ...step, status: parentStatus, subSteps: updatedSubSteps };
      }
      
      return { ...step, status };
    }));
  };

  const resetUpload = () => {
    setIsLoading(false);
    setError('');
    setUploadStatus('pending');
    setUploadResults(null);
    setCurrentStep(0);
    setSteps(INITIAL_STEPS);
  };

  const uploadToWalrus = async (file: File, fileType: 'image' | 'algorithm' | 'metadata'): Promise<string> => {
    const MAX_RETRIES = 3;
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = {
      image: ['image/jpeg', 'image/png', 'image/gif'],
      algorithm: ['text/javascript', 'application/javascript'],
      metadata: ['application/json']
    };

    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file');
    }

    if (file.size > MAX_SIZE) {
      throw new Error(`File size exceeds limit (${MAX_SIZE / 1024 / 1024}MB)`);
    }

    if (!ALLOWED_TYPES[fileType].includes(file.type)) {
      throw new Error(`Unsupported file type: ${file.type}`);
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        updateStepStatus('upload', 'processing', `upload-${fileType}`);
        
        const formData = new FormData();
        formData.append('data', file);
        formData.append('epochs', '50');

        const response = await fetch('/api/walrus', {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 500 && attempt < MAX_RETRIES - 1) {
            lastError = new Error(`HTTP error: ${response.status}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            continue;
          }
          throw new Error(`HTTP error: ${response.status}`);
        }

        const result = await response.json();
        const blobId = result?.alreadyCertified?.blobId || result?.newlyCreated?.blobObject?.blobId;
        
        if (!blobId || typeof blobId !== 'string' || !blobId.trim()) {
          throw new Error('No valid blobId returned');
        }

        await new Promise(resolve => setTimeout(resolve, 800));
        updateStepStatus('upload', 'success', `upload-${fileType}`);
        
        return blobId;
      } catch (error: any) {
        lastError = error;
        
        const isRetryable = error.message.includes('Failed to fetch') || error.message.includes('HTTP error: 500');
        if (isRetryable && attempt < MAX_RETRIES - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        updateStepStatus('upload', 'error', `upload-${fileType}`);
        throw error;
      }
    }

    throw lastError || new Error('Upload failed after maximum retries');
  };

  const markIncompleteAsError = () => {
    setSteps(prev => prev.map(step => ({
      ...step,
      status: step.status === 'success' ? step.status : 'error',
      subSteps: step.subSteps?.map(sub => ({
        ...sub,
        status: sub.status === 'success' ? sub.status : 'error'
      }))
    })));
  };

  const handleUpload = async (imageFile: File, algoFile: File, metadataFile: File) => {
    try {
      resetUpload();
      setIsLoading(true);
      setError('');
      setUploadStatus('uploading');
      
      if (!imageFile || !algoFile || !metadataFile) {
        throw new Error('All files must be provided');
      }
      
      setCurrentStep(0);
      updateStepStatus('prepare', 'processing');
      updateStepStatus('prepare', 'success');
      
      setCurrentStep(1);
      updateStepStatus('upload', 'processing');
      
      const [imageBlobId, algoBlobId, metadataBlobId] = await Promise.all([
        uploadToWalrus(imageFile, 'image'),
        uploadToWalrus(algoFile, 'algorithm'),
        uploadToWalrus(metadataFile, 'metadata')
      ]);
      
      const results: UploadResults = {
        imageBlobId,
        algoBlobId,
        metadataBlobId,
        success: true
      };
      
      setUploadResults(results);
      setUploadStatus('success');
      setCurrentStep(2);
      
      onSuccess?.(results);
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      markIncompleteAsError();
      setError(errorMessage);
      setUploadStatus('error');
      
      const errorResults: UploadResults = {
        imageBlobId: '',
        algoBlobId: '',
        metadataBlobId: '',
        success: false,
        error: errorMessage
      };
      
      setUploadResults(errorResults);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    uploadStatus,
    uploadResults,
    currentStep,
    steps,
    handleUpload,
    resetUpload
  };
}; 