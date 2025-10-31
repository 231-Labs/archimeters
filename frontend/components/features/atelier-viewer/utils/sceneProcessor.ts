import { Parameters } from '../types';

export const processSceneFile = (code: string): Parameters => {
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

    let parameters: Record<string, any> | any[];
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
        throw new Error('Parameter parsing failed');
      }
    }

    const extractedParams: Parameters = {};
    
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

    return extractedParams;
  } catch (error) {
    throw new Error(`Parameter parsing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

