import { useEffect, useState, useCallback, useRef, ReactNode } from 'react';
import type { WindowName } from '@/types';
import BaseTemplate from '@/components/templates/BaseTemplate';
import DefaultTemplate from '@/components/templates/DefaultTemplate';
import { ParametricViewer } from '@/components/features/design-publisher/components/pages/ParametricViewer';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import * as THREE from 'three';
import { mintBottega } from '@/utils/transactions';
import { useSignAndExecuteTransaction, useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { MEMBERSHIP_TYPE } from '@/utils/transactions';

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
  payment?: string;
  description?: string;
  artistStatement?: string;
  artistName?: string;
  artistAddress?: string;
}

interface MintButtonState {
  disabled: boolean;
  tooltip: string;
  tooltipComponent?: ReactNode;
}

export default function ArtlierViewerWindow({
  name,
}: ArtlierViewerWindowProps) {
  const [artlier, setArtlier] = useState<Artlier | null>(null);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [previewParams, setPreviewParams] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [mintBlobIds, setMintBlobIds] = useState<{
    screenshotBlobId: string | null;
    stlBlobId: string | null;
  }>({
    screenshotBlobId: null,
    stlBlobId: null,
  });
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const [mintStatus, setMintStatus] = useState<'idle' | 'preparing' | 'minting' | 'success' | 'error'>('idle');
  const [mintError, setMintError] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [hasMembership, setHasMembership] = useState(false);
  const [suiBalance, setSuiBalance] = useState<bigint>(BigInt(0));
  const [mintButtonState, setMintButtonState] = useState<MintButtonState>({
    disabled: true,
    tooltip: 'Please connect your wallet'
  });

  // Fetch image from Walrus storage
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

  // Fetch algorithm content from Walrus storage
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

  // Fetch configuration data from Walrus storage
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

  // Process algorithm file and extract parameters
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
      
      // Simple file format detection
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
      
      // Support more parameter definition formats
      const paramPatterns = [
        /(?:export\s+)?const\s+parameters\s*=\s*(\{[\s\S]*?\})\s*;/,    // Object format
        /(?:export\s+)?const\s+parameters\s*=\s*(\[[\s\S]*?\])\s*;/,    // Array format
        /(?:export\s+)?const\s+defaultParameters\s*=\s*(\{[\s\S]*?\})\s*;/, // TestPage format
        /module\.parameters\s*=\s*(\{[\s\S]*?\})\s*;/,                  // CommonJS Object format
        /module\.parameters\s*=\s*(\[[\s\S]*?\])\s*;/,                  // CommonJS Array format
        /function\s+createGeometry\s*\([^)]*\)\s*\{[\s\S]*?return[^;]*;/  // Extract directly from createGeometry function
      ];

      let parametersMatch = null;
      let extractedCode = '';

      // Try all patterns
      for (const pattern of paramPatterns) {
        const match = code.match(pattern);
        if (match) {
          console.log('Matched pattern:', pattern.toString().substring(0, 50));
          if (pattern.toString().includes('createGeometry')) {
            // Extract parameters from createGeometry function
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
        // No pattern match, attempt to extract from function directly
        console.log('No pattern match, attempting to extract from function directly');
        const funcMatch = code.match(/function\s+createGeometry\s*\(\s*THREE\s*(?:,\s*params)?\s*\)/);
        if (funcMatch) {
          console.log('Found createGeometry function, extracting default parameters');
          // Extract from regular parameter declarations
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
                // Try to convert string value to number
                if (!isNaN(Number(parsedValue)) && typeof parsedValue === 'string') {
                  parsedValue = Number(parsedValue);
                }
                // Handle color values
                if (typeof parsedValue === 'string' && parsedValue.startsWith('#')) {
                  paramsObj[paramName] = {
                    type: 'color',
                    label: paramName,
                    default: parsedValue,
                    current: parsedValue
                  };
                } else {
                  // Ensure it's a number type
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
        // Clean code
        let cleanCode = extractedCode
          .replace(/(\w+):/g, '"$1":')  // Convert key names to string
          .replace(/'([^']*?)'/g, '"$1"')  // Convert single quotes to double quotes
          .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing comma
          .replace(/\/\/.*/g, '')  // Remove single-line comments
          .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
        
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

      // Standardize parameter format
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

      // Update parameter state
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
        // Read artlier data from sessionStorage
        const storedArtlier = sessionStorage.getItem('selected-artlier');
        if (!storedArtlier) {
          throw new Error('No artlier data found');
        }

        const parsedArtlier = JSON.parse(storedArtlier);
        setArtlier(parsedArtlier);

        // Fetch all required data concurrently
        const [imageUrl, algorithmContent, configData] = await Promise.all([
          fetchImageFromWalrus(parsedArtlier.photoBlobId),
          fetchAlgorithmFromWalrus(parsedArtlier.algorithmBlobId),
          fetchConfigDataFromWalrus(parsedArtlier.dataBlobId)
        ]);

        // Update state
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

        // If there's configData, set parameters
        if (configData) {
          setParameters(configData.parameters || {});
          // Set initial values for preview parameters
          const initialPreviewParams = Object.fromEntries(
            Object.entries(configData.parameters || {})
              .map(([key, value]: [string, any]) => [key, value.default])
          );
          setPreviewParams(initialPreviewParams);
        }

        // If there's algorithm content, process parameters
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

    // Cleanup function
    return () => {
      if (artlier?.url) {
        URL.revokeObjectURL(artlier.url);
      }
    };
  }, [processSceneFile]);

  // Handle parameter changes from UI controls
  const handleParameterChange = (key: string, value: string | number) => {
    setPreviewParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 添加上傳到 Walrus 的通用函數
  const uploadToWalrus = async (file: File, fileType: string): Promise<string> => {
    const maxRetries = 3;
    let retryCount = 0;
    let lastError: Error | null = null;

    console.log(`[${fileType}] 開始上傳流程`, {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    });

    while (retryCount < maxRetries) {
      try {
        console.log(`[${fileType}] 嘗試上傳 (${retryCount + 1}/${maxRetries})`);
        setUploadStatus('uploading');
        setUploadProgress(`Uploading ${fileType}... (Attempt ${retryCount + 1}/${maxRetries})`);

        const formData = new FormData();
        formData.append('data', file);
        formData.append('epochs', '5');

        console.log(`[${fileType}] 發送請求到 Walrus API`);
        const response = await fetch('/api/walrus', {
          method: 'PUT',
          body: formData,
        });

        console.log(`[${fileType}] 收到回應:`, {
          status: response.status,
          statusText: response.statusText
        });

        if (!response.ok) {
          if (response.status === 500) {
            console.log(`[${fileType}] 收到 500 錯誤，準備重試`);
            lastError = new Error(`HTTP error: ${response.status}`);
            retryCount++;
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
            continue;
          }
          throw new Error(`HTTP error: ${response.status}`);
        }

        const responseText = await response.text();
        console.log(`[${fileType}] 回應內容:`, responseText.substring(0, 200));

        let result;
        try {
          result = JSON.parse(responseText);
          console.log(`[${fileType}] 解析 JSON 成功:`, result);
        } catch (err) {
          console.error(`[${fileType}] JSON 解析失敗:`, err);
          throw new Error('Failed to parse response JSON');
        }

        let blobId = result?.alreadyCertified?.blobId || result?.newlyCreated?.blobObject?.blobId;
        console.log(`[${fileType}] 獲取到 blobId:`, blobId);

        if (!blobId || typeof blobId !== 'string' || blobId.trim() === '') {
          console.error(`[${fileType}] 無效的 blobId`);
          throw new Error('No valid blobId returned');
        }

        console.log(`[${fileType}] 等待確認 blob 可用性`);
        await new Promise(resolve => setTimeout(resolve, 800));

        console.log(`[${fileType}] 上傳成功完成！blobId:`, blobId);
        setUploadStatus('success');
        setUploadProgress(`${fileType} uploaded successfully!`);
        return blobId;

      } catch (error: any) {
        console.error(`[${fileType}] 錯誤:`, {
          message: error.message,
          stack: error.stack,
          attempt: retryCount + 1
        });
        
        if ((error.message.includes('Failed to fetch') || error.message.includes('HTTP error: 500')) && retryCount < maxRetries - 1) {
          lastError = error;
          retryCount++;
          console.log(`[${fileType}] 準備重試 (${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          continue;
        }
        
        setUploadStatus('error');
        setUploadProgress(`Failed to upload ${fileType}`);
        throw lastError || error;
      }
    }

    console.error(`[${fileType}] 達到最大重試次數，上傳失敗`);
    throw lastError || new Error('Upload failed after maximum retries');
  };

  const handleMint = useCallback(async () => {
    if (!artlier) return;

    try {
      console.log('開始 Mint 流程');
      setMintStatus('preparing');
      setMintError(null);

      // 1. 捕獲截圖並上傳到 Walrus
      try {
        console.log('準備捕獲截圖');
        if (!sceneRef.current || !rendererRef.current || !cameraRef.current) {
          throw new Error('3D scene not ready');
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
        await new Promise(requestAnimationFrame);
        
        console.log('生成截圖');
        const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        const screenshotFile = new File([blob], `${artlier.title}_screenshot_${Date.now()}.png`, { type: 'image/png' });
        console.log('截圖檔案已準備', { fileName: screenshotFile.name, size: screenshotFile.size });

        const screenshotBlobId = await uploadToWalrus(screenshotFile, 'Screenshot');
        console.log('截圖上傳成功，blobId:', screenshotBlobId);

        // 2. 導出 STL 並上傳到 Walrus
        console.log('準備導出 STL');
        if (!sceneRef.current) {
          throw new Error('3D scene not ready for STL export');
        }

        const meshes: THREE.Mesh[] = [];
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) meshes.push(object);
        });
        console.log('找到網格數量:', meshes.length);

        if (meshes.length === 0) {
          throw new Error('No mesh found in scene');
        }

        const exportScene = new THREE.Scene();
        meshes.forEach(mesh => {
          const clonedMesh = mesh.clone();
          if (clonedMesh.geometry instanceof THREE.BufferGeometry) {
            clonedMesh.geometry.computeVertexNormals();
            if (clonedMesh.material instanceof THREE.Material) {
              clonedMesh.material.side = THREE.DoubleSide;
            }
          }
          exportScene.add(clonedMesh);
        });

        console.log('開始導出 STL');
        const exporter = new STLExporter();
        const stlString = exporter.parse(exportScene, { binary: false });
        console.log('STL 導出完成，大小:', stlString.length);

        const blob2 = new Blob([stlString], { type: 'application/octet-stream' });
        const stlFile = new File([blob2], `${artlier.title}_${Date.now()}.stl`, { type: 'application/octet-stream' });
        console.log('STL 檔案已準備', { fileName: stlFile.name, size: stlFile.size });

        const stlBlobId = await uploadToWalrus(stlFile, 'STL');
        console.log('STL 上傳成功，blobId:', stlBlobId);

        // 確保兩個 blob ID 都已獲取
        if (!screenshotBlobId || !stlBlobId) {
          throw new Error('Failed to get blob IDs');
        }

        console.log('所有檔案上傳成功，準備執行交易', {
          screenshotBlobId,
          stlBlobId
        });

        setMintStatus('minting');

        // 3. 準備交易
        const membershipId = sessionStorage.getItem('membership-id');
        if (!membershipId) {
          throw new Error('No membership ID found');
        }

        if (!artlier.payment) {
          throw new Error('No payment coin selected');
        }

        // 4. 執行交易
        console.log('交易參數:', {
          artlierId: artlier.id,
          membershipId,
          screenshotBlobId,
          stlBlobId,
          payment: artlier.payment
        });

        const tx = await mintBottega(
          artlier.id,
          membershipId,
          screenshotBlobId,
          stlBlobId,
          artlier.payment,
        );

        signAndExecuteTransaction(
          {
            transaction: tx as any,
            chain: 'sui:testnet',
          },
          {
            onSuccess: (result) => {
              console.log('Mint 交易成功:', result);
              setMintStatus('success');
            },
            onError: (error) => {
              console.error('Mint 交易失敗:', error);
              setMintError(error instanceof Error ? error.message : 'Failed to mint bottega');
              setMintStatus('error');
            }
          }
        );

      } catch (error) {
        console.error('Mint 流程失敗:', error);
        setMintError(error instanceof Error ? error.message : 'Failed to mint bottega');
        setMintStatus('error');
      }

    } catch (error) {
      console.error('Mint 流程失敗:', error);
      setMintError(error instanceof Error ? error.message : 'Failed to mint bottega');
      setMintStatus('error');
    }
  }, [artlier, sceneRef, rendererRef, cameraRef, signAndExecuteTransaction]);

  // 檢查用戶是否擁有 Membership NFT
  const checkMembershipNFT = useCallback(async () => {
    if (!currentAccount) {
      setHasMembership(false);
      sessionStorage.removeItem('membership-id');
      return false;
    }

    try {
      const { data: objects } = await suiClient.getOwnedObjects({
        owner: currentAccount.address,
        filter: {
          StructType: MEMBERSHIP_TYPE
        },
        options: {
          showType: true,
        }
      });

      const hasNFT = objects && objects.length > 0;
      setHasMembership(hasNFT);
      
      if (hasNFT && objects[0].data?.objectId) {
        console.log('找到 Membership ID:', objects[0].data.objectId);
        sessionStorage.setItem('membership-id', objects[0].data.objectId);
      } else {
        console.log('未找到 Membership ID');
        sessionStorage.removeItem('membership-id');
      }
      
      return hasNFT;
    } catch (error) {
      console.error('Error checking NFT ownership:', error);
      setHasMembership(false);
      sessionStorage.removeItem('membership-id');
      return false;
    }
  }, [currentAccount, suiClient]);

  // Find suitable coin for payment
  const findSuitableCoin = useCallback(async () => {
    if (!currentAccount || !artlier) return null;

    try {
      const price = BigInt(artlier.price);
      const { data: coins } = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: '0x2::sui::SUI'
      });

      // Find a coin with sufficient balance
      const suitableCoin = coins.find(coin => BigInt(coin.balance) >= price);
      
      if (suitableCoin) {
        // Update artlier with the selected coin ID
        setArtlier(prev => prev ? {
          ...prev,
          payment: suitableCoin.coinObjectId
        } : null);
        return suitableCoin.coinObjectId;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding suitable coin:', error);
      return null;
    }
  }, [currentAccount, artlier, suiClient]);

  // Check SUI balance and find suitable coin
  useEffect(() => {
    const checkBalanceAndCoin = async () => {
      if (!currentAccount) {
        setSuiBalance(BigInt(0));
        return;
      }

      try {
        const { totalBalance } = await suiClient.getBalance({
          owner: currentAccount.address,
          coinType: '0x2::sui::SUI'
        });

        setSuiBalance(BigInt(totalBalance));

        // If we have sufficient total balance and no payment coin selected yet, find a suitable coin
        if (artlier && BigInt(totalBalance) >= BigInt(artlier.price) && !artlier.payment) {
          await findSuitableCoin();
        }
      } catch (error) {
        console.error('Error checking SUI balance:', error);
        setSuiBalance(BigInt(0));
      }
    };

    checkBalanceAndCoin();
  }, [currentAccount, suiClient, artlier?.price]);

  // Update button state
  useEffect(() => {
    if (!currentAccount) {
      setMintButtonState({
        disabled: true,
        tooltip: 'Please connect your wallet'
      });
      return;
    }

    if (!hasMembership) {
      setMintButtonState({
        disabled: true,
        tooltip: 'Membership NFT required'
      });
      return;
    }

    if (!artlier) {
      setMintButtonState({
        disabled: true,
        tooltip: 'Loading artwork information'
      });
      return;
    }

    // Check if we have the balance information
    if (suiBalance === BigInt(0)) {
      setMintButtonState({
        disabled: true,
        tooltip: 'Loading balance information...'
      });
      return;
    }

    try {
      const price = BigInt(artlier.price);
      if (suiBalance < price) {
        const formattedPrice = (Number(price) / 1_000_000_000).toFixed(2);
        setMintButtonState({
          disabled: true,
          tooltip: `Insufficient balance`
        });
        return;
      }

      // If we have sufficient balance but no payment coin selected yet
      if (!artlier.payment) {
        setMintButtonState({
          disabled: true,
          tooltip: 'Selecting payment coin...'
        });
        return;
      }

      setMintButtonState({
        disabled: false,
        tooltip: 'Click to mint NFT'
      });
    } catch (error) {
      console.error('Error checking balance:', error);
      setMintButtonState({
        disabled: true,
        tooltip: 'Error checking price'
      });
    }
  }, [currentAccount, hasMembership, suiBalance, artlier?.price, artlier?.payment]);

  // 在組件掛載和錢包狀態改變時檢查
  useEffect(() => {
    checkMembershipNFT();
  }, [currentAccount, checkMembershipNFT]);

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

  // Scale SUI price for display
  const scaleSuiPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseInt(price) : price;
    const scaled = Math.floor(numPrice / 1_000_000_000).toString();
    return scaled;
  };

  // Convert algorithm content to ParametricViewer format
  const userScript = artlier.algorithmContent ? {
    code: artlier.algorithmContent,
    filename: 'algorithm.js'
  } : null;

  // Format address for display
  const formatAddress = (address: string) => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  // Format text with proper line breaks
  const formatText = (text: string) => {
    return text ? text.replace(/\n/g, '\n') : '';
  };

  return (
    <BaseTemplate
      workName={artlier.title}
      description={artlier.description || ''}
      price={scaleSuiPrice(artlier.price)}
      author={artlier.artistName || artlier.author}
      social={formatAddress(artlier.artistAddress || '')}
      intro={formatText(artlier.artistStatement || '')}
      imageUrl={artlier.url || ''}
      parameters={parameters}
      previewParams={previewParams}
      onParameterChange={handleParameterChange}
      onMint={handleMint}
      mintButtonState={{
        ...mintButtonState,
        tooltipComponent: mintButtonState.disabled ? (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="flex items-center gap-2">
              {!currentAccount && (
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {currentAccount && !hasMembership && (
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
              {currentAccount && hasMembership && suiBalance < BigInt(artlier?.price || 0) && (
                <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-mono text-white/90">{mintButtonState.tooltip}</span>
            </div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/90 border-r border-b border-white/10"></div>
          </div>
        ) : null
      }}
    >
      <DefaultTemplate
        workName={artlier.title}
        description={artlier.description || ''}
        price={scaleSuiPrice(artlier.price)}
        author={artlier.artistName || artlier.author}
        social={formatAddress(artlier.artistAddress || '')}
        intro={formatText(artlier.artistStatement || '')}
        imageUrl={artlier.url || ''}
        parameters={parameters}
        previewParams={previewParams}
        onParameterChange={handleParameterChange}
        onMint={handleMint}
        mintButtonState={{
          ...mintButtonState,
          tooltipComponent: mintButtonState.disabled ? (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="flex items-center gap-2">
                {!currentAccount && (
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {currentAccount && !hasMembership && (
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
                {currentAccount && hasMembership && suiBalance < BigInt(artlier?.price || 0) && (
                  <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span className="text-sm font-mono text-white/90">{mintButtonState.tooltip}</span>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/90 border-r border-b border-white/10"></div>
            </div>
          ) : null
        }}
        preview3D={
          <ParametricViewer 
            userScript={userScript} 
            parameters={previewParams}
            onSceneReady={(scene) => {
              sceneRef.current = scene;
            }}
            onRendererReady={(renderer) => {
              rendererRef.current = renderer;
            }}
            onCameraReady={(camera) => {
              cameraRef.current = camera;
            }}
          />
        }
      />
      {/* Upload and mint status notification */}
      {(uploadStatus !== 'idle' || mintStatus !== 'idle') && (
        <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
          <div className="flex flex-col gap-2">
            {/* Upload status */}
            {uploadStatus !== 'idle' && (
              <div className="flex items-center gap-3">
                {uploadStatus === 'uploading' && (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
                    <div className="absolute inset-0 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-1 bg-white/70 rounded-full animate-pulse" />
                    </div>
                  </div>
                )}
                {uploadStatus === 'success' && (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-green-500/50 rounded-full animate-pulse" />
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {uploadStatus === 'error' && (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-red-500/50 rounded-full animate-pulse" />
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-mono tracking-wider">{uploadProgress}</span>
                </div>
              </div>
            )}
            
            {/* Mint status */}
            {mintStatus !== 'idle' && (
              <div className="flex items-center gap-3">
                {mintStatus === 'preparing' && (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-white/20 rounded-full" />
                    <div className="absolute inset-0 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {mintStatus === 'minting' && (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-yellow-500/50 rounded-full animate-pulse" />
                    <div className="absolute inset-0 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {mintStatus === 'success' && (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-green-500/50 rounded-full" />
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {mintStatus === 'error' && (
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border-2 border-red-500/50 rounded-full" />
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-white/90 text-sm font-mono tracking-wider">
                    {mintStatus === 'preparing' && 'Preparing files...'}
                    {mintStatus === 'minting' && 'Minting Bottega...'}
                    {mintStatus === 'success' && 'Bottega minted successfully!'}
                    {mintStatus === 'error' && mintError}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </BaseTemplate>
  );
} 