import { useState, useCallback } from 'react';
import ParametricScene from '@/components/3d/ParametricScene';

interface GeometryScript {
  code: string;
  filename: string;
}

export default function ParameterTest() {
  const [script, setScript] = useState<GeometryScript | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const code = e.target?.result as string;
        // 檢查代碼是否包含必要的函數
        if (!code.includes('function createGeometry')) {
          throw new Error('檔案必須包含 createGeometry 函數');
        }
        setScript({
          code,
          filename: file.name
        });
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : '檔案讀取錯誤');
        setScript(null);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError('檔案讀取錯誤');
      setScript(null);
      setIsLoading(false);
    };
    reader.readAsText(file);
  }, []);

  return (
    <div className="flex h-full">
      {/* 左側 - 3D 預覽 */}
      <div className="w-2/3 border-r border-white/5">
        <div className="h-full bg-black/30 overflow-hidden">
          <ParametricScene userScript={script} />
        </div>
      </div>

      {/* 右側 - 檔案上傳和狀態 */}
      <div className="w-1/3 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-white/80 text-sm font-medium">
              上傳幾何體描述檔案
            </label>
            <input
              type="file"
              accept=".js"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="block w-full text-sm text-white/60
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-white/10 file:text-white
                hover:file:bg-white/20
                disabled:opacity-50"
            />
          </div>

          {isLoading && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-2">
              <p className="text-blue-500 text-sm">正在載入檔案...</p>
            </div>
          )}

          {script && !error && (
            <div className="space-y-2">
              <h3 className="text-white/80 text-sm font-medium">當前檔案</h3>
              <div className="bg-white/5 rounded p-2">
                <p className="text-white/60 text-sm">{script.filename}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-white/80 text-sm font-medium">使用說明</h3>
            <div className="bg-white/5 rounded p-3 text-white/60 text-sm space-y-2">
              <p>1. 上傳的 JS 檔案需要導出一個 createGeometry 函數</p>
              <p>2. 函數必須接收 THREE 作為參數</p>
              <p>3. 函數必須返回一個 Three.js 幾何體</p>
              <p>4. 支持所有 Three.js 的基礎幾何體</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 