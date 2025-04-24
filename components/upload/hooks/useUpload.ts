import { useState } from 'react';
import { UploadStatuses, UploadResults } from '../types';

interface UseUploadProps {
  onSuccess?: (results: UploadResults) => void;
  onError?: (error: string) => void;
}

export const useUpload = ({ onSuccess, onError }: UseUploadProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatuses>('pending');
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);

  const uploadToWalrus = async (file: File): Promise<{ blobId: string }> => {
    const formData = new FormData();
    formData.append('data', file);
    formData.append('epochs', '5');

    const response = await fetch('/api/walrus', {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }

    const result = await response.json();
    const blobId = result?.alreadyCertified?.blobId || null;
    
    if (!blobId) throw new Error('No blobId returned');

    return { blobId };
  };

  const handleUpload = async (imageFile: File, algoFile: File, metadataFile: File) => {
    try {
      setIsLoading(true);
      setError('');
      setUploadStatus('uploading');

      if (!imageFile || !algoFile) {
        throw new Error('Both image and algorithm files are required');
      }

      const [imageResult, algoResult, metadataResult] = await Promise.all([
        uploadToWalrus(imageFile),
        uploadToWalrus(algoFile),
        uploadToWalrus(metadataFile)
      ]);

      setUploadStatus('success');

      const results: UploadResults = {
        imageBlobId: imageResult.blobId,
        algoBlobId: algoResult.blobId,
        metadataBlobId: metadataResult.blobId,
        success: true
      };

      setUploadResults(results);
      onSuccess?.(results);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus('error');
      const errorResults: UploadResults = {
        imageBlobId: '',
        algoBlobId: '',
        metadataBlobId: '',
        success: false,
        error: errorMessage
      };
      setUploadResults(errorResults);
      setError(errorMessage);
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
    handleUpload
  };
}; 