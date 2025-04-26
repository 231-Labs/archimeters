import { useState, useCallback } from 'react';
import type { FileState } from '@/components/features/website-upload/types';

export function useFileUpload() {
  const [state, setState] = useState<FileState>({
    imageFile: null,
    imageUrl: '',
    algoFile: null,
    algoResponse: '',
    algoError: '',
  });

  const handleImageFileChange = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setState(prev => ({
      ...prev,
      imageFile: file,
      imageUrl: url,
    }));
  }, []);

  const handleAlgoFileChange = useCallback((file: File) => {
    setState(prev => ({
      ...prev,
      algoFile: file,
      algoError: '',
    }));
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        console.log('讀取到的檔案內容:', content);
        setState(prev => ({
          ...prev,
          algoResponse: content,
        }));
      } catch (error) {
        console.error('讀取算法檔案時出錯:', error);
        setState(prev => ({
          ...prev,
          algoError: '讀取算法檔案失敗',
        }));
      }
    };
    
    reader.onerror = (error) => {
      console.error('檔案讀取錯誤:', error);
      setState(prev => ({
        ...prev,
        algoError: '檔案讀取錯誤',
      }));
    };
    
    reader.readAsText(file);
  }, []);

  const resetFiles = useCallback(() => {
    if (state.imageUrl) {
      URL.revokeObjectURL(state.imageUrl);
    }
    setState({
      imageFile: null,
      imageUrl: '',
      algoFile: null,
      algoResponse: '',
      algoError: '',
    });
  }, [state.imageUrl]);

  return {
    ...state,
    handleImageFileChange,
    handleAlgoFileChange,
    resetFiles,
  };
} 