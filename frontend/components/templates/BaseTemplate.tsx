import { ReactNode } from 'react';
import { TemplateProps } from './DefaultTemplate';
import { RetroHeading } from '@/components/common/RetroHeading';

export interface BaseTemplateProps extends TemplateProps {
  children?: ReactNode;
}

export default function BaseTemplate({
  children,
  workName,
  description,
  price,
  author,
  social,
  intro,
  imageUrl,
  parameters,
  previewParams,
  onParameterChange,
  onMint,
  mintButtonState
}: BaseTemplateProps) {
  return (
    <div className="h-full bg-[#0a0a0a] text-white overflow-auto hide-scrollbar">
      <div className="relative min-h-full max-w-[1800px] mx-auto flex flex-col">
        <div className="sticky top-0 z-30">
          <RetroHeading 
            title={workName}
            author={`BY ${author?.toUpperCase()} | @${social}`}
          />
        </div>

        <div className="px-6 pb-6 mt-4">
          {children}
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
} 