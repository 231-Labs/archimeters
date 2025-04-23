import { UploadStatuses, UploadResults, UploadStatus as StatusType } from '../types';

interface UploadStatusProps {
  status: UploadStatuses;
  results: UploadResults;
  isLoading: boolean;
}

export const UploadStatus = ({ status, results, isLoading }: UploadStatusProps) => {
  const getStatusIcon = (status: StatusType) => {
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

  const getStatusColor = (status: StatusType) => {
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
    <div className="space-y-4">
      <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${status.image === 'error' ? 'bg-red-900/20' : 'bg-white/5'}`}>
        <div className="flex items-center space-x-3">
          <span className={`text-xl ${getStatusColor(status.image)}`}>
            {getStatusIcon(status.image)}
          </span>
          <span className="text-white/90">Image File</span>
        </div>
        <div className="text-right">
          {status.image === 'success' && results?.imageBlobId && (
            <div className="text-xs font-mono text-white/50">
              {results.imageBlobId}
            </div>
          )}
        </div>
      </div>

      <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${status.algo === 'error' ? 'bg-red-900/20' : 'bg-white/5'}`}>
        <div className="flex items-center space-x-3">
          <span className={`text-xl ${getStatusColor(status.algo)}`}>
            {getStatusIcon(status.algo)}
          </span>
          <span className="text-white/90">Algorithm File</span>
        </div>
        <div className="text-right">
          {status.algo === 'success' && results?.algoBlobId && (
            <div className="text-xs font-mono text-white/50">
              {results.algoBlobId}
            </div>
          )}
        </div>
      </div>

      <div className={`flex items-center justify-between p-4 rounded-lg transition-colors ${status.metadata === 'error' ? 'bg-red-900/20' : 'bg-white/5'}`}>
        <div className="flex items-center space-x-3">
          <span className={`text-xl ${getStatusColor(status.metadata)}`}>
            {getStatusIcon(status.metadata)}
          </span>
          <span className="text-white/90">Metadata File</span>
        </div>
        <div className="text-right">
          {status.metadata === 'success' && results?.metadataBlobId && (
            <div className="text-xs font-mono text-white/50">
              {results.metadataBlobId}
            </div>
          )}
        </div>
      </div>

      {results?.error && (
        <div className="bg-red-900/20 p-4 rounded-lg">
          <div className="text-red-400">
            {results.error}
          </div>
        </div>
      )}

      {!isLoading && (
        <div className="flex justify-center mt-8 space-x-4">
          {results?.success ? (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          ) : (
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-gradient-to-r from-blue-500/50 via-indigo-500/50 to-purple-500/50 text-white/90 rounded-lg hover:from-blue-500/60 hover:via-indigo-500/60 hover:to-purple-500/60 transition-colors"
            >
              Retry Upload
            </button>
          )}
        </div>
      )}
    </div>
  );
}; 