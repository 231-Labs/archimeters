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

  useEffect(() => {
    const interval = setInterval(() => {
      setBlinkIndex(prev => (prev + 1) % spinnerFrames.length);
    }, 80);
    return () => clearInterval(interval);
  }, [spinnerFrames.length]);

  const StatusIndicator = ({ status, isActive }: { status: string; isActive: boolean }) => {
    if (status === 'success') return <>[DONE]</>;
    if (status === 'processing' && isActive) {
      return (
        <>
          [<NoiseEffect size={3} color="#ffffff" className="mx-[-1px]" />]
        </>
      );
    }
    return null;
  };

  const ProcessingMessage = ({ status, label }: { status: string; label: string }) => {
    if (status === 'processing') {
      const isAwaitingApproval = label.includes('EXECUTING MOVE FUNCTION');
      return (
        <div className="text-xs text-white/40 font-mono">
          {isAwaitingApproval ? 'PLEASE APPROVE' : 'PROCESSING REQUEST'} {spinnerFrames[blinkIndex]}
        </div>
      );
    }
    if (status === 'success') {
      return (
        <div className="text-xs text-white/40 font-mono">
          OPERATION COMPLETE ▀▀▀
        </div>
      );
    }
    if (status === 'error') {
      return (
        <div className="text-xs text-red-400/60 font-mono">
          OPERATION FAILED
        </div>
      );
    }
    return null;
  };

  // 檢查當前步驟狀態
  const getCurrentSignalStatus = () => {
    // 檢查是否所有步驟都完成
    const isAllComplete = steps.length > 0 && steps.every(step => {
      const mainStepComplete = step.status === 'success';
      const subStepsComplete = !step.subSteps || 
                             step.subSteps.every(subStep => subStep.status === 'success');
      return mainStepComplete && subStepsComplete;
    });

    if (isAllComplete) return 'OPERATION COMPLETE';

    const currentStepData = steps[currentStep];
    if (!currentStepData) return 'PROCESSING REQUEST';

    // 檢查是否在執行 MOVE FUNCTION
    const isExecutingMove = currentStepData.label.includes('EXECUTING MOVE FUNCTION') ||
                          currentStepData.subSteps?.some(step => 
                            step.status === 'processing' && step.label.includes('EXECUTING MOVE FUNCTION')
                          );

    if (isExecutingMove) return 'PLEASE APPROVE';
    
    return 'PROCESSING REQUEST';
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATION COMPLETE':
        return 'text-green-400/80';
      case 'PLEASE APPROVE':
        return 'text-yellow-400/80';
      case 'PROCESSING REQUEST':
        return 'text-blue-400/80';
      default:
        return 'text-white/50';
    }
  };

  const currentStatus = getCurrentSignalStatus();
  const isComplete = currentStatus === 'OPERATION COMPLETE';

  // 模擬成功的交易訊息（僅用於展示）
  const mockSuccessTransaction = isComplete ? {
    hash: '0x7d3a03ea447be5b43ea5edb41a7db13699780fbedf3e95dba4df4c5ba8118777',
    status: 'SUCCESS',
    timestamp: new Date().toISOString()
  } : null;

  return (
    <div className="font-mono space-y-4">
      {/* 電波圖 */}
      <div className="bg-black/50 p-4 rounded-lg space-y-2 backdrop-blur-sm">
        <div className="h-16 relative overflow-hidden rounded border border-white/10">
          <WaveformDisplay isAnimating={!isComplete} />
          <div className="absolute top-2 left-2 text-xs flex items-center gap-2">
            <span className="text-white/50">SIGNAL STATUS:</span>
            <span className={getStatusColor(currentStatus)}>{currentStatus}</span>
          </div>
        </div>
      </div>

      {/* 步驟列表 */}
      <div className="bg-white/5 p-4 rounded-lg space-y-3">
        <div className="text-white/50 text-sm">Operation Steps</div>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`relative ${
                currentStep === index ? 'text-white/90' : 
                currentStep > index ? 'text-white/40' : 
                'text-white/30'
              }`}
            >
              {/* 主步驟 */}
              <div className="flex items-center gap-4">
                <div className="w-24 text-right font-light shrink-0 font-mono flex items-center justify-end gap-1">
                  {currentStep > index ? (
                    <>[DONE]</>
                  ) : currentStep === index ? (
                    <>
                      [<NoiseEffect size={3} color="#ffffff" className="mx-[-1px]" />]
                    </>
                  ) : (
                    `[${(index + 1).toString().padStart(2, '0')}]`
                  )}
                </div>
                <div className="flex-1 font-light">
                  {step.label}
                  {currentStep === index && !step.subSteps && (
                    <span className="opacity-50">{['.', '..', '...'][Math.floor(blinkIndex / 3) % 3]}</span>
                  )}
                </div>
              </div>

              {/* 子步驟 */}
              {step.subSteps && currentStep === index && (
                <div className="mt-2 space-y-2">
                  {step.subSteps.map((subStep, subIndex) => (
                    <div key={subStep.id} className="flex items-start">
                      <div className="w-24 text-right font-light shrink-0 font-mono flex items-center justify-end">
                        <span className="text-white/30 mr-2">
                          {subIndex === step.subSteps!.length - 1 ? '└' : '├'}
                        </span>
                      </div>
                      <div className="text-white/30 shrink-0">
                        ─
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {subStep.status === 'success' ? (
                          <span className="font-mono">[DONE]</span>
                        ) : subStep.status === 'processing' ? (
                          <span className="font-mono">
                            [<NoiseEffect size={3} color="#ffffff" className="mx-[-1px]" />]
                          </span>
                        ) : (
                          <span className="font-mono">[WAIT]</span>
                        )}
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

      {/* 交易訊息區塊 */}
      {mockSuccessTransaction && (
        <div className="bg-white/5 p-4 rounded-lg space-y-2">
          <div className="text-white/50 text-sm mb-2">Transaction Details</div>
          <div className="font-mono text-xs space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-white/40 shrink-0">TX Hash:</span>
              <span className="text-green-400/80 break-all font-light">
                {mockSuccessTransaction.hash}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">Status:</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400/80"></span>
                <span className="text-green-400/80">{mockSuccessTransaction.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">Time:</span>
              <span className="text-white/60 font-light">
                {new Date(mockSuccessTransaction.timestamp).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
              <a 
                href={`https://suiscan.xyz/testnet/tx/${mockSuccessTransaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400/70 hover:text-blue-400 transition-colors flex items-center gap-1"
              >
                View on SuiScan
                <span className="text-[10px] relative top-[1px]">↗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 