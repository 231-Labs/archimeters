import { UploadStatus } from '../UploadStatus';
import { TemplateInfo } from '../TemplateInfo';
import { getCurrentMetadata } from '../../utils/metadata';
import { TemplateSeries, FontStyle } from '../../types';

interface UploadStatusPageProps {
  isLoading: boolean;
  uploadStatus: {
    image: 'pending' | 'uploading' | 'success' | 'error';
    algo: 'pending' | 'uploading' | 'success' | 'error';
    metadata: 'pending' | 'uploading' | 'success' | 'error';
  };
  uploadResults: {
    imageBlobId: string;
    algoBlobId: string;
    metadataBlobId: string;
    success: boolean;
    error?: string;
  } | null;
  workName: string;
  description: string;
  style: TemplateSeries;
  fontStyle: FontStyle;
  name: string;
  social: string;
  intro: string;
  onRetry: () => void;
}

export const UploadStatusPage = ({
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
  onRetry
}: UploadStatusPageProps) => {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-4xl p-8">
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

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* Template Info */}
            {uploadResults?.success && (
              <TemplateInfo style={style} fontStyle={fontStyle} />
            )}

            {/* Upload Status */}
            <UploadStatus 
              status={uploadStatus}
              results={uploadResults}
              isLoading={isLoading}
            />
          </div>

          {/* JSON Preview */}
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <div className="text-white/50 text-sm flex items-center justify-between">
              <span>Metadata Preview</span>
              <div className="text-xs px-2 py-1 bg-white/10 rounded">metadata.json</div>
            </div>
            <div className="overflow-auto max-h-[calc(100vh-400px)] font-mono text-sm">
              <pre className="text-white/70 whitespace-pre-wrap">
                {JSON.stringify(getCurrentMetadata({
                  workName,
                  description,
                  style,
                  fontStyle,
                  name,
                  social,
                  intro
                }), null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 