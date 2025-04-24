import { UploadStatuses, UploadResults } from '../../types';
import { TemplateSeries, FontStyle } from '../../types';
import { UploadStatus } from '../UploadStatus';
import { TemplateInfo } from '../TemplateInfo';
import { getCurrentMetadata } from '../../utils/metadata';

interface UploadStatusPageProps {
  isLoading: boolean;
  uploadStatus: UploadStatuses;
  uploadResults: UploadResults | null;
  workName: string;
  description: string;
  style: TemplateSeries;
  fontStyle: FontStyle;
  name: string;
  social: string;
  intro: string;
  price: string;
  transactionDigest?: string;
  transactionError?: string;
  onRetry: () => void;
}

export function UploadStatusPage({
  isLoading,
  uploadStatus,
  uploadResults,
  workName,
  description,
  style,
  fontStyle,
  name,
  social,
  intro,
  price,
  transactionDigest,
  transactionError,
  onRetry
}: UploadStatusPageProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* 上傳狀態區域 */}
          <div className="bg-white/5 rounded-lg p-6">
            <h2 className="text-xl text-white/90 mb-4">Upload Status</h2>
            <UploadStatus 
              status={uploadStatus}
              results={uploadResults}
              isLoading={isLoading}
            />
          </div>

          {/* 參數預覽區域 */}
          {uploadStatus === 'success' && uploadResults && (
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl text-white/90 mb-4">Parameter Preview</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-white/70 mb-2">Artwork Info</h3>
                    <div className="space-y-2">
                      <div className="text-sm text-white/90">Name: {workName}</div>
                      <div className="text-sm text-white/90">Description: {description}</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm text-white/70 mb-2">Artist Info</h3>
                    <div className="space-y-2">
                      <div className="text-sm text-white/90">Name: {name}</div>
                      <div className="text-sm text-white/90">Social: {social}</div>
                      <div className="text-sm text-white/90">Bio: {intro}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm text-white/70 mb-2">File Info</h3>
                  <div className="space-y-2">
                    <div className="text-sm text-white/90">Image: {uploadResults.imageBlobId}</div>
                    <div className="text-sm text-white/90">Algorithm: {uploadResults.algoBlobId}</div>
                    <div className="text-sm text-white/90">Website: {uploadResults.metadataBlobId}</div>
                  </div>
                </div>
                <div className="text-sm text-white/90">Price: {price} SUI</div>
              </div>
            </div>
          )}

          {/* 智能合約交互區域 */}
          {uploadStatus === 'success' && uploadResults && !transactionDigest && (
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl text-white/90 mb-4">Smart Contract Interaction</h2>
              <div className="space-y-4">
                <p className="text-white/70">
                  All files have been successfully uploaded. Creating design series...
                </p>
              </div>
            </div>
          )}

          {/* 交易結果區域 */}
          {transactionDigest && (
            <div className="bg-white/5 rounded-lg p-6">
              <h2 className="text-xl text-white/90 mb-4">Transaction Result</h2>
              <div className="space-y-4">
                <div className="text-green-400">Transaction Successful!</div>
                <div className="text-sm text-white/70">Transaction Digest:</div>
                <div className="font-mono text-sm text-white/90 break-all">
                  {transactionDigest}
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/90 rounded-lg transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          )}

          {/* 錯誤處理區域 */}
          {transactionError && (
            <div className="bg-red-900/20 rounded-lg p-6">
              <h2 className="text-xl text-red-400 mb-4">Transaction Failed</h2>
              <div className="space-y-4">
                <div className="text-sm text-red-400">{transactionError}</div>
                <button
                  onClick={onRetry}
                  className="px-6 py-3 bg-red-500/50 hover:bg-red-500/60 text-white/90 rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 