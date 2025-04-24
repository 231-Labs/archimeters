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
        setState(prev => ({
          ...prev,
          algoResponse: content.substring(0, 500),
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          algoError: 'Failed to read algorithm file',
        }));
      }
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