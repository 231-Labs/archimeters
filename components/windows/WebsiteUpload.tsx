import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { useRouter } from 'next/navigation';
import type { WindowName } from '@/types';
import Toast from '../common/Toast';
import ParametricScene from '../3d/ParametricScene';

export default function WebsiteUpload() {
  const router = useRouter();

  // Image 相關狀態
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageResponse, setImageResponse] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>(''); 
  const [imageBlobId, setImageBlobId] = useState<string>(''); 
  const [imageRequired, setImageRequired] = useState(false);

  // Algorithm 相關狀態
  const [algoFile, setAlgoFile] = useState<File | null>(null);
  const [algoResponse, setAlgoResponse] = useState<string>('');
  const [isAlgoLoading, setIsAlgoLoading] = useState(false);
  const [algoError, setAlgoError] = useState<string>('');
  const [algoBlobId, setAlgoBlobId] = useState<string>(''); 
  const [algoFileName, setAlgoFileName] = useState<string | null>(null);
  
  // 解析出的參數
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

  // 網站和上傳相關狀態
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showToast, setShowToast] = useState(false);
  const [algoRequired, setAlgoRequired] = useState(false);

  // 作品相關資訊
  const [workName, setWorkName] = useState('Parametric Constellation #42');
  const [description, setDescription] = useState('A generative artwork that explores the mathematical beauty of celestial patterns. This piece dynamically responds to parameter adjustments, creating unique constellations that reflect the harmony of algorithmic art and astronomical phenomena.');
  const [price, setPrice] = useState('1024');

  // 創作者資訊
  const [name, setName] = useState('CryptoArtist#0042');
  const [social, setSocial] = useState('archimeters.lens');
  const [intro, setIntro] = useState('Digital artist exploring the intersection of mathematics and visual aesthetics through parametric art.');

  // 網站設計相關
  const [style, setStyle] = useState('dark');
  const [bgColor, setBgColor] = useState('#f9d006');
  const [fontColor, setFontColor] = useState('#1a1310');
  const [fontStyle, setFontStyle] = useState('sans');

  // 參數設定
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

  // 3D 預覽相關狀態
  const [previewParams, setPreviewParams] = useState<Record<string, any>>({});
  const [showPreview, setShowPreview] = useState(false);

  // 必填欄位驗證狀態
  const [workNameRequired, setWorkNameRequired] = useState(false);
  const [descriptionRequired, setDescriptionRequired] = useState(false);
  const [priceRequired, setPriceRequired] = useState(false);
  const [introRequired, setIntroRequired] = useState(false);
  const [priceError, setPriceError] = useState<string>('');

  // 參數設定狀態
  useEffect(() => {
    if (hasExtractedParams && Object.keys(extractedParameters).length > 0) {
      // 從解析的參數更新界面參數
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
      
      // 更新參數，但保留原始參數（如果沒有被替換的話）
      setParameters(prev => ({
        ...prev,
        ...extractedTypes,
      }));
    }
  }, [hasExtractedParams, extractedParameters]);

  // 分頁控制
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  // 檔案處理函數
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
      setAlgoRequired(false); // 清除必填錯誤狀態
      
      // 開始讀取文件內容
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          setAlgoResponse(content.substring(0, 500));
          
          // 解析參數
          processSceneFile(content);
        } catch (error) {
          setAlgoError('演算法檔案讀取失敗');
          console.error('Error reading algorithm file:', error);
        }
      };
      
      reader.onerror = () => {
        setAlgoError('演算法檔案讀取失敗');
      };
      
      reader.readAsText(selectedFile);
    }
  };

  // 處理演算法文件分析
  const processSceneFile = (code: string) => {
    try {
      // 使用正則表達式提取 defaultParameters 或 parameters
      const parametersMatch = code.match(/export\s+const\s+(?:default)?[pP]arameters\s*=\s*({[\s\S]*?})(?:\s+as\s+const)?;/);
      
      if (parametersMatch && parametersMatch[1]) {
        // 將提取的參數字符串轉換為有效的 JSON
        let paramStr = parametersMatch[1];
        
        // 1. 將屬性名稱轉換為帶雙引號的格式
        paramStr = paramStr.replace(/(\w+):/g, '"$1":');
        
        // 2. 將單引號字符串轉換為雙引號字符串
        paramStr = paramStr.replace(/'([^']*?)'/g, '"$1"');
        
        // 3. 處理尾隨逗號
        paramStr = paramStr.replace(/,(\s*[}\]])/g, '$1');
        
        console.log("Processed param string:", paramStr);
        
        // 嘗試解析 JSON
        const extractedParams = JSON.parse(paramStr);
        
        // 設置預覽參數
        const initialParams = Object.fromEntries(
          Object.entries(extractedParams).map(([key, value]: [string, any]) => [key, value.default])
        );
        setPreviewParams(initialParams);
        setShowPreview(true);
        
        setExtractedParameters(extractedParams);
        setHasExtractedParams(true);
        setAlgoError('');
      } else {
        throw new Error("無法從代碼中提取參數定義");
      }
    } catch (err) {
      console.error("處理演算法文件錯誤:", err);
      setAlgoError(`解析參數失敗: ${err instanceof Error ? err.message : String(err)}`);
      setShowPreview(false);
    }
  };

  // 更新處理演算法文件分析函數
  const handleParameterChange = (key: string, value: string | number) => {
    const paramDef = extractedParameters[key];
    if (!paramDef) return;

    let processedValue: any = value;
    if (paramDef.type === 'number') {
      processedValue = value === '' ? '' : Number(value);
      if (typeof processedValue === 'number' && isNaN(processedValue)) return;
    }

    // 更新預覽參數
    setPreviewParams(prev => ({
      ...prev,
      [key]: processedValue
    }));
  };

  const handleImageUpload = async () => {
    if (!imageFile) return { success: false, previewUrl: '' };

    setIsImageLoading(true);
    setImageError('');

    try {
      const url = URL.createObjectURL(imageFile);
      setImageUrl(url);
      setImageResponse(`預覽用 URL: ${url}`);
    } catch (error) {
      setImageError('圖片預覽生成失敗');
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
      setAlgoResponse(text.substring(0, 500)); // 預覽用的前幾行
    } catch (error) {
      setAlgoError('演算法檔案讀取失敗');
    } finally {
      setIsAlgoLoading(false);
    }
  };

  // 將圖片轉為 base64 字串
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handlePreview = async () => {
    if (!imageFile) {
      alert('請選擇圖片');
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
      bgColor: bgColor,
      fontColor: fontColor,
      parameters: parameters,
      imageUrl: base64Image,
    };

    localStorage.setItem(`preview-${id}`, JSON.stringify(templateData));
    router.push(`/preview/${id}`);
  };

  const uploadToWalrus = async (file: File): Promise<{ blobId: string }> => {
    const formData = new FormData();
    formData.append('data', file);
    formData.append('epochs', '5');

    // 傳送請求至 /api/walrus
    const response = await fetch('/api/walrus', {
      method: 'PUT',
      body: formData,
    });

    // 檢查回應是否成功
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `上傳失敗: ${response.status}`);
    }  

    const result = await response.json();
    
    // 提取 blobId 並返回
    const blobId = result?.alreadyCertified?.blobId || null;
    
    if (!blobId) throw new Error('沒有返回 blobId');

    return { blobId };
  };

  const handleConfirmUpload = async () => {
    try {
      setIsLoading(true);
      setError('');

      let imageBlobId = '';
      let algoBlobId = '';

      // 正式上傳圖片
      if (imageFile) {
        const result = await uploadToWalrus(imageFile);
        imageBlobId = result.blobId;
      }

      // 正式上傳演算法
      if (algoFile) {
        const result = await uploadToWalrus(algoFile);
        algoBlobId = result.blobId;
      }
      
      // 使用 POST 請求來生成網站模板
      const templateData = {
        workName: workName || 'NoName',
        description: description,
        price: price || '0',
        author: name || 'Anonymous',
        social: social,
        intro: intro,
        imageBlobId: imageBlobId,
        algoBlobId: algoBlobId,
        style: style,
        bgColor: bgColor,
        fontColor: fontColor,
        parameters: parameters,
      };
      
      const response = await fetch('/api/walrus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `網站模板生成失敗: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setShowToast(true);
      } else {
        throw new Error('沒有返回預覽 URL');
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : '網站模板生成失敗');
      alert('網站模板生成失敗，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  // 分頁導航
  const goToNextPage = () => {
    if (currentPage === 1) {
      // 檢查第一頁所有必填欄位
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
    
    if (currentPage < totalPages) {
      // 清除所有錯誤狀態
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

  // 處理價格輸入
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允許輸入數字
    if (value === '' || /^\d+$/.test(value)) {
      setPrice(value);
      setPriceRequired(false);
      setPriceError('');
    }
  };

  // 渲染不同頁面的函數
  const renderPageOne = () => (
    <div className="flex h-full">
      {/* 左側 - 基本資訊 */}
      <div className="w-1/2 p-8 border-r border-white/5">
        <div className="max-w-lg space-y-12">
          {/* 作品名稱區 */}
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

          {/* 作品描述區 */}
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

          {/* 創作者資訊區 */}
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

          {/* 作品價格 */}
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

      {/* 右側 - 主視覺圖上傳 */}
      <div className="w-1/2 p-8 flex flex-col">
        <div className="text-white/50 text-sm mb-4 mt-[12px]">Main Visual</div>
        <div className="h-[calc(100vh-320px)] group relative">
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
      {/* 左側 - 演算法上傳和預覽 */}
      <div className="w-2/3 p-8 border-r border-white/5">
        <div className="text-white/50 text-sm mb-4">Algorithm File</div>
        <div className="h-[calc(100vh-280px)] group relative">
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

      {/* 右側 - 參數設定 */}
      <div className="w-1/3 p-8">
        <div className="space-y-8">
          {/* 參數列表 */}
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

          {/* 網站設計選項 */}
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
    <div className="h-full bg-black text-white overflow-auto hide-scrollbar">
      {/* Grid overlay */}
      <div className="fixed inset-0 bg-[url('/grid.png')] opacity-[0.03] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      <div className="relative min-h-full max-w-[1800px] mx-auto p-6 pb-24 flex flex-col">
        <header className="mb-6 relative text-center">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-32 h-32">
            <div className="absolute inset-0 border border-white/10 rounded-sm"></div>
            <div className="absolute inset-4 border border-white/5 rounded-sm"></div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/80">
              {workName}
            </span>
          </h1>
          <p className="text-base text-white/40 font-normal tracking-[0.5em] uppercase">
            by {name} | @{social}
          </p>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="h-px mt-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* 左側 - 3D展示區 */}
          <div className="lg:w-[55%] flex flex-col gap-4">
            {/* 3D預覽 */}
            <div className="flex-1 relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10 min-h-[500px]">
              <div className="relative bg-black/50 backdrop-blur-sm p-6 h-full">
                <div className="absolute left-0 top-0 w-6 h-6 border-l border-t border-white/20"></div>
                <div className="absolute right-0 top-0 w-6 h-6 border-r border-t border-white/20"></div>
                <div className="absolute left-0 bottom-0 w-6 h-6 border-l border-b border-white/20"></div>
                <div className="absolute right-0 bottom-0 w-6 h-6 border-r border-b border-white/20"></div>

                <div className="relative h-full bg-black/70 border border-white/10">
                  {showPreview && Object.keys(previewParams).length > 0 ? (
                    <ParametricScene parameters={previewParams} />
                  ) : null}
                </div>
              </div>
            </div>

            {/* 作品資訊 */}
            <div className="relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10">
              <div className="relative bg-black/50 backdrop-blur-sm p-6">
                <div className="space-y-6">
                  {/* 作品描述和主視覺圖 */}
                  <div className="flex gap-6">
                    {/* 主視覺圖 */}
                    <div className="w-1/2">
                      <div className="relative aspect-square bg-black/70 border border-white/10 overflow-hidden">
                        {imageUrl && (
                          <div className="relative group h-full">
                            <img 
                              src={imageUrl} 
                              alt={workName}
                              className="w-full h-full object-contain transition-all duration-1000 group-hover:contrast-125 group-hover:brightness-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 作品描述 */}
                    <div className="w-1/2">
                      <h2 className="text-lg font-semibold mb-2 text-white/90">Artwork Description</h2>
                      <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
                        {description}
                      </p>
                    </div>
                  </div>

                  {/* 藝術家介紹 */}
                  <div className="border-t border-white/10 pt-6">
                    <h2 className="text-lg font-semibold mb-2 text-white/90">Artist Statement</h2>
                    <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
                      {intro}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右側 - 參數調整和Mint區 */}
          <div className="lg:w-[45%] flex flex-col gap-4">
            {/* 參數設定 */}
            <div className="relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10">
              <div className="relative bg-black/50 backdrop-blur-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white/90">Parameters</h2>
                  <button 
                    onClick={() => {
                      const defaultParams = Object.fromEntries(
                        Object.entries(extractedParameters).map(([key, value]) => [key, value.default])
                      );
                      setPreviewParams(defaultParams);
                    }}
                    className="text-sm text-white/50 hover:text-white/70 transition-colors"
                  >
                    Reset All
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(extractedParameters).map(([key, paramDef]) => (
                    <div key={key} className="bg-white/5 rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-white/60 capitalize text-sm">{paramDef.label || key}</div>
                        <button 
                          className="text-xs text-white/40 hover:text-white/60 transition-colors"
                          onClick={() => handleParameterChange(key, paramDef.default)}
                        >
                          Reset
                        </button>
                      </div>
                      {paramDef.type === 'number' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="range"
                              min={paramDef.min || 0}
                              max={paramDef.max || 100}
                              step={paramDef.step || 1}
                              value={previewParams[key] ?? paramDef.default}
                              onChange={(e) => handleParameterChange(key, e.target.value)}
                              className="flex-1 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                            />
                            <input
                              type="number"
                              value={previewParams[key] ?? paramDef.default}
                              onChange={(e) => {
                                const value = e.target.value === '' ? '' : Number(e.target.value);
                                handleParameterChange(key, value);
                              }}
                              className="w-14 bg-black/30 text-white/90 text-right text-sm p-1 rounded border border-white/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-white/30">
                            <span>{paramDef.min || 0}</span>
                            <span>{paramDef.max || 100}</span>
                          </div>
                        </div>
                      ) : paramDef.type === 'color' ? (
                        <div className="flex items-center gap-2 relative group">
                          <button
                            className="w-6 h-6 rounded relative overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors"
                            onClick={(e) => {
                              const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                              input?.click();
                            }}
                          >
                            <div className="absolute inset-0" style={{ backgroundColor: previewParams[key] || paramDef.default }}></div>
                          </button>
                          <input
                            type="color"
                            value={previewParams[key] || paramDef.default}
                            onChange={(e) => handleParameterChange(key, e.target.value)}
                            className="absolute opacity-0 pointer-events-none"
                          />
                          <input
                            type="text"
                            value={previewParams[key] || paramDef.default}
                            onChange={(e) => handleParameterChange(key, e.target.value)}
                            className="flex-1 bg-black/30 text-white/90 text-sm p-1 rounded border border-white/10 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                          />
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={previewParams[key] || paramDef.default}
                          onChange={(e) => handleParameterChange(key, e.target.value)}
                          className="w-full bg-black/30 text-white/90 text-sm p-1 rounded border border-white/10 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* NFT Minting Area */}
            <div className="relative p-[1px] bg-gradient-to-r from-white/10 via-white/5 to-white/10">
              <div className="relative bg-black/50 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white/60 mb-1">Price</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-light text-white/90">φ</span>
                      <span className="text-3xl font-light bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/80">
                        {price}
                      </span>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500/50 via-blue-500/50 to-indigo-500/50 rounded-sm opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <button className="relative px-8 py-3 bg-black rounded-sm">
                      <div className="flex flex-col items-center">
                        <span className="text-base font-light text-white/90 group-hover:text-white transition-colors">Mint NFT</span>
                        <span className="text-[10px] text-white/40 group-hover:text-white/60 transition-colors">Initialize Artwork</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 導航按鈕 */}
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

      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
        }
        input[type="color"] {
          -webkit-appearance: none;
          border: none;
        }
        input[type="color"]::-webkit-color-swatch-wrapper {
          padding: 0;
        }
        input[type="color"]::-webkit-color-swatch {
          border: none;
          border-radius: 4px;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );

  return (
    <div className="h-full w-full bg-[rgba(10,10,10,0.3)]">
      {/* 頁面內容 */}
      <div className="h-full relative">
        {currentPage === 1 && renderPageOne()}
        {currentPage === 2 && renderPageTwo()}
        {currentPage === 3 && renderPageThree()}

        {/* 導航按鈕 */}
        <div className="absolute bottom-8 right-6 flex gap-2">
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
      </div>
      
      <Toast
        message="網站上傳成功！"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}