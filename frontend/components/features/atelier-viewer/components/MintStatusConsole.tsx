'use client';

import { RetroConsole } from '@/components/common/RetroConsole';

interface MintStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  subSteps?: {
    id: string;
    label: string;
    status: 'pending' | 'processing' | 'success' | 'error';
  }[];
}

interface MintStatusConsoleProps {
  currentStep: number;
  steps: MintStep[];
  txDigest: string | null;
  mintError: string | null;
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

export function MintStatusConsole({
  currentStep,
  steps,
  txDigest,
  mintError,
  previewImage,
  sculptName,
  atelierName,
  atelierAuthor,
  atelierDescription,
  sculptOwner,
  onGoToVault,
  onGoToMarketplace,
  onBack
}: MintStatusConsoleProps) {
  return (
    <div className="h-full bg-[#0a0a0a]">
      <RetroConsole 
        currentStep={currentStep}
        steps={steps}
        txHash={txDigest || undefined}
        title="MINTING SCULPT"
        errorMessage={mintError}
        previewImage={previewImage}
        sculptName={sculptName}
        atelierName={atelierName}
        atelierAuthor={atelierAuthor}
        atelierDescription={atelierDescription}
        sculptOwner={sculptOwner}
        onGoToVault={onGoToVault}
        onGoToMarketplace={onGoToMarketplace}
        onBack={onBack}
      />
    </div>
  );
}

