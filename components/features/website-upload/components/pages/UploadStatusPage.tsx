import { UploadStatuses, UploadResults } from '../../types';
import { TemplateSeries, FontStyle } from '../../types';
import { RetroConsole } from '../animations/RetroConsole';

interface UploadStatusPageProps {
  isLoading: boolean;
  uploadStatus: UploadStatuses;
  uploadResults: UploadResults | null;
  currentStep: number;
  steps: {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'success' | 'error';
    subSteps?: {
      id: string;
      label: string;
      status: 'pending' | 'processing' | 'success' | 'error';
    }[];
  }[];
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
}

export function UploadStatusPage({
  isLoading,
  uploadStatus,
  uploadResults,
  currentStep,
  steps,
  workName,
  description,
  style,
  fontStyle,
  name,
  social,
  intro,
  price,
  transactionDigest,
  transactionError
}: UploadStatusPageProps) {
  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-1 px-2 py-4">
        <div className="w-full mx-auto">
          {/* 上傳狀態區域 - 透明背景 */}
          <div className="w-full">
            <RetroConsole 
              currentStep={currentStep}
              steps={steps}
              txHash={transactionDigest}
            />
          </div>

          {/* 錯誤處理區域 - 僅顯示錯誤信息，無按鈕 */}
          {transactionError && (
            <div className="bg-red-900/10 backdrop-blur-sm rounded-lg p-6 mt-4 border border-red-500/20">
              <h2 className="text-xl text-red-400 mb-2 font-medium">Transaction Failed</h2>
              <div className="text-sm text-red-400/90">{transactionError}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 