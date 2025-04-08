import { useState } from 'react';
import Button from '../common/Button';

export default function WalrusUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('data', file);
      formData.append('epochs', '5'); // 減少 epochs 數量

      const response = await fetch('/api/walrus', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.status}`);
      }

      const result = await response.json();
      setResponse(JSON.stringify(result, null, 2));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      setResponse('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex gap-4 mb-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="flex-1 px-3 py-1.5 border border-[rgba(255,255,255,0.2)] bg-[#141414] text-white file:mr-4 file:py-1.5 file:px-4 file:border-0 file:text-white file:bg-[rgba(255,255,255,0.1)] file:hover:bg-[rgba(255,255,255,0.2)] file:cursor-pointer"
        />
        <Button
          onClick={handleUpload}
          disabled={!file || isLoading}
          loading={isLoading}
          loadingText="Uploading..."
        >
          Upload
        </Button>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 text-red-400 rounded">
          {error}
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <pre className="p-3 bg-[rgba(255,255,255,0.05)] font-mono text-sm whitespace-pre-wrap text-white/90">
          {response || 'Response will appear here...'}
        </pre>
      </div>
    </div>
  );
} 