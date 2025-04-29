import { useEffect, useState, useCallback, useRef } from 'react';
import type { WindowName } from '@/types';
import BaseTemplate from '@/components/templates/BaseTemplate';
import DefaultTemplate from '@/components/templates/DefaultTemplate';
import { ParametricViewer } from '@/components/features/design-publisher/components/pages/ParametricViewer';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import * as THREE from 'three';

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
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);

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

  // Export current 3D model as STL and upload to Walrus
  const handleExportSTL = useCallback(async () => {
    if (!artlier?.algorithmContent || !sceneRef.current) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress('Generating STL file...');

      // Collect all meshes from the current scene
      const meshes: THREE.Mesh[] = [];
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          meshes.push(object);
        }
      });

      if (meshes.length === 0) {
        throw new Error('No mesh found in scene');
      }

      // Create a new scene for export
      const exportScene = new THREE.Scene();
      
      // Process each mesh
      meshes.forEach(mesh => {
        // Clone mesh to avoid modifying the original scene
        const clonedMesh = mesh.clone();
        
        // Ensure mesh is watertight
        if (clonedMesh.geometry instanceof THREE.BufferGeometry) {
          // Compute vertex normals
          clonedMesh.geometry.computeVertexNormals();
          
          // Ensure faces are double-sided
          if (clonedMesh.material instanceof THREE.Material) {
            clonedMesh.material.side = THREE.DoubleSide;
          }
        }
        
        // Add to export scene
        exportScene.add(clonedMesh);
      });

      // Create STL exporter
      const exporter = new STLExporter();
      const stlString = exporter.parse(exportScene, { binary: false });

      // Create file from STL data
      const blob = new Blob([stlString], { type: 'application/octet-stream' });
      const file = new File([blob], `${artlier.title}_${Date.now()}.stl`, { type: 'application/octet-stream' });

      setUploadProgress('Uploading STL file to Walrus...');

      // Upload to Walrus
      const formData = new FormData();
      formData.append('data', file);
      formData.append('epochs', '5');

      const response = await fetch('/api/walrus', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (err) {
        throw new Error('Failed to parse response JSON');
      }

      let blobId = null;
      if (result?.alreadyCertified?.blobId) {
        blobId = result.alreadyCertified.blobId;
      } else if (result?.newlyCreated?.blobObject?.blobId) {
        blobId = result.newlyCreated.blobObject.blobId;
      }

      if (!blobId) {
        throw new Error('No valid blobId returned');
      }

      console.log('STL file uploaded successfully, blobId:', blobId);
      setUploadStatus('success');
      setUploadProgress('STL file uploaded successfully!');

      // Commented out download functionality for future use
      /*
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${artlier.title}_${Date.now()}.stl`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      */

    } catch (error) {
      console.error('Error exporting/uploading STL:', error);
      setError('Failed to export/upload STL file');
      setUploadStatus('error');
      setUploadProgress('Upload failed');
    }
  }, [artlier]);

  // Capture and upload screenshot
  const handleScreenshot = useCallback(async () => {
    if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !artlier) return;

    try {
      setUploadStatus('uploading');
      setUploadProgress('Capturing screenshot...');

      // 確保場景已經渲染完成
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // 等待一幀以確保渲染完成
      await new Promise(requestAnimationFrame);
      
      // 捕獲截圖
      const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
      
      // 創建下載連結
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${artlier.title}_screenshot_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setUploadStatus('success');
      setUploadProgress('Screenshot saved successfully!');

    } catch (error) {
      console.error('Error capturing screenshot:', error);
      setError('Failed to capture screenshot');
      setUploadStatus('error');
      setUploadProgress('Capture failed');
    }
  }, [artlier]);

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
      onMint={async () => {
        await handleScreenshot();
        await handleExportSTL();
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
        onMint={async () => {
          await handleScreenshot();
          await handleExportSTL();
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
      {/* Upload status notification */}
      {uploadStatus !== 'idle' && (
        <div className="fixed bottom-4 right-4 bg-black/90 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg">
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
              {uploadStatus === 'uploading' && (
                <span className="text-white/40 text-xs font-mono tracking-wider mt-0.5">
                  {uploadProgress === 'Generating STL file...' ? 'PROCESSING' : 'UPLOADING'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </BaseTemplate>
  );
} 