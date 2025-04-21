import { useState } from 'react';
import Button from '../common/Button';
import { useRouter } from 'next/navigation';
import type { WindowName } from '@/types';
import Toast from '../common/Toast';

export default function WebsiteUpload() {
  const router = useRouter();

  // Image 相關狀態
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageResponse, setImageResponse] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>(''); 
  const [imageBlobId, setImageBlobId] = useState<string>(''); 

  // Algorithm 相關狀態
  const [algoFile, setAlgoFile] = useState<File | null>(null);
  const [algoResponse, setAlgoResponse] = useState<string>('');
  const [isAlgoLoading, setIsAlgoLoading] = useState(false);
  const [algoError, setAlgoError] = useState<string>('');
  const [algoBlobId, setAlgoBlobId] = useState<string>(''); 

  // 網站和上傳相關狀態
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showToast, setShowToast] = useState(false);

  // 作品相關資訊
  const [workName, setWorkName] = useState('Celestial Harmonics');
  const [description, setDescription] = useState('A quantum visualization that explores the delicate balance between chaos and order. Each pixel represents a node in the cosmic network, rendered through quantum calculations that mirror the fundamental patterns of existence.');
  const [price, setPrice] = useState('1024');

  // 創作者資訊
  const [name, setName] = useState('Artemis Stellarwind');
  const [social, setSocial] = useState('stellarwind.cosmos');
  const [intro, setIntro] = useState("Quantum mathematician and digital artist exploring the intersection of universal constants and visual expression. Creating windows into dimensions beyond human perception.");

  // 網站設計相關
  const [style, setStyle] = useState('dark');
  const [bgColor, setBgColor] = useState('#f9d006');
  const [fontColor, setFontColor] = useState('#1a1310');

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
    }
  };

  const handleAlgoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setAlgoFile(selectedFile);
    }
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
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
              onChange={(e) => setWorkName(e.target.value)}
              className="w-full bg-transparent text-white text-3xl font-light border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
              placeholder="Enter artifact designation..."
            />
          </div>

          {/* 作品描述區 */}
          <div>
            <div className="text-white/50 text-sm mb-3">Quantum Description</div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-32 bg-transparent text-white/90 focus:outline-none resize-none"
              placeholder="Describe the quantum nature of your artifact..."
            />
          </div>

          {/* 創作者資訊區 */}
          <div className="space-y-4">
            <div className="text-white/50 text-sm mb-1">Creator Information</div>
            <div className="flex items-center space-x-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-transparent text-white border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
                placeholder="Quantum signature"
              />
              <span className="text-white/30">|</span>
              <div className="flex items-center flex-1">
                <span className="text-white/50 mr-2">@</span>
                <input
                  value={social}
                  onChange={(e) => setSocial(e.target.value)}
                  className="flex-1 bg-transparent text-white border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
                  placeholder="Coordinates"
                />
              </div>
            </div>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              className="w-full h-24 bg-transparent text-white/90 focus:outline-none resize-none"
              placeholder="Share your quantum journey..."
            />
          </div>

          {/* 能量值 */}
          <div className="-mt-12">
            <div className="text-white/50 text-sm mb-3">Energy Value</div>
            <div className="flex items-center">
              <span className="text-white/50 text-xl mr-3">φ</span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 bg-transparent text-white text-xl border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
                placeholder="Define energy value..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 右側 - 主視覺圖上傳 */}
      <div className="w-1/2 p-8 flex flex-col">
        <div className="text-white/50 text-sm mb-4 mt-[12px]">Visual Quantum State</div>
        <div className="h-[calc(100vh-320px)] group relative">
          <input
            type="file"
            onChange={handleImageFileChange}
            className="w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
          />
          <div className="h-full border border-dashed border-white/20 rounded-lg flex items-center justify-center group-hover:border-white/40 transition-colors">
            {imageFile ? (
              <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-h-full max-w-full object-contain p-2" />
            ) : (
              <div className="text-center text-white/40">
                <div className="text-4xl mb-3">⟨∅|</div>
                <div className="text-sm">Drop quantum state here</div>
              </div>
            )}
          </div>
          {imageError && (
            <div className="mt-2 text-red-400 text-sm">
              <span className="font-mono">δ </span>{imageError}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPageTwo = () => (
    <div className="flex h-full">
      {/* 左側 - 演算法上傳 */}
      <div className="w-2/3 p-8 border-r border-white/5">
        <div className="text-white/50 text-sm mb-4">Wave Function</div>
        <div className="h-[calc(100%-2rem)] group relative">
          <input
            type="file"
            onChange={handleAlgoFileChange}
            className="w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer"
          />
          <div className="h-full border border-dashed border-white/20 rounded-lg flex items-center justify-center group-hover:border-white/40 transition-colors">
            {algoFile ? (
              <pre className="p-6 w-full h-full overflow-auto text-sm text-white/80 font-mono">
                {algoResponse || '// Processing...'}
              </pre>
            ) : (
              <div className="text-center text-white/40">
                <div className="text-4xl mb-3">λ</div>
                <div className="text-sm">Drop algorithm here</div>
              </div>
            )}
          </div>
          {algoError && (
            <div className="mt-2 text-red-400 text-sm">
              <span className="font-mono">λ </span>{algoError}
            </div>
          )}
        </div>
      </div>

      {/* 右側 - 參數設定 */}
      <div className="w-1/3 p-8">
        <div className="sticky top-8 space-y-8">
          <div className="text-white/50 text-sm">Quantum Parameters</div>
          <div className="space-y-6">
            {Object.entries(parameters).map(([key, value]) => (
              <div key={key}>
                <div className="text-white/40 text-sm mb-2 capitalize">{key}</div>
                <select
                  value={value}
                  onChange={(e) =>
                    setParameters((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="w-full bg-transparent text-white border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
                >
                  <option value="range">Wave</option>
                  <option value="select">Particle</option>
                </select>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPageThree = () => (
    <div className="flex h-full">
      <div className="w-1/2 p-8 border-r border-white/5">
        <h3 className="text-white/90 text-lg mb-6">Space-Time Configuration</h3>
        <div className="space-y-8">
          <div>
            <label className="text-white/60 text-sm block mb-3">Interface Paradigm</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-transparent text-white border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
            >
              <option value="dark">Dark Matter</option>
              <option value="light">Light Wave</option>
              <option value="minimal">Quantum Minimal</option>
              <option value="elegant">String Theory</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <label className="text-white/60 text-sm block mb-3">Background Field</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 bg-transparent rounded cursor-pointer"
              />
            </div>

            <div>
              <label className="text-white/60 text-sm block mb-3">Information Color</label>
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-full h-10 bg-transparent rounded cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-white/60 text-sm block mb-3">Quantum Parameters</label>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(parameters).map(([key, value]) => (
                <select
                  key={key}
                  value={value}
                  onChange={(e) =>
                    setParameters((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  className="bg-transparent text-white border-b border-white/20 pb-2 focus:outline-none focus:border-white/40 transition-colors"
                >
                  <option value="range">Wave</option>
                  <option value="select">Particle</option>
                </select>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 p-8 flex items-center justify-center">
        <div className="space-y-6 w-full max-w-md">
          <Button 
            onClick={handlePreview} 
            className="w-full py-3 bg-white/5 hover:bg-white/10 transition-colors"
          >
            Preview Quantum State
          </Button>
          
          <Button 
            onClick={handleConfirmUpload}
            className="w-full py-3 bg-blue-500/20 hover:bg-blue-500/30 transition-colors"
          >
            Initialize Universe
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-[rgba(10,10,10,0.3)]">
      {/* 頁面內容 */}
      <div className="h-full">
        {currentPage === 1 && renderPageOne()}
        {currentPage === 2 && renderPageTwo()}
        {currentPage === 3 && renderPageThree()}
      </div>
      
      {/* 導航按鈕 */}
      <div className="absolute bottom-6 right-6 flex gap-2">
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
      </div>

      <Toast
        message="網站上傳成功！"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}