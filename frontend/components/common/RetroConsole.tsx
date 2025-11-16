'use client';

import { RetroProgressStep } from './RetroProgressStep';
import { RetroMintCard } from './RetroMintCard';

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  subSteps?: {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'success' | 'error';
  }[];
}

interface RetroConsoleProps {
  currentStep: number;
  steps: Step[];
  txHash?: string;
  title?: string;
  errorMessage?: string | null;
  previewImage?: string;
  sculptName?: string;
  atelierName?: string;
  atelierAuthor?: string;
  atelierDescription?: string;
  sculptOwner?: string;
  onGoToVault?: () => void;
  onGoToMarketplace?: () => void;
  onBack?: () => void;
}

export function RetroConsole({ currentStep, steps, txHash, title = 'PUBLISHING STATUS', errorMessage, previewImage, sculptName, atelierName, atelierAuthor, atelierDescription, sculptOwner, onGoToVault, onGoToMarketplace, onBack }: RetroConsoleProps) {
  const transactionStep = steps.find(step => step.id === 'transaction');
  const isTransactionComplete = transactionStep?.status === 'success';
  const isTransactionFailed = transactionStep?.status === 'error';

  const allStepsComplete = steps.every(step => {
    if (step.status !== 'success') return false;
    if (step.subSteps) {
      return step.subSteps.every(sub => sub.status === 'success');
    }
    return true;
  });

  const totalSteps = steps.reduce((acc, step) => {
    return acc + 1 + (step.subSteps?.length || 0);
  }, 0);

  const completedSteps = steps.reduce((acc, step) => {
    let count = step.status === 'success' ? 1 : 0;
    if (step.subSteps) {
      count += step.subSteps.filter(sub => sub.status === 'success').length;
    }
    return acc + count;
  }, 0);

  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="h-full flex flex-col justify-center p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div 
        className="p-4 mb-4"
        style={{
          background: '#1a1a1a',
          borderTop: '2px solid #444',
          borderLeft: '2px solid #444',
          borderBottom: '2px solid #000',
          borderRight: '2px solid #000',
          boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-white/90 text-sm font-mono uppercase tracking-wide">{title}</h2>
          <div className="flex items-center gap-3">
            <span className="text-white/50 text-xs font-mono">{completedSteps}/{totalSteps} STEPS</span>
            <span className={`text-xs font-mono ${
              allStepsComplete ? 'text-green-400' :
              isTransactionFailed ? 'text-red-400' :
              'text-white/70'
            }`}>
              {allStepsComplete ? 'COMPLETE' :
               isTransactionFailed ? 'FAILED' :
               'IN PROGRESS'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-6 bg-black/60 border border-white/10 overflow-hidden"
          style={{
            borderTop: '2px solid #000',
            borderLeft: '2px solid #000',
            borderBottom: '2px solid #2a2a2a',
            borderRight: '2px solid #2a2a2a',
            boxShadow: 'inset 2px 2px 4px rgba(0, 0, 0, 0.8)',
          }}
        >
          <div 
            className="h-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: allStepsComplete 
                ? 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
                : isTransactionFailed
                ? 'linear-gradient(90deg, #dc2626 0%, #ef4444 100%)'
                : 'linear-gradient(90deg, #4b5563 0%, #6b7280 100%)',
              boxShadow: 'none',
            }}
          />
          <div className="relative -mt-6 h-6 flex items-center justify-center">
            <span className="text-white/90 text-xs font-mono font-bold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
              {progressPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Two Columns */}
      <div className="flex gap-8 items-start" style={{ maxHeight: '60vh' }}>
        {/* Left Column - Progress & Status */}
        <div className="w-[70%] flex flex-col gap-3 overflow-y-auto pr-2" style={{ maxHeight: '60vh' }}>
          {/* Steps List */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <RetroProgressStep
                key={step.id}
                step={step}
                isActive={currentStep === index}
                isCompleted={currentStep > index}
              />
            ))}
          </div>

          {/* Transaction Digest - Compact Version */}
          <div 
            className="p-3 mt-2"
            style={{
              background: '#1a1a1a',
              borderTop: '2px solid #444',
              borderLeft: '2px solid #444',
              borderBottom: '2px solid #000',
              borderRight: '2px solid #000',
              boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div className="text-white/80 text-[10px] font-mono uppercase tracking-wide mb-2">Transaction Digest</div>
            <div 
              className="p-2 bg-black/60 border border-white/10 break-all font-mono text-[10px] leading-tight"
              style={{
                borderTop: '2px solid #000',
                borderLeft: '2px solid #000',
                borderBottom: '2px solid #2a2a2a',
                borderRight: '2px solid #2a2a2a',
              }}
            >
              {txHash && (isTransactionComplete || isTransactionFailed) ? (
                <span className={isTransactionComplete ? 'text-green-400' : 'text-red-400'}>
                  {txHash}
                </span>
              ) : (
                <span className="text-white/40">Waiting for transaction...</span>
              )}
            </div>
            {txHash && (isTransactionComplete || isTransactionFailed) && (
              <a
                href={`https://suiscan.xyz/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-white/60 hover:text-white/90 text-[10px] font-mono transition-colors"
              >
                <span>→</span>
                <span>VIEW ON EXPLORER</span>
              </a>
            )}
          </div>

          {/* Status Message - Compact Version */}
          <div 
            className="p-3"
            style={{
              background: '#1a1a1a',
              borderTop: '2px solid #444',
              borderLeft: '2px solid #444',
              borderBottom: '2px solid #000',
              borderRight: '2px solid #000',
              boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
            }}
          >
            {allStepsComplete ? (
              <>
                <div className="text-center mb-2">
                  <div className="text-green-400 text-sm font-mono mb-1">MINT COMPLETE</div>
                  <div className="text-white/60 text-[10px] font-mono">What would you like to do next?</div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {/* Vault Button */}
                  {onGoToVault && (
                    <button
                      onClick={onGoToVault}
                      className="group relative overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                      style={{
                        background: '#1a1a1a',
                        borderTop: '2px solid #444',
                        borderLeft: '2px solid #444',
                        borderBottom: '2px solid #000',
                        borderRight: '2px solid #000',
                        boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
                        padding: '8px',
                      }}
                    >
                      <div className="text-white/80 group-hover:text-white text-xs font-mono transition-colors">
                        VAULT
                      </div>
                    </button>
                  )}

                  {/* Back Button (when modal) */}
                  {onBack && (
                    <button
                      onClick={onBack}
                      className="group relative overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                      style={{
                        background: '#1a1a1a',
                        borderTop: '2px solid #444',
                        borderLeft: '2px solid #444',
                        borderBottom: '2px solid #000',
                        borderRight: '2px solid #000',
                        boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
                        padding: '8px',
                      }}
                    >
                      <div className="text-white/80 group-hover:text-white text-xs font-mono transition-colors">
                        BACK
                      </div>
                    </button>
                  )}

                  {/* Marketplace Button */}
                  {onGoToMarketplace && (
                    <button
                      onClick={onGoToMarketplace}
                      className="group relative overflow-hidden transition-all duration-200 hover:translate-y-[-1px]"
                      style={{
                        background: '#1a1a1a',
                        borderTop: '2px solid #444',
                        borderLeft: '2px solid #444',
                        borderBottom: '2px solid #000',
                        borderRight: '2px solid #000',
                        boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
                        padding: '8px',
                      }}
                    >
                      <div className="text-white/80 group-hover:text-white text-xs font-mono transition-colors">
                        MARKETPLACE
                      </div>
                    </button>
                  )}
                </div>
              </>
            ) : isTransactionFailed ? (
              <div className="text-center">
                <div className="text-red-400 text-sm font-mono mb-1">TRANSACTION FAILED</div>
                {errorMessage && (
                  <div className="text-white/60 text-[10px] font-mono mt-1 break-words">
                    {errorMessage}
                  </div>
                )}
                <div className="text-white/40 text-[10px] font-mono mt-2">Try again or contact support</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-white/70 text-sm font-mono mb-1">MINTING IN PROGRESS</div>
                <div className="text-white/40 text-[10px] font-mono">Please wait...</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Card Preview */}
        {previewImage && (
          <div className="flex-1 flex items-center justify-center px-8">
            <div className="w-[360px]">
              <RetroMintCard
              imageUrl={previewImage}
              sculptName={sculptName}
              atelierName={atelierName}
              atelierAuthor={atelierAuthor}
              atelierDescription={atelierDescription}
              sculptOwner={sculptOwner}
              isGenerating={!allStepsComplete && !isTransactionFailed}
              isComplete={allStepsComplete}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

