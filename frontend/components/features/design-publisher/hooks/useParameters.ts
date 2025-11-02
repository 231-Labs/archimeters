import { useState, useCallback } from 'react';
import type { ParameterState, GeometryParameter, ParameterRules } from '../types';

const BASIS_POINTS = 100;

interface GeometryParameters {
  [key: string]: GeometryParameter;
}

export function useParameters() {
  const [parameterState, setParameterState] = useState<ParameterState>({
    extractedParameters: {},
    hasExtractedParams: false,
    previewParams: {},
    showPreview: false,
    customScript: null,
  });

  const toBasisPoints = useCallback((value: number): number => {
    return Math.round(value * BASIS_POINTS);
  }, []);

  const fromBasisPoints = useCallback((value: number): number => {
    return value / BASIS_POINTS;
  }, []);

  const processSceneFile = useCallback((code: string) => {
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid code input');
    }

    try {
      const paramPatterns = [
        /(?:export\s+)?const\s+parameters\s*=\s*(\{[\s\S]*?\})\s*;/,
        /(?:export\s+)?const\s+parameters\s*=\s*(\[[\s\S]*?\])\s*;/,
        /(?:export\s+)?const\s+defaultParameters\s*=\s*(\{[\s\S]*?\})\s*;/,
        /module\.parameters\s*=\s*(\{[\s\S]*?\})\s*;/,
        /module\.parameters\s*=\s*(\[[\s\S]*?\])\s*;/,
        /function\s+createGeometry\s*\([^)]*\)\s*\{[\s\S]*?return[^;]*;/
      ];

      let extractedCode = '';

      for (const pattern of paramPatterns) {
        const match = code.match(pattern);
        if (match) {
          if (pattern.toString().includes('createGeometry')) {
            const geometryCode = match[0];
            const paramMatches = geometryCode.match(/(\w+):\s*([^,}\s]+)/g);
            if (paramMatches) {
              const paramsObj: Record<string, any> = {};
              paramMatches.forEach(param => {
                const [key, value] = param.split(':').map(s => s.trim());
                if (key && !['new', 'return', 'function'].includes(key)) {
                  paramsObj[key] = {
                    type: 'number',
                    label: key,
                    default: parseFloat(value) || 0,
                    min: 0,
                    max: 100,
                    current: parseFloat(value) || 0
                  };
                }
              });
              extractedCode = JSON.stringify(paramsObj);
              break;
            }
          } else {
            extractedCode = match[1];
            break;
          }
        }
      }

      if (!extractedCode) {
        const funcMatch = code.match(/function\s+createGeometry\s*\(\s*THREE\s*(?:,\s*params)?\s*\)/);
        if (funcMatch) {
          const paramExtractions = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*params\.(\w+)\s*\|\|\s*([^;]+);/g);
          if (paramExtractions && paramExtractions.length > 0) {
            const paramsObj: Record<string, any> = {};
            paramExtractions.forEach(extraction => {
              const match = extraction.match(/(?:const|let|var)\s+(\w+)\s*=\s*params\.(\w+)\s*\|\|\s*([^;]+);/);
              if (match) {
                const [_, varName, paramName, defaultValue] = match;
                let parsedValue: string | number = defaultValue.trim();
                if (!isNaN(Number(parsedValue)) && typeof parsedValue === 'string') {
                  parsedValue = Number(parsedValue);
                }
                if (typeof parsedValue === 'string' && parsedValue.startsWith('#')) {
                  paramsObj[paramName] = {
                    type: 'color',
                    label: paramName,
                    default: parsedValue,
                    current: parsedValue
                  };
                } else {
                  paramsObj[paramName] = {
                    type: 'number',
                    label: paramName,
                    default: typeof parsedValue === 'number' ? parsedValue : 0,
                    min: 0,
                    max: typeof parsedValue === 'number' ? parsedValue * 2 : 100,
                    current: typeof parsedValue === 'number' ? parsedValue : 0
                  };
                }
              }
            });
            
            if (Object.keys(paramsObj).length > 0) {
              extractedCode = JSON.stringify(paramsObj);
            }
          }
        }
      }

      if (!extractedCode) {
        throw new Error('Could not find parameters definition in code');
      }

      let parameters: GeometryParameters | GeometryParameter[];
      try {
        let cleanCode = extractedCode
          .replace(/(\w+):/g, '"$1":')
          .replace(/'([^']*?)'/g, '"$1"')
          .replace(/,(\s*[}\]])/g, '$1')
          .replace(/\/\/.*/g, '')
          .replace(/\/\*[\s\S]*?\*\//g, '');
        
        parameters = JSON.parse(cleanCode);
      } catch (parseError) {
        try {
          parameters = new Function(`return ${extractedCode}`)();
        } catch (funcError) {
          const geometryMatch = code.match(/function\s+createGeometry\s*\([^)]*\)\s*\{[\s\S]*?return[^;]*;/);
          if (geometryMatch) {
            const geometryCode = geometryMatch[0];
            const paramMatches = geometryCode.match(/(\w+):\s*([^,}\s]+)/g);
            if (paramMatches) {
              parameters = {};
              paramMatches.forEach(param => {
                const [key, value] = param.split(':').map(s => s.trim());
                if (key && !['new', 'return', 'function'].includes(key)) {
                  (parameters as Record<string, any>)[key] = {
                    type: 'number',
                    label: key,
                    default: parseFloat(value) || 0,
                    min: 0,
                    max: 100,
                    current: parseFloat(value) || 0
                  };
                }
              });
            } else {
              throw new Error('Could not extract parameters from geometry function');
            }
          } else {
            throw new Error('Parameter parsing failed');
          }
        }
      }

      const extractedParams: GeometryParameters = {};
      
      if (Array.isArray(parameters)) {
        parameters.forEach((param: any, index: number) => {
          const key = param.key || `param${index}`;
          extractedParams[key] = {
            type: param.type || 'number',
            label: param.label || key,
            default: param.default ?? 0,
            min: param.min ?? 0,
            max: param.max ?? 100,
            current: param.default ?? 0
          };
        });
      } else if (typeof parameters === 'object' && parameters !== null) {
        Object.entries(parameters).forEach(([key, param]: [string, any]) => {
          if (typeof param === 'object') {
            extractedParams[key] = {
              type: param.type || 'number',
              label: param.label || key,
              default: param.default ?? param.current ?? 0,
              min: param.min ?? 0,
              max: param.max ?? 100,
              current: param.current ?? param.default ?? 0
            };
          } else {
            extractedParams[key] = {
              type: typeof param === 'string' && param.startsWith('#') ? 'color' : 'number',
              label: key,
              default: param,
              min: 0,
              max: typeof param === 'number' ? param * 2 : 100,
              current: param
            };
          }
        });
      }

      if (Object.keys(extractedParams).length === 0) {
        throw new Error('No valid parameters found in code');
      }

      setParameterState(prev => ({
        ...prev,
        extractedParameters: extractedParams,
        hasExtractedParams: true,
        previewParams: Object.fromEntries(
          Object.entries(extractedParams).map(([key, value]) => [key, value.default])
        ),
        showPreview: true, // Auto-enable preview when parameters are extracted
      }));

      return extractedParams;
    } catch (error: any) {
      throw new Error(`Parameter parsing failed: ${error.message}`);
    }
  }, []);

  const updateParameter = useCallback((key: string, value: any) => {
    setParameterState(prev => ({
      ...prev,
      previewParams: {
        ...prev.previewParams,
        [key]: value,
      },
    }));
  }, []);

  const togglePreview = useCallback(() => {
    setParameterState(prev => ({
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
      customScript: null,
    });
  }, []);

  const exportParameterRules = useCallback((): ParameterRules => {
    const rules: ParameterRules = {};
    
    Object.entries(parameterState.extractedParameters).forEach(([key, param]) => {
      if (param.type === 'number') {
        const defaultValue = typeof param.default === 'number' ? param.default : 0;
        const minValue = param.min !== undefined ? param.min : 0;
        const maxValue = param.max !== undefined ? param.max : 100;
        
        // Apply offset to handle negative values
        // Store as: value_on_chain = value - minValue
        // This converts [-30, 30] to [0, 60], for example
        const offset = minValue;
        const minValueOnChain = 0; // Always starts at 0 after offset
        const maxValueOnChain = maxValue - offset;
        const defaultValueOnChain = defaultValue - offset;
        
        rules[key] = {
          type: 'number',
          label: param.label || key,
          minValue: toBasisPoints(minValueOnChain),
          maxValue: toBasisPoints(maxValueOnChain),
          defaultValue: toBasisPoints(defaultValueOnChain),
        };
      } else {
        rules[key] = {
          type: 'color',
          label: param.label || key,
          minValue: 0,
          maxValue: 0,
          defaultValue: 0,
        };
      }
    });
    
    return rules;
  }, [parameterState.extractedParameters, toBasisPoints]);

  return {
    ...parameterState,
    processSceneFile,
    updateParameter,
    togglePreview,
    resetParameters,
    exportParameterRules,
    toBasisPoints,
    fromBasisPoints,
  };
}
