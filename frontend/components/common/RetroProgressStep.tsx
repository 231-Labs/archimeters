'use client';

import { useEffect, useState } from 'react';

interface SubStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'error';
}

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  subSteps?: SubStep[];
}

interface RetroProgressStepProps {
  step: Step;
  isActive: boolean;
  isCompleted: boolean;
}

export function RetroProgressStep({ step, isActive, isCompleted }: RetroProgressStepProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (step.status !== 'processing') return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, [step.status]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="text-green-500">✓</span>;
      case 'error':
        return <span className="text-red-500">✗</span>;
      case 'processing':
        return <span className="text-foreground/70">⟳</span>;
      default:
        return <span className="text-muted-foreground">○</span>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="text-green-600 dark:text-green-400/80 text-[10px]">COMPLETE</span>;
      case 'error':
        return <span className="text-red-600 dark:text-red-400/80 text-[10px]">FAILED</span>;
      case 'processing':
        return <span className="text-muted-foreground text-[10px]">PROCESSING{dots}</span>;
      default:
        return <span className="text-muted-foreground/80 text-[10px]">PENDING</span>;
    }
  };

  return (
    <div
      className={`
      transition-all duration-200
      ${isActive ? 'opacity-100' : isCompleted ? 'opacity-60' : 'opacity-40'}
    `}
    >
      <div className="p-3 publisher-inset-well">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 flex items-center justify-center border border-border bg-background/80">
            {getStatusIcon(step.status)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-foreground/90 text-xs font-mono uppercase truncate">{step.label}</div>
            <div className="mt-0.5">{getStatusText(step.status)}</div>
          </div>
        </div>

        {step.subSteps && (isActive || isCompleted) && (
          <div className="mt-3 ml-9 space-y-2">
            {step.subSteps.map((subStep, index) => (
              <div key={subStep.id} className="flex items-center gap-2 text-xs font-mono">
                <span className="text-muted-foreground">
                  {index === step.subSteps!.length - 1 ? '└─' : '├─'}
                </span>
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {getStatusIcon(subStep.status)}
                </div>
                <span
                  className={`
                  ${
                    subStep.status === 'success'
                      ? 'text-foreground/75'
                      : subStep.status === 'error'
                        ? 'text-red-500/80'
                        : subStep.status === 'processing'
                          ? 'text-foreground/90'
                          : 'text-muted-foreground'
                  }
                `}
                >
                  {subStep.label}
                  {subStep.status === 'processing' && dots}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
