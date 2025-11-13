import { useState, useCallback, useMemo, useEffect } from 'react';
import { debounce } from 'lodash';
import { Parameters, Atelier, UserScript } from '../types';
import { processSceneFile } from '../utils/sceneProcessor';

export const useAtelierParameters = (atelier: Atelier | null) => {
  const [parameters, setParameters] = useState<Parameters>({});
  const [previewParams, setPreviewParams] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!atelier) return;

    if (atelier.configData) {
      setParameters(atelier.configData.parameters || {});
      const initialPreviewParams = Object.fromEntries(
        Object.entries(atelier.configData.parameters || {})
          .map(([key, value]: [string, any]) => [key, value.default])
      );
      setPreviewParams(initialPreviewParams);
    }

    if (atelier.algorithmContent) {
      try {
        const extractedParams = processSceneFile(atelier.algorithmContent);
        setParameters(extractedParams);
        setPreviewParams(Object.fromEntries(
          Object.entries(extractedParams).map(([key, value]) => [key, value.default])
        ));
      } catch (error) {
        console.error('Error processing algorithm:', error);
      }
    }
  }, [atelier]);

  const handleParameterChange = useCallback(
    debounce((key: string, value: string | number | Record<string, any>) => {
      setPreviewParams((prev) => {
        if (key === 'all' && typeof value === 'object') {
          return { ...value };
        }
        if (prev[key] === value) return prev;
        return { ...prev, [key]: value };
      });
    }, 0),
    []
  );

  const userScript = useMemo(() => {
    if (!atelier?.algorithmContent) {
      return null;
    }
    return {
      code: atelier.algorithmContent,
      filename: `algorithm_${atelier?.id || 'default'}.js`,
    };
  }, [atelier?.algorithmContent, atelier?.id]);

  return {
    parameters,
    previewParams,
    handleParameterChange,
    userScript,
  };
};

