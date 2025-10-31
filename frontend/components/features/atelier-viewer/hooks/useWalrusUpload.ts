import { useState } from 'react';
import { UploadStatus, UploadResult } from '../types';

export const useWalrusUpload = () => {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const uploadToWalrus = async (file: File, fileType: string): Promise<string> => {
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        setUploadStatus('uploading');
        setUploadProgress(`Uploading ${fileType}...`);

        const formData = new FormData();
        formData.append('data', file);
        formData.append('epochs', '50');

        const response = await fetch('/api/walrus', {
          method: 'PUT',
          body: formData,
        });

        if (!response.ok) {
          if (response.status === 500) {
            lastError = new Error(`HTTP error: ${response.status}`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            continue;
          }
          throw new Error(`HTTP error: ${response.status}`);
        }

        const responseText = await response.text();
        let result;
        
        try {
          result = JSON.parse(responseText);
        } catch (err) {
          throw new Error('Failed to parse response');
        }

        let blobId = result?.alreadyCertified?.blobId || result?.newlyCreated?.blobObject?.blobId;
        
        if (!blobId || typeof blobId !== 'string' || blobId.trim() === '') {
          throw new Error('No valid blob ID returned');
        }

        await new Promise(resolve => setTimeout(resolve, 800));

        setUploadStatus('success');
        setUploadProgress(`${fileType} uploaded successfully!`);
        return blobId;

      } catch (error: any) {
        if ((error.message.includes('Failed to fetch') || error.message.includes('HTTP error: 500')) && retryCount < maxRetries - 1) {
          lastError = error;
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          continue;
        }
        
        setUploadStatus('error');
        setUploadProgress(`Failed to upload ${fileType}`);
        throw lastError || error;
      }
    }

    throw lastError || new Error('Upload failed after maximum retries');
  };

  const resetUploadStatus = () => {
    setUploadStatus('idle');
    setUploadProgress('');
  };

  return {
    uploadStatus,
    uploadProgress,
    uploadToWalrus,
    resetUploadStatus,
  };
};

