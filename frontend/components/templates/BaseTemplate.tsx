import { ReactNode } from 'react';
import { TemplateProps } from './DefaultTemplate';

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
    <div className="h-full bg-black text-white overflow-auto hide-scrollbar">
      <div className="relative min-h-full max-w-[1800px] mx-auto p-6 pb-24 flex flex-col">
        <header className="mb-6 relative text-center">
          <div className="absolute left-1/2 -translate-x-1/2 -top-4 w-32 h-32">
            <div className="absolute inset-0 border border-white/10 rounded-sm"></div>
            <div className="absolute inset-4 border border-white/5 rounded-sm"></div>
          </div>
          
          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/80">
              {workName}
            </span>
          </h1>
          <p className="text-base text-white/40 font-normal tracking-[0.5em] uppercase">
            by {author} | @{social}
          </p>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-24">
            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="h-px mt-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          </div>
        </header>

        {children}
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