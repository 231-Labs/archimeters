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
  onSubmit: () => void;
  onPrevious: () => void;
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
  // 檢查當前狀態
  const currentStepInfo = steps[currentStep];
  const isUploadStep = currentStepInfo?.id === 'upload';
  const isTransactionStep = currentStepInfo?.id === 'transaction';
  
  // 檢查上傳狀態
  const hasProcessingSubSteps = isUploadStep && currentStepInfo.subSteps?.some(subStep => subStep.status === 'processing');
  const hasErrorSubSteps = isUploadStep && currentStepInfo.subSteps?.some(subStep => subStep.status === 'error');
  const allSubStepsCompleted = isUploadStep && currentStepInfo.subSteps?.every(subStep => subStep.status === 'success');

  // 檢查交易狀態
  const isTransactionComplete = isTransactionStep && currentStepInfo.status === 'success';
  const isTransactionPending = isTransactionStep && currentStepInfo.status === 'processing';
  const isTransactionFailed = transactionError || (isTransactionStep && currentStepInfo.status === 'error');

  // 獲取當前狀態提示
  const getStatusContent = () => {
    // 如果在上傳階段
    if (isUploadStep) {
      if (hasErrorSubSteps) {
        return (
          <div className="bg-red-900/10 backdrop-blur-sm rounded-lg p-6 border border-red-500/20">
            <h2 className="text-xl text-red-400/80 mb-2 font-medium">Upload Error</h2>
            <div className="text-sm text-red-400/70">
              Some files failed to upload. The system will automatically retry.
            </div>
            {hasProcessingSubSteps && (
              <div className="mt-2 text-sm text-yellow-400/70">
                Some files are still being processed. Please wait...
              </div>
            )}
          </div>
        );
      }

      if (hasProcessingSubSteps) {
        return (
          <div className="bg-blue-900/10 backdrop-blur-sm rounded-lg p-6 border border-blue-500/20">
            <h2 className="text-xl text-blue-400/80 mb-2 font-medium">Processing</h2>
            <div className="text-sm text-blue-400/70">
              Files are being uploaded. This may take a few moments...
            </div>
          </div>
        );
      }

      if (allSubStepsCompleted) {
        return (
          <div className="bg-green-900/10 backdrop-blur-sm rounded-lg p-6 border border-green-500/20">
            <h2 className="text-xl text-green-400/80 mb-2 font-medium">Upload Complete</h2>
            <div className="text-sm text-green-400/70">
              All files have been successfully uploaded. Preparing transaction...
            </div>
          </div>
        );
      }
    }

    // 如果在交易階段
    if (isTransactionStep) {
      if (isTransactionFailed) {
        return (
          <div className="bg-red-900/10 backdrop-blur-sm rounded-lg p-6 border border-red-500/20">
            <h2 className="text-xl text-red-400/80 mb-2 font-medium">Transaction Failed</h2>
            <div className="text-sm text-red-400/70">{transactionError}</div>
          </div>
        );
      }

      if (isTransactionComplete) {
        return (
          <div className="bg-green-900/10 backdrop-blur-sm rounded-lg p-6 border border-green-500/20">
            <h2 className="text-xl text-green-400/80 mb-2 font-medium">Transaction Complete</h2>
            <div className="text-sm text-green-400/70">
              Your transaction has been successfully processed.
            </div>
          </div>
        );
      }

      if (isTransactionPending && transactionDigest) {
        return (
          <div className="bg-purple-900/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
            <h2 className="text-xl text-purple-400/80 mb-2 font-medium">Transaction Pending</h2>
            <div className="text-sm text-purple-400/70">
              Please check your wallet to approve the transaction.
            </div>
          </div>
        );
      }

      return (
        <div className="bg-purple-900/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/20">
          <h2 className="text-xl text-purple-400/80 mb-2 font-medium">Preparing Transaction</h2>
          <div className="text-sm text-purple-400/70">
            Please wait while we prepare your transaction...
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      <div className="flex-1 px-2 py-4">
        <div className="w-full mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full col-span-2">
              <RetroConsole 
                currentStep={currentStep}
                steps={steps}
                txHash={transactionDigest}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 