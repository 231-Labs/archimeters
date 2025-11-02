import { useState, useCallback } from 'react';

interface FileState {
  imageFile: File | null;
  imageUrl: string;
  algoFile: File | null;
  algoResponse: string;
  algoError: string;
  userScript: { code: string; filename: string } | null;
}

export function useFileUpload() {
  const [state, setState] = useState<FileState>({
    imageFile: null,
    imageUrl: '',
    algoFile: null,
    algoResponse: '',
    algoError: '',
    userScript: null,
  });

  const handleImageFileChange = useCallback((file: File) => {
    setState(prev => ({
      ...prev,
      imageFile: file,
      imageUrl: URL.createObjectURL(file),
    }));
  }, []);

  const handleAlgoFileChange = useCallback((file: File) => {
    try {
      // Set the file first
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
            algoResponse: content,
            userScript: {
              code: content,
              filename: file.name
            }
          }));
        } catch (error) {
          setState(prev => ({
            ...prev,
            algoError: 'Failed to read algorithm file'
          }));
          console.error('Error reading algorithm file:', error);
        }
      };
      reader.readAsText(file);
    } catch (error) {
      setState(prev => ({
        ...prev,
        algoError: 'Failed to read algorithm file'
      }));
      console.error('Error reading algorithm file:', error);
    }
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
      userScript: null,
    });
  }, [state.imageUrl]);

  const setUserScript = useCallback((script: { code: string; filename: string } | null) => {
    setState(prev => ({
      ...prev,
      userScript: script
    }));
  }, []);

  return {
    ...state,
    handleImageFileChange,
    handleAlgoFileChange,
    resetFiles,
    setUserScript
  };
} 