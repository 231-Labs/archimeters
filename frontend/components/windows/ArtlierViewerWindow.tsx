import { useEffect, useState, useCallback } from 'react';
import type { WindowName } from '@/types';
import BaseTemplate from '@/components/templates/BaseTemplate';
import DefaultTemplate from '@/components/templates/DefaultTemplate';
import { ParametricViewer } from '@/components/features/design-publisher/components/pages/ParametricViewer';

interface ArtlierViewerWindowProps {
  name: WindowName;
}

interface Artlier {
  id: string;
  photoBlobId: string;
  algorithmBlobId: string;
  dataBlobId: string;
  url: string | null;
  algorithmContent: string | null;
  configData: any | null;
  title: string;
  author: string;
  price: string;
  description?: string;
  artistStatement?: string;
  artistName?: string;
  artistAddress?: string;
}

export default function ArtlierViewerWindow({
  name,
}: ArtlierViewerWindowProps) {
  const [artlier, setArtlier] = useState<Artlier | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [previewParams, setPreviewParams] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 從 Walrus 獲取圖片
  const fetchImageFromWalrus = async (blobId: string) => {
    try {
      const response = await fetch(`/api/walrus/blob/${blobId}`);
      if (!response.ok) {
        throw new Error('Failed to load image');
      }
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (err) {
      console.error('Error loading image:', err);
      throw err;
    }
  };

  // 從 Walrus 獲取演算法內容
  const fetchAlgorithmFromWalrus = async (blobId: string) => {
    try {
      const response = await fetch(`/api/walrus/blob/${blobId}`);
      if (!response.ok) {
        throw new Error('Failed to load algorithm');
      }
      return await response.text();
    } catch (err) {
      console.error('Error loading algorithm:', err);
      throw err;
    }
  };

  // 從 Walrus 獲取配置文件
  const fetchConfigDataFromWalrus = async (blobId: string) => {
    try {
      const response = await fetch(`/api/walrus/blob/${blobId}`);
      if (!response.ok) {
        throw new Error('Failed to load config data');
      }
      const configText = await response.text();
      return JSON.parse(configText);
    } catch (err) {
      console.error('Error loading config data:', err);
      throw err;
    }
  };

  // 處理演算法文件並提取參數
  const processSceneFile = useCallback((code: string) => {
    if (!code || typeof code !== 'string') {
      console.error('Invalid code input:', { code });
      throw new Error('Invalid code input');
    }

    try {
      console.log('====== Processing scene file ======');
      console.log('Code length:', code.length);
      console.log('First 100 chars:', code.substring(0, 100));
      console.log('File format detection...');
      
      // 簡單判斷檔案格式
      if (code.includes('createGeometry')) {
        console.log('✓ Found createGeometry function');
      }
      if (code.includes('export') || code.includes('import')) {
        console.log('✓ Likely ES module format');
      }
      if (code.includes('module.exports') || code.includes('require(')) {
        console.log('✓ Likely CommonJS format');
      }
      if (code.includes('parameters')) {
        console.log('✓ Found parameters reference');
      }
      
      // 支援更多參數定義格式
      const paramPatterns = [
        /(?:export\s+)?const\s+parameters\s*=\s*(\{[\s\S]*?\})\s*;/,    // 對象格式
        /(?:export\s+)?const\s+parameters\s*=\s*(\[[\s\S]*?\])\s*;/,    // 陣列格式
        /(?:export\s+)?const\s+defaultParameters\s*=\s*(\{[\s\S]*?\})\s*;/, // TestPage 格式
        /module\.parameters\s*=\s*(\{[\s\S]*?\})\s*;/,                  // CommonJS 對象格式
        /module\.parameters\s*=\s*(\[[\s\S]*?\])\s*;/,                  // CommonJS 陣列格式
        /function\s+createGeometry\s*\([^)]*\)\s*\{[\s\S]*?return[^;]*;/  // 直接從 createGeometry 函數提取
      ];

      let parametersMatch = null;
      let extractedCode = '';

      // 嘗試所有模式
      for (const pattern of paramPatterns) {
        const match = code.match(pattern);
        if (match) {
          console.log('Matched pattern:', pattern.toString().substring(0, 50));
          if (pattern.toString().includes('createGeometry')) {
            // 從 createGeometry 函數提取參數
            const geometryCode = match[0];
            console.log('Extracted geometry code:', geometryCode.substring(0, 100));
            const paramMatches = geometryCode.match(/(\w+):\s*([^,}\s]+)/g);
            if (paramMatches) {
              console.log('Found param matches in createGeometry:', paramMatches);
              const paramsObj: Record<string, any> = {};
              paramMatches.forEach(param => {
                const [key, value] = param.split(':').map(s => s.trim());
                if (key && !['new', 'return', 'function'].includes(key)) {
                  (paramsObj as Record<string, any>)[key] = {
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
        // 沒有找到模式匹配，嘗試從函數參數中提取
        console.log('No pattern match, attempting to extract from function directly');
        const funcMatch = code.match(/function\s+createGeometry\s*\(\s*THREE\s*(?:,\s*params)?\s*\)/);
        if (funcMatch) {
          console.log('Found createGeometry function, extracting default parameters');
          // 從普通的參數聲明中提取
          const paramExtractions = code.match(/(?:const|let|var)\s+(\w+)\s*=\s*params\.(\w+)\s*\|\|\s*([^;]+);/g);
          if (paramExtractions && paramExtractions.length > 0) {
            console.log('Found param declarations:', paramExtractions);
            const paramsObj: Record<string, any> = {};
            paramExtractions.forEach(extraction => {
              const match = extraction.match(/(?:const|let|var)\s+(\w+)\s*=\s*params\.(\w+)\s*\|\|\s*([^;]+);/);
              if (match) {
                const [_, varName, paramName, defaultValue] = match;
                console.log(`Found param: ${paramName} with default ${defaultValue}`);
                let parsedValue: string | number = defaultValue.trim();
                // 嘗試將數值字符串轉換為數字
                if (!isNaN(Number(parsedValue)) && typeof parsedValue === 'string') {
                  parsedValue = Number(parsedValue);
                }
                // 處理顏色值
                if (typeof parsedValue === 'string' && parsedValue.startsWith('#')) {
                  paramsObj[paramName] = {
                    type: 'color',
                    label: paramName,
                    default: parsedValue,
                    current: parsedValue
                  };
                } else {
                  // 確保是數字類型
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
              console.log('Extracted params from declarations:', paramsObj);
              extractedCode = JSON.stringify(paramsObj);
            }
          }
        }
      }

      if (!extractedCode) {
        console.error('Could not find parameters definition in code:', code);
        throw new Error('Could not find parameters definition in code');
      }

      console.log('Found parameters definition:', extractedCode);

      let parameters: Record<string, any> | any[];
      try {
        // 清理代碼
        let cleanCode = extractedCode
          .replace(/(\w+):/g, '"$1":')  // 將鍵名轉換為字符串
          .replace(/'([^']*?)'/g, '"$1"')  // 將單引號轉換為雙引號
          .replace(/,(\s*[}\]])/g, '$1')  // 移除尾隨逗號
          .replace(/\/\/.*/g, '')  // 移除單行註釋
          .replace(/\/\*[\s\S]*?\*\//g, ''); // 移除多行註釋
        
        console.log('Cleaned code:', cleanCode);
        
        parameters = JSON.parse(cleanCode);
      } catch (parseError) {
        console.error('JSON parsing failed, trying Function:', parseError);
        try {
          parameters = new Function(`return ${extractedCode}`)();
        } catch (funcError) {
          console.error('Function parsing failed:', funcError);
          throw new Error('Parameter parsing failed');
        }
      }

      // 標準化參數格式
      const extractedParams: Record<string, any> = {};
      
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

      console.log('Successfully extracted parameters:', extractedParams);

      if (Object.keys(extractedParams).length === 0) {
        throw new Error('No valid parameters found in code');
      }

      // 更新參數狀態
      setParameters(extractedParams);
      setPreviewParams(Object.fromEntries(
        Object.entries(extractedParams).map(([key, value]) => [key, value.default])
      ));

      return extractedParams;
    } catch (error) {
      console.error('Error processing scene file:', error);
      throw new Error(`Parameter parsing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, []);

  useEffect(() => {
    const fetchArtlierData = async () => {
      try {
        // 從 sessionStorage 中讀取藝術品數據
        const storedArtlier = sessionStorage.getItem('selected-artlier');
        if (!storedArtlier) {
          throw new Error('No artlier data found');
        }

        const parsedArtlier = JSON.parse(storedArtlier);
        setArtlier(parsedArtlier);

        // 並行獲取所有需要的數據
        const [imageUrl, algorithmContent, configData] = await Promise.all([
          fetchImageFromWalrus(parsedArtlier.photoBlobId),
          fetchAlgorithmFromWalrus(parsedArtlier.algorithmBlobId),
          fetchConfigDataFromWalrus(parsedArtlier.dataBlobId)
        ]);

        // 更新狀態
        setArtlier(prev => ({
          ...prev!,
          url: imageUrl,
          algorithmContent,
          configData,
          description: configData.artwork?.description,
          artistStatement: configData.artist?.introduction,
          artistName: configData.artist?.name,
          artistAddress: configData.artist?.address
        }));

        // 如果有 configData，設置參數
        if (configData) {
          setParameters(configData.parameters || {});
          // 設置預覽參數的初始值
          const initialPreviewParams = Object.fromEntries(
            Object.entries(configData.parameters || {})
              .map(([key, value]: [string, any]) => [key, value.default])
          );
          setPreviewParams(initialPreviewParams);
        }

        // 如果有演算法內容，處理參數
        if (algorithmContent) {
          try {
            processSceneFile(algorithmContent);
          } catch (error) {
            console.error('Error processing algorithm:', error);
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching Artlier data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch Artlier data');
        setIsLoading(false);
      }
    };

    fetchArtlierData();

    // 清理函數
    return () => {
      if (artlier?.url) {
        URL.revokeObjectURL(artlier.url);
      }
    };
  }, [processSceneFile]);

  const handleParameterChange = (key: string, value: string | number) => {
    setPreviewParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!artlier) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white/50">No artlier data found</div>
      </div>
    );
  }

  // 將 algorithmContent 轉換為 ParametricViewer 需要的格式
  const userScript = artlier.algorithmContent ? {
    code: artlier.algorithmContent,
    filename: 'algorithm.js'
  } : null;

  // 格式化地址顯示
  const formatAddress = (address: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  // 格式化文本，確保換行符被正確處理
  const formatText = (text: string) => {
    return text ? text.replace(/\n/g, '\n') : '';
  };

  return (
    <BaseTemplate
      workName={artlier.title}
      description={artlier.description || ''}
      price={artlier.price}
      author={artlier.artistName || artlier.author}
      social={formatAddress(artlier.artistAddress || '')}
      intro={formatText(artlier.artistStatement || '')}
      imageUrl={artlier.url || ''}
      parameters={parameters}
      previewParams={previewParams}
      onParameterChange={handleParameterChange}
      onMint={() => {}}
    >
      <DefaultTemplate
        workName={artlier.title}
        description={artlier.description || ''}
        price={artlier.price}
        author={artlier.artistName || artlier.author}
        social={formatAddress(artlier.artistAddress || '')}
        intro={formatText(artlier.artistStatement || '')}
        imageUrl={artlier.url || ''}
        parameters={parameters}
        previewParams={previewParams}
        onParameterChange={handleParameterChange}
        onMint={() => {}}
        preview3D={<ParametricViewer userScript={userScript} parameters={previewParams} />}
      />
    </BaseTemplate>
  );
} 