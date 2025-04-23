import { useState } from 'react';
import { UploadStatuses, UploadResults } from '../types';

interface UseUploadProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export const useUpload = ({ onSuccess, onError }: UseUploadProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatuses>({
    image: 'pending',
    algo: 'pending',
    metadata: 'pending'
  });
  const [uploadResults, setUploadResults] = useState<UploadResults>(null);

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

      if (!imageFile || !algoFile) {
        throw new Error('Both image and algorithm files are required');
      }

      setUploadStatus({
        image: 'uploading',
        algo: 'uploading',
        metadata: 'uploading'
      });

      const [imageResult, algoResult, metadataResult] = await Promise.all([
        uploadToWalrus(imageFile).then(result => {
          setUploadStatus(prev => ({ ...prev, image: 'success' }));
          return result;
        }).catch(error => {
          setUploadStatus(prev => ({ ...prev, image: 'error' }));
          throw error;
        }),
        uploadToWalrus(algoFile).then(result => {
          setUploadStatus(prev => ({ ...prev, algo: 'success' }));
          return result;
        }).catch(error => {
          setUploadStatus(prev => ({ ...prev, algo: 'error' }));
          throw error;
        }),
        uploadToWalrus(metadataFile).then(result => {
          setUploadStatus(prev => ({ ...prev, metadata: 'success' }));
          return result;
        }).catch(error => {
          setUploadStatus(prev => ({ ...prev, metadata: 'error' }));
          throw error;
        })
      ]);

      const results = {
        imageBlobId: imageResult.blobId,
        algoBlobId: algoResult.blobId,
        metadataBlobId: metadataResult.blobId,
        success: true
      };

      setUploadResults(results);
      onSuccess?.();
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadResults({
        imageBlobId: '',
        algoBlobId: '',
        metadataBlobId: '',
        success: false,
        error: errorMessage
      });
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