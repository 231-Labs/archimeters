import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Toast from '../common/Toast';
import ParametricScene from '../3d/ParametricScene';
import BaseTemplate from '../templates/BaseTemplate';
import DefaultTemplate from '../templates/DefaultTemplate';

export default function WebsiteUpload() {
  const router = useRouter();

  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageResponse, setImageResponse] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>(''); 
  const [imageRequired, setImageRequired] = useState(false);

  // Algorithm states
  const [algoFile, setAlgoFile] = useState<File | null>(null);
  const [algoResponse, setAlgoResponse] = useState<string>('');
  const [isAlgoLoading, setIsAlgoLoading] = useState(false);
  const [algoError, setAlgoError] = useState<string>('');
  const [algoFileName, setAlgoFileName] = useState<string | null>(null);
  
  // Parameter definitions
  interface CustomParameterDef {
    type: string;
    default: any;
    label: string;
    [key: string]: any;
  }

  interface CustomParameters {
    [key: string]: CustomParameterDef;
  }
  
  const [extractedParameters, setExtractedParameters] = useState<CustomParameters>({});
  const [hasExtractedParams, setHasExtractedParams] = useState(false);

  // Upload states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [algoRequired, setAlgoRequired] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    image: 'pending' | 'uploading' | 'success' | 'error';
    algo: 'pending' | 'uploading' | 'success' | 'error';
  }>({
    image: 'pending',
    algo: 'pending'
  });

  // Artwork info
  const [workName, setWorkName] = useState('Parametric Constellation #42');
  const [description, setDescription] = useState('A generative artwork exploring celestial patterns through mathematical algorithms. Parameters can be adjusted to create unique constellations.');
  const [price, setPrice] = useState('1024');

  // Artist info
  const [name, setName] = useState('CryptoArtist#0042');
  const [social, setSocial] = useState('archimeters.lens');
  const [intro, setIntro] = useState('Digital artist exploring the intersection of mathematics and visual aesthetics through parametric art.');

  // Design settings
  const [style, setStyle] = useState('dark');
  const [fontStyle, setFontStyle] = useState('sans');

  // Parameter types
  type ParameterType = {
    amplitude: React.HTMLInputTypeAttribute;
    frequency: React.HTMLInputTypeAttribute;
    resolution: React.HTMLInputTypeAttribute;
  };
  
  const [parameters, setParameters] = useState<ParameterType>({
    amplitude: 'range',
    frequency: 'range',
    resolution: 'range',
  });

  // 3D preview states
  const [previewParams, setPreviewParams] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);

  // Validation states
  const [workNameRequired, setWorkNameRequired] = useState(false);
  const [descriptionRequired, setDescriptionRequired] = useState(false);
  const [priceRequired, setPriceRequired] = useState(false);
  const [introRequired, setIntroRequired] = useState(false);
  const [priceError, setPriceError] = useState<string>('');

  // Page control
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  // Upload results
  const [uploadResults, setUploadResults] = useState<{
    imageBlobId: string;
    algoBlobId: string;
    success: boolean;
    error?: string;
  } | null>(null);

  // Parameter type mapping
  useEffect(() => {
    if (hasExtractedParams && Object.keys(extractedParameters).length > 0) {
      const extractedTypes: Record<string, React.HTMLInputTypeAttribute> = {};
      
      Object.entries(extractedParameters).forEach(([key, paramDef]) => {
        if (paramDef.type === 'number') {
          extractedTypes[key] = 'range';
        } else if (paramDef.type === 'color') {
          extractedTypes[key] = 'color';
        } else {
          extractedTypes[key] = 'select';
        }
      });
      
      setParameters(prev => ({
        ...prev,
        ...extractedTypes,
      }));
    }
  }, [hasExtractedParams, extractedParameters]);

  // File handlers
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setImageFile(selectedFile);
      setImageUrl(url);
      setImageRequired(false);
    }
  };

  const handleAlgoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setAlgoFile(selectedFile);
      setAlgoFileName(selectedFile.name);
      setHasExtractedParams(false);
      setAlgoError('');
      setAlgoRequired(false);
      
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          setAlgoResponse(content.substring(0, 500));
          processSceneFile(content);
        } catch (error) {
          setAlgoError('Failed to read algorithm file');
          console.error('Error reading algorithm file:', error);
        }
      };
      
      reader.onerror = () => {
        setAlgoError('Failed to read algorithm file');
      };
      
      reader.readAsText(selectedFile);
    }
  };

  // Algorithm file processing
  const processSceneFile = (code: string) => {
    try {
      const parametersMatch = code.match(/export\s+const\s+(?:default)?[pP]arameters\s*=\s*({[\s\S]*?})(?:\s+as\s+const)?;/);
      
      if (parametersMatch && parametersMatch[1]) {
        let paramStr = parametersMatch[1];
        paramStr = paramStr.replace(/(\w+):/g, '"$1":');
        paramStr = paramStr.replace(/'([^']*?)'/g, '"$1"');
        paramStr = paramStr.replace(/,(\s*[}\]])/g, '$1');
        
        console.log("Processed param string:", paramStr);
        
        const extractedParams = JSON.parse(paramStr);
        
        const initialParams = Object.fromEntries(
          Object.entries(extractedParams).map(([key, value]: [string, any]) => [key, value.default])
        );
        setPreviewParams(initialParams);
        setShowPreview(true);
        
        setExtractedParameters(extractedParams);
        setHasExtractedParams(true);
        setAlgoError('');
      } else {
        throw new Error("Failed to extract parameters from code");
      }
    } catch (err) {
      console.error("Error processing algorithm file:", err);
      setAlgoError(`Parameter parsing failed: ${err instanceof Error ? err.message : String(err)}`);
      setShowPreview(false);
    }
  };

  // Parameter change handler
  const handleParameterChange = (key: string, value: string | number) => {
    const paramDef = extractedParameters[key];
    if (!paramDef) return;

    let processedValue: any = value;
    if (paramDef.type === 'number') {
      processedValue = value === '' ? '' : Number(value);
      if (typeof processedValue === 'number' && isNaN(processedValue)) return;
    }

    setPreviewParams(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  // File upload handlers
  const handleImageUpload = async () => {
    if (!imageFile) return { success: false, previewUrl: '' };

    setIsImageLoading(true);
    setImageError('');

    try {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      setImageResponse(`Preview URL: ${url}`);
    } catch (error) {
      setImageError('Failed to generate image preview');
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleAlgoUpload = async () => {
    if (!algoFile) return { success: false, previewUrl: '' };

    setIsAlgoLoading(true);
    setAlgoError('');

    try {
      const text = await algoFile.text();
      setAlgoResponse(text.substring(0, 500));
    } catch (error) {
      setAlgoError('Failed to read algorithm file');
    } finally {
      setIsAlgoLoading(false);
    }
  };

  // File conversion utilities
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Preview handler
  const handlePreview = async () => {
    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    const base64Image = await fileToBase64(imageFile);

    const id = '1234';
    const templateData = {
      workName: workName || 'NoName',
      description: description,
      price: price || '0',
      author: name || 'Anonymous',
      social: social,
      intro: intro,
      style: style,
      bgColor: '#f9d006',
      fontColor: '#1a1310',
      parameters: parameters,
      imageUrl: base64Image,
    };

    localStorage.setItem(`preview-${id}`, JSON.stringify(templateData));
    router.push(`/preview/${id}`);
  };

  // Upload to Walrus
  const uploadToWalrus = async (file: File): Promise<{ blobId: string }> => {
    const formData = new FormData();
    formData.append('data', file);
    formData.append('epochs', '5');

    const response = await fetch('/api/walrus', {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed: ${response.status}`);
    }  

    const result = await response.json();
    const blobId = result?.alreadyCertified?.blobId || null;
    
    if (!blobId) throw new Error('No blobId returned');

    return { blobId };
  };

  // Upload confirmation handler
  const handleConfirmUpload = async () => {
    try {
      setIsLoading(true);
      setError('');

      if (!imageFile || !algoFile) {
        throw new Error('Both image and algorithm files are required');
      }

      // 更新上傳狀態
      setUploadStatus({
        image: 'uploading',
        algo: 'uploading'
      });

      // 同時上傳兩個檔案
      const [imageResult, algoResult] = await Promise.all([
        uploadToWalrus(imageFile).then(result => {
          setUploadStatus(prev => ({ ...prev, image: 'success' }));
          return result;
        }).catch(error => {
          setUploadStatus(prev => ({ ...prev, image: 'error' }));
          throw error;
        }),
        uploadToWalrus(algoFile).then(result => {
          setUploadStatus(prev => ({ ...prev, algo: 'success' }));
          return result;
        }).catch(error => {
          setUploadStatus(prev => ({ ...prev, algo: 'error' }));
          throw error;
        })
      ]);

      setUploadResults({
        imageBlobId: imageResult.blobId,
        algoBlobId: algoResult.blobId,
        success: true
      });

      setShowToast(true);
      
    } catch (error) {
      setUploadResults({
        imageBlobId: '',
        algoBlobId: '',
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      });
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Page navigation
  const goToNextPage = () => {
    if (currentPage === 1) {
      let hasError = false;
      
      if (!workName.trim()) {
        setWorkNameRequired(true);
        hasError = true;
      }
      
      if (!description.trim()) {
        setDescriptionRequired(true);
        hasError = true;
      }
      
      if (!price.trim()) {
        setPriceRequired(true);
        setPriceError('Artwork price is required');
        hasError = true;
      } else if (!/^\d+$/.test(price)) {
        setPriceRequired(true);
        setPriceError('Please enter a valid number');
        hasError = true;
      }
      
      if (!intro.trim()) {
        setIntroRequired(true);
        hasError = true;
      }
      
      if (!imageFile) {
        setImageRequired(true);
        hasError = true;
      }

      if (hasError) {
        return;
      }
    }

    if (currentPage === 2 && !algoFile) {
      setAlgoRequired(true);
      return;
    }

    if (currentPage === 3) {
      setCurrentPage(4);
      handleConfirmUpload();
      return;
    }
    
    if (currentPage < totalPages) {
      setWorkNameRequired(false);
      setDescriptionRequired(false);
      setPriceRequired(false);
      setIntroRequired(false);
      setImageRequired(false);
      setAlgoRequired(false);
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Price input handler
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setPrice(value);
      setPriceRequired(false);
      setPriceError('');
    }
  };

  // Page renderers
  const renderPageOne = () => (
    <div className="flex h-full">
      {/* Left - Basic Info */}
      <div className="w-1/2 p-8 border-r border-white/5">
        <div className="max-w-lg space-y-12">
          {/* Artwork Title */}
          <div>
            <input
              value={workName}
              onChange={(e) => {
                setWorkName(e.target.value);
                setWorkNameRequired(false);
              }}
              className={`w-full bg-transparent text-white text-3xl font-light border-b ${workNameRequired ? 'border-red-400' : 'border-white/20'} pb-2 focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20`}
              placeholder="Enter artwork title..."
            />
            {workNameRequired && (
              <div className="mt-2 text-red-400 text-sm">
                Artwork title is required
              </div>
            )}
          </div>

          {/* Artwork Description */}
          <div>
            <div className="text-white/50 text-sm mb-3">Artwork Description</div>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setDescriptionRequired(false);
              }}
              className={`w-full h-32 bg-transparent text-white/90 focus:outline-none resize-none placeholder:text-white/20 border-b ${descriptionRequired ? 'border-red-400' : 'border-white/20'}`}
              placeholder="Describe your artwork and creative concept..."
            />
            {descriptionRequired && (
              <div className="mt-2 text-red-400 text-sm">
                Artwork description is required
              </div>
            )}
          </div>

          {/* Artist Info */}
          <div className="space-y-4">
            <div className="text-white/50 text-sm mb-1">Artist Information</div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 text-white/90 pb-2">
                {name}
              </div>
              <span className="text-white/30">|</span>
              <div className="flex items-center flex-1">
                <span className="text-white/50 mr-2">@</span>
                <div className="text-white/90 pb-2">
                  {social}
                </div>
              </div>
            </div>
            <textarea
              value={intro}
              onChange={(e) => {
                setIntro(e.target.value);
                setIntroRequired(false);
              }}
              className={`w-full h-24 bg-transparent text-white/90 focus:outline-none resize-none placeholder:text-white/20 border-b ${introRequired ? 'border-red-400' : 'border-white/20'}`}
              placeholder="Introduce yourself as an artist..."
            />
            {introRequired && (
              <div className="mt-2 text-red-400 text-sm">
                Artist introduction is required
              </div>
            )}
          </div>

          {/* Artwork Price */}
          <div className="-mt-12">
            <div className="text-white/50 text-sm mb-3">Artwork Price</div>
            <div className="flex items-center">
              <span className="text-white/50 text-xl mr-3">φ</span>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={price}
                onChange={handlePriceChange}
                className={`flex-1 bg-transparent text-white text-xl border-b ${priceRequired ? 'border-red-400' : 'border-white/20'} pb-2 focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20`}
                placeholder="Set artwork price..."
              />
            </div>
            {priceError && (
              <div className="mt-2 text-red-400 text-sm">
                {priceError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right - Main Visual Upload */}
      <div className="w-1/2 p-8 flex flex-col">
        <div className="text-white/50 text-sm mb-4 mt-[12px]">Main Visual</div>
        <div className="h-[calc(100vh-480px)] group relative">
          <input
            type="file"
            onChange={(e) => {
              handleImageFileChange(e);
              setImageRequired(false);
            }}
            className="w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
          />
          <div className={`h-full border border-dashed ${imageRequired ? 'border-red-400' : 'border-white/20'} rounded-lg flex items-center justify-center ${!imageRequired && 'group-hover:border-white/40'} transition-colors`}>
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
            ) : (
              <div className="text-center">
                <div className={`text-4xl mb-3 ${imageRequired ? 'text-red-400' : 'text-white/40'}`}>+</div>
                <div className={`text-sm ${imageRequired ? 'text-red-400' : 'text-white/40'}`}>
                  {imageRequired ? 'Main visual is required' : 'Click or drag to upload image'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPageTwo = () => (
    <div className="flex h-full">
      {/* Left - Algorithm Upload and Preview */}
      <div className="w-2/3 p-8 border-r border-white/5">
        <div className="text-white/50 text-sm mb-4">Algorithm File</div>
        <div className="h-[calc(100vh-480px)] group relative">
          {showPreview && Object.keys(previewParams).length > 0 ? (
            <div className="h-full rounded-lg overflow-hidden bg-black/30">
              <ParametricScene parameters={previewParams} />
            </div>
          ) : (
            <>
              <input
                type="file"
                onChange={handleAlgoFileChange}
                className="w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
              />
              <div className={`h-full border border-dashed ${algoRequired ? 'border-red-400' : 'border-white/20'} rounded-lg flex items-center justify-center ${!algoRequired && 'group-hover:border-white/40'} transition-colors`}>
                {algoFile ? (
                  <pre className="p-6 w-full h-full overflow-auto text-sm text-white/80 font-mono">
                    {algoResponse || '// Processing...'}
                  </pre>
                ) : (
                  <div className="text-center">
                    <div className={`text-4xl mb-3 ${algoRequired ? 'text-red-400' : 'text-white/40'}`}>+</div>
                    <div className={`text-sm ${algoRequired ? 'text-red-400' : 'text-white/40'}`}>
                      {algoRequired ? 'Algorithm file is required' : 'Click or drag to upload algorithm'}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          {algoError && (
            <div className="mt-2 text-red-400 text-sm">
              <span className="font-mono">Error: </span>{algoError}
            </div>
          )}
        </div>
      </div>

      {/* Right - Parameter Settings */}
      <div className="w-1/3 p-8">
        <div className="space-y-8">
          {/* Parameter List */}
          {hasExtractedParams && (
            <div className="space-y-4">
              <div className="text-white/50 text-sm">Algorithm Parameters</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.entries(extractedParameters).map(([key, paramDef]) => (
                  <div key={key} className="bg-white/5 rounded-md p-3">
                    <div className="text-white/60 mb-1 capitalize">{paramDef.label || key}</div>
                    <div className="text-white font-mono">
                      {typeof paramDef.default === 'object' 
                        ? JSON.stringify(paramDef.default) 
                        : paramDef.default}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Design Options */}
          <div className="space-y-4">
            <div>
              <label className="text-white/60 text-sm block mb-2">Page Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full bg-transparent text-white border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
                <option value="minimal">Minimal</option>
                <option value="elegant">Elegant</option>
              </select>
            </div>

            <div>
              <label className="text-white/60 text-sm block mb-2">Font Style</label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full bg-transparent text-white border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
              >
                <option value="sans">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="mono">Monospace</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPageThree = () => (
    <BaseTemplate
      workName={workName}
      description={description}
      price={price}
      author={name}
      social={social}
      intro={intro}
      imageUrl={imageUrl}
      parameters={extractedParameters}
      previewParams={previewParams}
      onParameterChange={handleParameterChange}
      onMint={handleConfirmUpload}
    >
      <DefaultTemplate
        workName={workName}
        description={description}
        price={price}
        author={name}
        social={social}
        intro={intro}
        imageUrl={imageUrl}
        parameters={extractedParameters}
        previewParams={previewParams}
        onParameterChange={handleParameterChange}
        onMint={handleConfirmUpload}
      />
    </BaseTemplate>
  );

  const renderPageFour = () => {
    const getStatusIcon = (status: 'pending' | 'uploading' | 'success' | 'error') => {
      switch (status) {
        case 'pending':
          return '○';
        case 'uploading':
          return '◎';
        case 'success':
          return '●';
        case 'error':
          return '×';
      }
    };

    const getStatusColor = (status: 'pending' | 'uploading' | 'success' | 'error') => {
      switch (status) {
        case 'pending':
          return 'text-white/30';
        case 'uploading':
          return 'text-white/60';
        case 'success':
          return 'text-green-400';
        case 'error':
          return 'text-red-400';
      }
    };

    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-2xl p-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl text-white/90 mb-3">
              {isLoading ? 'Uploading to Walrus Network' : (uploadResults?.success ? 'Upload Complete!' : 'Upload Failed')}
            </h2>
            <p className="text-white/60">
              {isLoading ? 'Please wait while your files are being processed...' : (
                uploadResults?.success 
                  ? 'Your artwork has been successfully uploaded to the Walrus Network'
                  : 'An error occurred during the upload process, please try again'
              )}
            </p>
          </div>

          <div className="space-y-6">
            {/* Upload Status Indicators */}
            <div className="space-y-4">
              <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${uploadStatus.image === 'error' ? 'bg-red-900/20' : 'bg-white/5'}`}>
                <div className="flex items-center space-x-3">
                  <span className={`text-xl ${getStatusColor(uploadStatus.image)}`}>
                    {getStatusIcon(uploadStatus.image)}
                  </span>
                  <span className="text-white/90">Image File</span>
                </div>
                <div className="text-right">
                  {uploadStatus.image === 'success' && uploadResults?.imageBlobId && (
                    <div className="text-xs font-mono text-white/50">
                      {uploadResults.imageBlobId}
                    </div>
                  )}
                </div>
              </div>

              <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${uploadStatus.algo === 'error' ? 'bg-red-900/20' : 'bg-white/5'}`}>
                <div className="flex items-center space-x-3">
                  <span className={`text-xl ${getStatusColor(uploadStatus.algo)}`}>
                    {getStatusIcon(uploadStatus.algo)}
                  </span>
                  <span className="text-white/90">Algorithm File</span>
                </div>
                <div className="text-right">
                  {uploadStatus.algo === 'success' && uploadResults?.algoBlobId && (
                    <div className="text-xs font-mono text-white/50">
                      {uploadResults.algoBlobId}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {uploadResults?.error && (
              <div className="bg-red-900/20 p-4 rounded-lg">
                <div className="text-red-400">
                  {uploadResults.error}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isLoading && (
              <div className="flex justify-center mt-8 space-x-4">
                {uploadResults?.success ? (
                  <button
                    onClick={() => setCurrentPage(1)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg transition-colors"
                  >
                    Back to Home
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setCurrentPage(3)}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg transition-colors"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleConfirmUpload}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50 text-white/90 rounded-lg hover:from-blue-500/60 hover:via-indigo-500/60 hover:to-purple-500/60 transition-colors"
                    >
                      Retry Upload
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Navigation buttons component
  const NavigationButtons = () => (
    <div className="fixed bottom-8 right-6 flex gap-2">
      {currentPage > 1 && (
        <button 
          onClick={goToPreviousPage}
          className="group relative w-7 h-7 flex items-center justify-center"
        >
          <div className="absolute inset-0 border border-white/10 rotate-45 group-hover:border-white/20 transition-colors" />
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors" />
          <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors">←</span>
        </button>
      )}
      {currentPage < totalPages && (
        <button 
          onClick={goToNextPage}
          className="group relative w-7 h-7 flex items-center justify-center"
        >
          <div className="absolute inset-0 border border-white/10 rotate-45 group-hover:border-white/20 transition-colors" />
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors" />
          <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors">→</span>
        </button>
      )}
      {currentPage === totalPages && (
        <button 
          onClick={handleConfirmUpload}
          className="group relative w-7 h-7 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50 rounded-sm blur-sm transition-all duration-500 group-hover:blur-md"></div>
          <div className="absolute inset-0 border border-white/10 rotate-45 group-hover:border-white/20 transition-colors"></div>
          <div className="absolute inset-[1px] bg-[rgba(20,20,20,0.8)] rotate-45 group-hover:bg-[rgba(30,30,30,0.8)] transition-colors"></div>
          <span className="relative text-sm text-white/70 group-hover:text-white/90 transition-colors">✓</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="h-full w-full bg-[rgba(10,10,10,0.3)]">
      {/* Page content */}
      <div className="h-full relative">
        {currentPage === 1 && renderPageOne()}
        {currentPage === 2 && renderPageTwo()}
        {currentPage === 3 && renderPageThree()}
        {currentPage === 4 && renderPageFour()}
        <NavigationButtons />
      </div>
      
      <Toast
        message="Website uploaded successfully!"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}