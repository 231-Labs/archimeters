import { useState, useCallback } from 'react';
import type { ParameterState } from '../types';

export function useParameters() {
  const [parameterState, setParameterState] = useState<ParameterState>({
    extractedParameters: {},
    hasExtractedParams: false,
    previewParams: {},
    showPreview: false,
  });

  const processSceneFile = useCallback((code: string) => {
    try {
      const paramRegex = /param\s+(\w+)\s*:\s*(\w+)\s*=\s*([^;]+)/g;
      const extractedParams: Record<string, any> = {};
      let match;

      while ((match = paramRegex.exec(code)) !== null) {
        const [, name, type, defaultValue] = match;
        extractedParams[name] = {
          type,
          default: defaultValue.trim(),
          current: defaultValue.trim(),
        };
      }

      setParameterState((prev: ParameterState) => ({
        ...prev,
        extractedParameters: extractedParams,
        hasExtractedParams: Object.keys(extractedParams).length > 0,
        previewParams: extractedParams,
      }));

      return extractedParams;
    } catch (error) {
      console.error('Error processing scene file:', error);
      return {};
    }
  }, []);

  const updateParameter = useCallback((key: string, value: string | number) => {
    setParameterState((prev: ParameterState) => ({
      ...prev,
      previewParams: {
        ...prev.previewParams,
        [key]: {
          ...prev.previewParams[key],
          current: value,
        },
      },
    }));
  }, []);

  const togglePreview = useCallback(() => {
    setParameterState((prev: ParameterState) => ({
      ...prev,
      showPreview: !prev.showPreview,
    }));
  }, []);

  const resetParameters = useCallback(() => {
    setParameterState({
      extractedParameters: {},
      hasExtractedParams: false,
      previewParams: {},
      showPreview: false,
    });
  }, []);

  return {
    ...parameterState,
    processSceneFile,
    updateParameter,
    togglePreview,
    resetParameters,
  };
} 