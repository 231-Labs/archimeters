import { useState, useEffect } from 'react';
import Button from '../common/Button';

export default function WalrusView() {
  const [blobId, setBlobId] = useState('');
  const [blobUrl, setBlobUrl] = useState<string>('');
  const [contentType, setContentType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleFetch = async () => {
    if (!blobId.trim()) return;

    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl('');
    }

    setIsLoading(true);
    setError('');
    try {
      const cleanBlobId = blobId.split('/').pop()?.replace('blob:', '') || blobId;
      const response = await fetch(`/api/walrus/blob/${cleanBlobId}`);
      
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      const type = response.headers.get('Content-Type') || 'application/octet-stream';
      setContentType(type);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setBlobUrl(url);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Fetch failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          value={blobId}
          onChange={(e) => setBlobId(e.target.value)}
          placeholder="Enter Blob ID"
          className="flex-1 px-3 py-1.5 border border-[rgba(255,255,255,0.2)] bg-[#141414] text-white placeholder-white/50 focus:outline-none focus:border-[rgba(255,255,255,0.4)] focus:bg-[#1a1a1a] transition-colors"
        />
        <Button
          onClick={handleFetch}
          disabled={!blobId.trim() || isLoading}
          loading={isLoading}
          loadingText="Loading..."
        >
          Fetch
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        {error ? (
          <div className="text-red-400 p-3">{error}</div>
        ) : isLoading ? (
          <div className="p-3 text-white/90">Loading...</div>
        ) : blobUrl ? (
          <img 
            src={blobUrl} 
            alt="Blob content"
            className="max-w-full h-auto"
          />
        ) : (
          <div className="p-3 text-white/90">
            Enter a blob ID and click Fetch to view content
          </div>
        )}
      </div>
    </div>
  );
} 