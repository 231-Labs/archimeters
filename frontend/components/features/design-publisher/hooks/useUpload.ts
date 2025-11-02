import { useState, useRef, useEffect } from 'react';
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

// 更詳細的上傳狀態類型
interface FileUploadState {
  blobId: string | null;
  status: 'pending' | 'processing' | 'success' | 'error';
  startTime: number | null;
  endTime: number | null;
}

interface UploadState {
  image: FileUploadState;
  algorithm: FileUploadState;
  metadata: FileUploadState;
}

export const useUpload = ({ onSuccess, onError }: UseUploadProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<UploadStatuses>('pending');
  const [uploadResults, setUploadResults] = useState<UploadResults | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  // 使用 ref 來跟踪上傳狀態，避免狀態更新的異步問題
  const uploadStateRef = useRef<UploadState>({
    image: { blobId: null, status: 'pending', startTime: null, endTime: null },
    algorithm: { blobId: null, status: 'pending', startTime: null, endTime: null },
    metadata: { blobId: null, status: 'pending', startTime: null, endTime: null }
  });

  // 用於存儲計時器 ID 的 ref
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  // 定義初始步驟
  const [steps, setSteps] = useState<UploadStep[]>([
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

  // 直接更新特定子步驟的狀態
  const updateSubStepStatus = (
    fileType: 'image' | 'algorithm' | 'metadata', 
    status: 'pending' | 'processing' | 'success' | 'error'
  ) => {
    // 避免重複更新相同狀態
    const uploadStep = steps.find(step => step.id === 'upload');
    if (uploadStep && uploadStep.subSteps) {
      const subStepId = `upload-${fileType}`;
      const subStep = uploadStep.subSteps.find(subStep => subStep.id === subStepId);
      if (subStep && subStep.status === status) {
        return;
      }
    }

    console.log(`[${fileType}] 直接更新子步驟狀態為 ${status}`);
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      const uploadStep = newSteps.find(step => step.id === 'upload');
      if (uploadStep && uploadStep.subSteps) {
        const subStepId = `upload-${fileType}`;
        const subStepIndex = uploadStep.subSteps.findIndex(subStep => subStep.id === subStepId);
        if (subStepIndex !== -1) {
          uploadStep.subSteps[subStepIndex] = { 
            ...uploadStep.subSteps[subStepIndex], 
            status 
          };
        }
      }
      return newSteps;
    });
  };

  // 使用 effect 來同步 uploadStateRef 和 steps
  useEffect(() => {
    if (!isLoading) return;

    const updateStepsFromState = () => {
      // 檢查是否有需要更新的子步驟
      let needsUpdate = false;
      
      steps.forEach(step => {
        if (step.id === 'upload' && step.subSteps) {
          // 檢查父步驟狀態是否需要更新
          const allSubStepsComplete = step.subSteps.every(
            subStep => subStep.status === 'success'
          );
          
          if (allSubStepsComplete && step.status !== 'success') {
            needsUpdate = true;
          } else if (step.subSteps.some(subStep => subStep.status === 'error') && step.status !== 'error') {
            needsUpdate = true;
          } else if (step.subSteps.some(subStep => subStep.status === 'processing') && step.status !== 'processing') {
            needsUpdate = true;
          }
          
          // 檢查子步驟狀態是否需要更新
          step.subSteps.forEach(subStep => {
            if (subStep.id === 'upload-image' && subStep.status !== uploadStateRef.current.image.status) {
              needsUpdate = true;
            } else if (subStep.id === 'upload-algorithm' && subStep.status !== uploadStateRef.current.algorithm.status) {
              needsUpdate = true;
            } else if (subStep.id === 'upload-metadata' && subStep.status !== uploadStateRef.current.metadata.status) {
              needsUpdate = true;
            }
          });
        }
      });
      
      // 如果沒有需要更新的項目，則跳過
      if (!needsUpdate) return;
      
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        const uploadStep = newSteps.find(step => step.id === 'upload');
        
        if (uploadStep && uploadStep.subSteps) {
          // 更新子步驟狀態
          uploadStep.subSteps = uploadStep.subSteps.map(subStep => {
            if (subStep.id === 'upload-image') {
              return { ...subStep, status: uploadStateRef.current.image.status };
            } else if (subStep.id === 'upload-algorithm') {
              return { ...subStep, status: uploadStateRef.current.algorithm.status };
            } else if (subStep.id === 'upload-metadata') {
              return { ...subStep, status: uploadStateRef.current.metadata.status };
            }
            return subStep;
          });

          // 檢查所有子步驟的狀態來更新父步驟狀態
          const allSubStepsComplete = uploadStep.subSteps.every(
            subStep => subStep.status === 'success'
          );
          
          // 明確設置父步驟狀態，並在狀態變化時記錄日誌
          if (allSubStepsComplete && uploadStep.status !== 'success') {
            console.log('所有子步驟完成，更新父步驟狀態為 success');
            uploadStep.status = 'success';
          } else if (uploadStep.subSteps.some(subStep => subStep.status === 'error') && uploadStep.status !== 'error') {
            console.log('存在錯誤子步驟，更新父步驟狀態為 error');
            uploadStep.status = 'error';
          } else if (uploadStep.subSteps.some(subStep => subStep.status === 'processing') && uploadStep.status !== 'processing') {
            console.log('存在處理中子步驟，更新父步驟狀態為 processing');
            uploadStep.status = 'processing';
          }
        }
        
        return newSteps;
      });
    };

    // 立即更新一次，確保初始狀態正確
    updateStepsFromState();
    
    // 然後定期更新，確保 UI 保持同步（降低頻率以減少渲染次數）
    // 保存計時器 ID 到 ref
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
    }
    
    const intervalId = setInterval(updateStepsFromState, 200);
    timerIdRef.current = intervalId;
    
    return () => {
      if (timerIdRef.current) {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
      }
    };
  }, [isLoading, steps]);

  const resetUpload = () => {
    console.log('完全重置上傳狀態...');
    setIsLoading(false);
    setError('');
    setUploadStatus('pending');
    setUploadResults(null);
    setCurrentStep(0);
    
    // 重置上傳狀態
    uploadStateRef.current = {
      image: { blobId: null, status: 'pending', startTime: null, endTime: null },
      algorithm: { blobId: null, status: 'pending', startTime: null, endTime: null },
      metadata: { blobId: null, status: 'pending', startTime: null, endTime: null }
    };
    
    // 確保所有步驟狀態被重置
    setSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      subSteps: step.subSteps?.map(subStep => ({
        ...subStep,
        status: 'pending'
      }))
    })));

    // 清除任何可能的計時器
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
  };

  // 檢查所有文件是否已上傳完成
  const checkAllUploadsCompleted = () => {
    if (
      uploadStateRef.current.image.status === 'success' &&
      uploadStateRef.current.algorithm.status === 'success' &&
      uploadStateRef.current.metadata.status === 'success'
    ) {
      // 更新 upload 步驟狀態為成功
      setSteps(prevSteps => {
        return prevSteps.map(step => {
          if (step.id === 'upload') {
            return { ...step, status: 'success' };
          }
          return step;
        });
      });
      return true;
    }
    return false;
  };

  // 單個文件上傳函數
  const uploadToWalrus = async (file: File, fileType: 'image' | 'algorithm' | 'metadata'): Promise<string> => {
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    while (retryCount < maxRetries) {
      try {
        // 驗證文件類型
        if (!file || !(file instanceof File)) {
          throw new Error('無效的文件');
        }

        // 驗證文件大小
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          throw new Error(`文件大小超過限制 (${maxSize / 1024 / 1024}MB)`);
        }

        // 驗證文件類型
        const allowedTypes = {
          image: ['image/jpeg', 'image/png', 'image/gif'],
          algorithm: ['text/javascript', 'application/javascript'],
          metadata: ['application/json']
        };

        if (!allowedTypes[fileType].includes(file.type)) {
          throw new Error(`不支持的文件類型: ${file.type}`);
        }

        // 發送請求前，立即將狀態設為處理中
        console.log(`[${fileType}] 即將發送請求，更新狀態為 processing (嘗試 ${retryCount + 1}/${maxRetries})`);
        
        // 首先更新 ref，以便效果器能夠捕獲這個改變
        uploadStateRef.current[fileType].status = 'processing';
        uploadStateRef.current[fileType].startTime = Date.now();
        
        // 然後立即更新 UI
        updateSubStepStatus(fileType, 'processing');
        
        const formData = new FormData();
        formData.append('data', file);
        formData.append('epochs', '50');

        console.log(`[${fileType}] 開始發送請求...`);
        
        const response = await fetch('/api/walrus', {
          method: 'PUT',
          body: formData,
        });

        console.log(`[${fileType}] 收到請求回應，狀態: ${response.status}`);
        
        if (!response.ok) {
          // 如果是 500 錯誤，可能是暫時性的，我們會重試
          if (response.status === 500) {
            console.log(`[${fileType}] 收到 500 錯誤，準備重試...`);
            lastError = new Error(`HTTP error: ${response.status}`);
            retryCount++;
            // 等待一段時間後重試
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            continue;
          }
          
          // 其他錯誤直接拋出
          console.error(`[${fileType}] 錯誤回應: ${response.status}`);
          uploadStateRef.current[fileType].status = 'error';
          updateSubStepStatus(fileType, 'error');
          throw new Error(`HTTP error: ${response.status}`);
        }

        console.log(`[${fileType}] 回應正常，解析中...`);
        const responseText = await response.text();
        
        let result;
        try {
          result = JSON.parse(responseText);
          console.log(`[${fileType}] JSON 解析成功`);
        } catch (err) {
          console.error(`[${fileType}] JSON 解析失敗:`, err);
          uploadStateRef.current[fileType].status = 'error';
          updateSubStepStatus(fileType, 'error');
          throw new Error('Failed to parse response JSON');
        }
        
        let blobId = null;
        if (result?.alreadyCertified?.blobId) {
          blobId = result.alreadyCertified.blobId;
          console.log(`[${fileType}] 回應內容: ${JSON.stringify(result).substring(0, 100)}...`);
        } else if (result?.newlyCreated?.blobObject?.blobId) {
          blobId = result.newlyCreated.blobObject.blobId;
          console.log(`[${fileType}] 回應內容: ${JSON.stringify(result).substring(0, 100)}...`);
        }
        
        if (!blobId || typeof blobId !== 'string' || blobId.trim() === '') {
          console.error(`[${fileType}] 未獲取到有效的 blobId`);
          uploadStateRef.current[fileType].status = 'error';
          updateSubStepStatus(fileType, 'error');
          throw new Error('No valid blobId returned');
        }

        console.log(`[${fileType}] 文件已認證，blobId: "${blobId}"`);
        console.log(`[${fileType}] 成功獲取有效的 blobId: "${blobId}"`);
        
        // 延遲更新狀態以便 UI 顯示
        console.log(`[${fileType}] 等待更新狀態...`);
        await new Promise(resolve => setTimeout(resolve, 800)); // 略微延長時間，讓用戶有更好的視覺體驗
        
        console.log(`[${fileType}] 更新狀態為 success`);
        uploadStateRef.current[fileType].blobId = blobId;
        uploadStateRef.current[fileType].status = 'success';
        uploadStateRef.current[fileType].endTime = Date.now();
        updateSubStepStatus(fileType, 'success');
        
        return blobId;
      } catch (error: any) {
        console.error(`[${fileType}] 錯誤:`, error);
        
        // 如果是網絡錯誤或 500 錯誤，且還有重試次數，則繼續重試
        if ((error.message.includes('Failed to fetch') || error.message.includes('HTTP error: 500')) && retryCount < maxRetries - 1) {
          console.log(`[${fileType}] 準備重試... (${retryCount + 1}/${maxRetries})`);
          lastError = error;
          retryCount++;
          // 等待一段時間後重試
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          continue;
        }
        
        // 如果重試次數用完或不是可重試的錯誤，則標記為錯誤
        uploadStateRef.current[fileType].status = 'error';
        updateSubStepStatus(fileType, 'error');
        throw lastError || error;
      }
    }

    // 如果所有重試都失敗了
    throw lastError || new Error('上傳失敗，已達到最大重試次數');
  };

  const handleUpload = async (imageFile: File, algoFile: File, metadataFile: File) => {
    try {
      // 首先確保狀態完全重置
      resetUpload();
      
      setIsLoading(true);
      setError('');
      setUploadStatus('uploading');
      
      // 準備階段
      setCurrentStep(0);
      setSteps(prev => 
        prev.map(step => 
          step.id === 'prepare' 
            ? { ...step, status: 'processing' } 
            : step
        )
      );
      
      console.log('準備檔案上傳...');
      if (!imageFile || !algoFile || !metadataFile) {
        throw new Error('所有檔案都必須提供');
      }
      
      // 標記準備階段為成功
      setSteps(prev => 
        prev.map(step => 
          step.id === 'prepare' 
            ? { ...step, status: 'success' } 
            : step
        )
      );
      
      // 上傳階段
      setCurrentStep(1);
      setSteps(prev => 
        prev.map(step => 
          step.id === 'upload' 
            ? { ...step, status: 'processing' } 
            : step
        )
      );
      
      console.log('開始並行上傳檔案...');
      
      // 並行上傳文件
      const [imageBlobId, algoBlobId, metadataBlobId] = await Promise.all([
        uploadToWalrus(imageFile, 'image').catch(error => {
          console.error('圖片上傳失敗:', error);
          throw new Error(`圖片上傳失敗: ${error.message}`);
        }),
        uploadToWalrus(algoFile, 'algorithm').catch(error => {
          console.error('演算法上傳失敗:', error);
          throw new Error(`演算法上傳失敗: ${error.message}`);
        }),
        uploadToWalrus(metadataFile, 'metadata').catch(error => {
          console.error('元數據上傳失敗:', error);
          throw new Error(`元數據上傳失敗: ${error.message}`);
        })
      ]);
      
      console.log('所有上傳成功完成!');
      console.log('BlobIds:', { imageBlobId, algoBlobId, metadataBlobId });
      
      // 確保父步驟狀態被更新為成功
      checkAllUploadsCompleted();
      
      // 更新上傳結果
      const results: UploadResults = {
        imageBlobId,
        algoBlobId,
        metadataBlobId,
        success: true
      };
      
      setUploadResults(results);
      setUploadStatus('success');
      
      // 顯示最終上傳狀態和時間
      const imageDuration = uploadStateRef.current.image.endTime && uploadStateRef.current.image.startTime 
        ? (uploadStateRef.current.image.endTime - uploadStateRef.current.image.startTime) / 1000
        : null;
      const algoDuration = uploadStateRef.current.algorithm.endTime && uploadStateRef.current.algorithm.startTime 
        ? (uploadStateRef.current.algorithm.endTime - uploadStateRef.current.algorithm.startTime) / 1000
        : null;
      const metadataDuration = uploadStateRef.current.metadata.endTime && uploadStateRef.current.metadata.startTime 
        ? (uploadStateRef.current.metadata.endTime - uploadStateRef.current.metadata.startTime) / 1000
        : null;
      
      console.log('上傳時間統計:');
      if (imageDuration) console.log(`圖片: ${imageDuration.toFixed(2)}秒`);
      if (algoDuration) console.log(`演算法: ${algoDuration.toFixed(2)}秒`);
      if (metadataDuration) console.log(`元數據: ${metadataDuration.toFixed(2)}秒`);
      
      // 進入交易階段
      setCurrentStep(2);
      
      onSuccess?.(results);
    } catch (error: any) {
      console.error('上傳失敗:', error);
      const errorMessage = error instanceof Error ? error.message : '上傳失敗';
      
      // 確保所有狀態被正確標記為錯誤
      updateAllPendingToError();
      
      setError(errorMessage);
      setUploadStatus('error');
      
      const errorResults: UploadResults = {
        imageBlobId: uploadStateRef.current.image.blobId || '',
        algoBlobId: uploadStateRef.current.algorithm.blobId || '',
        metadataBlobId: uploadStateRef.current.metadata.blobId || '',
        success: false,
        error: errorMessage
      };
      
      setUploadResults(errorResults);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // 輔助函數：將所有處於 pending 狀態的步驟標記為錯誤
  const updateAllPendingToError = () => {
    // 更新 uploadStateRef
    if (uploadStateRef.current.image.status === 'pending' || uploadStateRef.current.image.status === 'processing') {
      uploadStateRef.current.image.status = 'error';
    }
    if (uploadStateRef.current.algorithm.status === 'pending' || uploadStateRef.current.algorithm.status === 'processing') {
      uploadStateRef.current.algorithm.status = 'error';
    }
    if (uploadStateRef.current.metadata.status === 'pending' || uploadStateRef.current.metadata.status === 'processing') {
      uploadStateRef.current.metadata.status = 'error';
    }
    
    // 更新 steps 狀態
    setSteps(prev => {
      const newSteps = [...prev];
      
      // 更新主要步驟
      newSteps.forEach(step => {
        if (step.status === 'pending' || step.status === 'processing') {
          step.status = 'error';
        }
        
        // 更新子步驟
        if (step.subSteps) {
          step.subSteps.forEach(subStep => {
            if (subStep.status === 'pending' || subStep.status === 'processing') {
              subStep.status = 'error';
            }
          });
        }
      });
      
      return newSteps;
    });
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