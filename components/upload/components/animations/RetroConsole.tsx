import { useEffect, useState } from 'react';
import { NoiseEffect } from './NoiseEffect';
import { WaveformDisplay } from './WaveformDisplay';

interface RetroConsoleProps {
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
  txHash?: string;
}

export function RetroConsole({ currentStep, steps, txHash }: RetroConsoleProps) {
  const [blinkIndex, setBlinkIndex] = useState(0);
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

  // 檢查是否所有步驟都完成
  const isAllComplete = steps.length > 0 && steps.every(step => {
    const mainStepComplete = step.status === 'success';
    const subStepsComplete = !step.subSteps || 
                           step.subSteps.every(subStep => subStep.status === 'success');
    return mainStepComplete && subStepsComplete;
  });

  // 檢查交易步驟是否完成
  const transactionStep = steps.find(step => step.id === 'transaction');
  const isTransactionComplete = transactionStep?.status === 'success';

  // 停止動畫的條件：所有步驟完成或交易步驟完成
  const shouldStopAnimation = isAllComplete || isTransactionComplete;

  useEffect(() => {
    // 如果需要停止動畫，則不設置interval
    if (shouldStopAnimation) return;
    
    const interval = setInterval(() => {
      setBlinkIndex(prev => (prev + 1) % spinnerFrames.length);
    }, 80);
    return () => clearInterval(interval);
  }, [spinnerFrames.length, shouldStopAnimation]);

  const StatusIndicator = ({ status, isActive }: { status: string; isActive: boolean }) => {
    if (status === 'success') return <>[DONE]</>;
    if (status === 'error') return <>[ERROR]</>;
    if (status === 'processing' && isActive) {
      return (
        <>
          [<NoiseEffect size={3} color="#ffffff" className="mx-[-1px]" />]
        </>
      );
    }
    return <>[WAIT]</>;
  };

  const ProcessingMessage = ({ status, label }: { status: string; label: string }) => {
    if (status === 'processing') {
      const isAwaitingApproval = label.includes('EXECUTING MOVE FUNCTION');
      return (
        <div className="text-xs text-white/50 font-mono">
          {isAwaitingApproval ? 'WAITING FOR APPROVAL' : 'PROCESSING REQUEST'} {spinnerFrames[blinkIndex]}
        </div>
      );
    }
    if (status === 'success') {
      return (
        <div className="text-xs text-green-400/70 font-mono">
          OPERATION COMPLETE ▀▀▀
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="text-xs text-red-400/70 font-mono">
          OPERATION FAILED
        </div>
      );
    }
    return null;
  };

  // 添加動態效果
  const StepAnimation = ({ status, isActive, shouldStopAnimation }: { status: string; isActive: boolean; shouldStopAnimation: boolean }) => {
    if (status === 'success') return <>[DONE]</>;
    if (status === 'error') return <>[ERROR]</>;
    if (status === 'processing' && isActive && !shouldStopAnimation) {
      return (
        <>
          [<NoiseEffect size={3} color="#ffffff" className="mx-[-1px]" />]
        </>
      );
    }
    return <>[WAIT]</>;
  };

  // 檢查當前步驟狀態
  const getCurrentSignalStatus = () => {
    // 如果交易步驟完成，返回操作完成
    if (isTransactionComplete) return 'OPERATION COMPLETE';
    if (isAllComplete) return 'OPERATION COMPLETE';

    const currentStepData = steps[currentStep];
    if (!currentStepData) return 'PROCESSING REQUEST';

    // 檢查當前步驟的狀態
    if (currentStepData.status === 'processing') {
      // 檢查是否在執行 Move 函數
      if (currentStepData.label.includes('EXECUTING MOVE FUNCTION')) {
        return 'WAITING FOR APPROVAL';
      }
      return 'PROCESSING REQUEST';
    }
    if (currentStepData.status === 'error') {
      return 'OPERATION FAILED';
    }
    
    return 'PROCESSING REQUEST';
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATION COMPLETE':
        return 'text-green-400';
      case 'PLEASE APPROVE':
        return 'text-yellow-400';
      case 'PROCESSING REQUEST':
        return 'text-blue-400';
      case 'OPERATION FAILED':
        return 'text-red-400';
      default:
        return 'text-white/70';
    }
  };

  const currentStatus = getCurrentSignalStatus();
  const isComplete = currentStatus === 'OPERATION COMPLETE';
  const isFailed = currentStatus === 'OPERATION FAILED';

  // 交易訊息設置
  const mockSuccessTransaction = (isComplete || isTransactionComplete) && txHash ? {
    hash: txHash,
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  } : null;

  return (
    <div className={`font-mono space-y-4 ${shouldStopAnimation ? 'opacity-90' : ''}`}>
      {/* 電波圖 */}
      <div className="bg-black/30 backdrop-blur-sm p-4 rounded-lg space-y-2 border border-white/10">
        <div className="h-16 relative overflow-hidden rounded-sm border border-white/10">
          <WaveformDisplay isAnimating={!shouldStopAnimation} />
          <div className="absolute top-2 left-2 text-xs flex items-center gap-2">
            <span className="text-white/70">SIGNAL STATUS:</span>
            <span className={getStatusColor(currentStatus)}>{currentStatus}</span>
          </div>
        </div>
      </div>

      {/* 步驟列表 */}
      <div className="backdrop-blur-sm bg-black/20 border border-white/10 p-4 rounded-lg space-y-3">
        <div className="text-white/70 text-sm">Operation Steps</div>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`relative ${
                shouldStopAnimation ? 'text-white/60' :
                currentStep === index ? 'text-white' : 
                currentStep > index ? 'text-white/60' : 
                'text-white/40'
              }`}
            >
              {/* 主步驟 */}
              <div className="flex items-center gap-4">
                <div className="w-24 text-right font-light shrink-0 font-mono flex items-center justify-end gap-1">
                  <StepAnimation status={step.status} isActive={currentStep === index} shouldStopAnimation={shouldStopAnimation} />
                </div>
                <div className="flex-1 font-light">
                  {step.label}
                  {currentStep === index && !step.subSteps && !shouldStopAnimation && (
                    <span className="opacity-50">{['.', '..', '...'][Math.floor(blinkIndex / 3) % 3]}</span>
                  )}
                </div>
              </div>

              {/* 子步驟 */}
              {step.subSteps && (currentStep === index || currentStep > index) && (
                <div className="mt-2 space-y-2">
                  {step.subSteps.map((subStep, subIndex) => (
                    <div key={subStep.id} className="flex items-start">
                      <div className="w-24 text-right font-light shrink-0 font-mono flex items-center justify-end">
                        <span className="text-white/50 mr-2">
                          {subIndex === step.subSteps!.length - 1 ? '└' : '├'}
                        </span>
                      </div>
                      <div className="text-white/50 shrink-0">
                        ─
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <StepAnimation status={subStep.status} isActive={currentStep === index} shouldStopAnimation={shouldStopAnimation} />
                      </div>
                      <div className="flex-1 ml-2">
                        <div className="font-light">{subStep.label}</div>
                        <div className="mt-1">
                          <ProcessingMessage status={subStep.status} label={subStep.label} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 狀態信息 - 只在沒有子步驟時顯示 */}
              {!step.subSteps && (
                <div className="ml-24 mt-1">
                  <ProcessingMessage status={step.status} label={step.label} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 交易訊息區塊 - 與 Operation Steps 風格一致 */}
      {txHash && (isTransactionComplete || transactionStep?.status === 'error') && (
        <div className="backdrop-blur-sm bg-black/20 border border-white/10 p-4 rounded-lg space-y-3">
          <div className="text-white/70 text-sm">Transaction Details</div>
          <div className="font-mono space-y-4">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex items-start">
                  <span className="text-white/70 text-sm mr-2 w-16 shrink-0 text-right">Digest:</span>
                  <span className={`${isTransactionComplete ? 'text-green-400' : 'text-red-400'} break-all font-medium text-sm`}>
                    {txHash}
                  </span>
                </div>
                <div className="mt-1 ml-[4.5rem]">
                  {isTransactionComplete ? (
                    <div className="text-xs text-green-400/70 font-mono">
                      TRANSACTION COMPLETE
                    </div>
                  ) : (
                    <div className="text-xs text-red-400/70 font-mono">
                      TRANSACTION FAILED
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center pt-2 mt-2 border-t border-white/10">
              <a 
                href={`https://suiscan.xyz/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white/90 transition-colors flex items-center gap-1 text-sm ml-[4.5rem]"
              >
                {'>>'} Open in explorer
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 