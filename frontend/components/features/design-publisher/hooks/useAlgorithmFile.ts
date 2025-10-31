import { useState, useCallback } from 'react';

interface UseAlgorithmFileReturn {
  fileTypeError: string | null;
  handleDrop: (acceptedFiles: File[]) => void;
  validateFileType: (file: File) => boolean;
  clearError: () => void;
}

export function useAlgorithmFile(
  onFileChange: (file: File) => void
): UseAlgorithmFileReturn {
  const [fileTypeError, setFileTypeError] = useState<string | null>(null);

  const validateFileType = useCallback((file: File): boolean => {
    const validExtensions = ['.tsx', '.ts', '.js'];
    const fileName = file.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValid) {
      setFileTypeError(
        `Invalid file type. Only .tsx, .ts or .js files are allowed. You uploaded: ${file.name}`
      );
    }
    
    return isValid;
  }, []);

  const handleDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (validateFileType(file)) {
        setFileTypeError(null);
        onFileChange(file);
      }
    }
  }, [onFileChange, validateFileType]);

  const clearError = useCallback(() => {
    setFileTypeError(null);
  }, []);

  return {
    fileTypeError,
    handleDrop,
    validateFileType,
    clearError,
  };
}

