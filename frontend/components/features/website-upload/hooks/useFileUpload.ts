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
    setState(prev => ({
      ...prev,
      imageFile: file,
      imageUrl: URL.createObjectURL(file),
    }));
  }, []);

  const handleAlgoFileChange = useCallback((file: File) => {
    setState(prev => ({
      ...prev,
      algoFile: file,
      algoError: '',
    }));
    
    console.log('Algorithm file selected:', file.name, 'size:', file.size);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      console.log('File loaded, content length:', content.length);
      console.log('Content preview:', content.substring(0, 100) + '...');
      setState(prev => ({
        ...prev,
        algoResponse: content,
      }));
    };
    
    reader.onerror = (e) => {
      console.error('Error reading file:', e);
      setState(prev => ({
        ...prev,
        algoError: 'Error reading file',
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