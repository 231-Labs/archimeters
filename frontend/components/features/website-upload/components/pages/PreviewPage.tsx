import BaseTemplate from '@/components/templates/BaseTemplate'
import DefaultTemplate from '@/components/templates/DefaultTemplate';
import { useState } from 'react';
import { ParametricViewer } from './ParametricViewer';


interface PreviewPageProps {
  workName: string;
  description: string;
  price: string;
  name: string;
  social: string;
  intro: string;
  imageUrl: string;
  parameters: Record<string, any>;
  previewParams: Record<string, any>;
  onParameterChange: (key: string, value: string | number) => void;
  onMint: () => void;
  userScript: { code: string; filename: string } | null;
}

export const PreviewPage = ({
  workName,
  description,
  price,
  name,
  social,
  intro,
  imageUrl,
  parameters,
  previewParams,
  onParameterChange,
  onMint,
  userScript,
}: PreviewPageProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // 自訂的 mint 處理函數
  const handleMintClick = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 顯示提示信息
    setShowTooltip(true);
    
    // 3秒後自動隱藏提示
    setTimeout(() => {
      setShowTooltip(false);
    }, 3000);
  };
  
  // 懸浮提示
  const TooltipOverlay = () => {
    if (!showTooltip) return null;
    
    return (
      <div className="fixed top-6 right-6 bg-black/90 backdrop-blur-sm text-white p-4 rounded-lg z-50 shadow-lg border border-white/20 max-w-sm animation-fadeInOut">
        <div className="font-medium text-white mb-1">Preview Mode Only</div>
        <div className="text-sm text-white/80">
          This is a preview page. Please use the confirmation button in the bottom right corner to continue the upload process.
        </div>
        <style jsx>{`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(-10px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
          }
          .animation-fadeInOut {
            animation: fadeInOut 3s ease-in-out forwards;
          }
        `}</style>
      </div>
    );
  };
  
  return (
    <>
      {/* 懸浮提示，放在最外層 */}
      <TooltipOverlay />
      
      <BaseTemplate
        workName={workName}
        description={description}
        price={price}
        author={name}
        social={social}
        intro={intro}
        imageUrl={imageUrl}
        parameters={parameters}
        previewParams={previewParams}
        onParameterChange={onParameterChange}
        onMint={handleMintClick}
      >
        <DefaultTemplate
          workName={workName}
          description={description}
          price={price}
          author={name}
          social={social}
          intro={intro}
          imageUrl={imageUrl}
          parameters={parameters}
          previewParams={previewParams}
          onParameterChange={onParameterChange}
          onMint={handleMintClick}
          preview3D={<ParametricViewer userScript={userScript} parameters={previewParams} />}
        />
      </BaseTemplate>
    </>
  );
}; 