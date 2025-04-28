import React from 'react';
import ParametricScene from '@/components/3d/ParametricScene';

interface ParametricViewerProps {
  userScript: {
    code: string;
    filename: string;
  } | null;
  parameters: Record<string, any>;
  className?: string;
}

/**
 * 共用的參數化模型查看器組件，可用於不同頁面之間共享相同的3D渲染功能
 */
export const ParametricViewer: React.FC<ParametricViewerProps> = ({
  userScript,
  parameters,
  className = "h-full rounded-lg overflow-hidden bg-black/30"
}) => {
  if (!userScript) {
    return (
      <div className={className}>
        <div className="flex h-full items-center justify-center text-white/50">
          No geometry script provided
        </div>
      </div>
    );
  }
  
  console.log(`ParametricViewer rendering ${userScript.filename} with parameters:`, parameters);
  
  return (
    <div className={className}>
      <ParametricScene userScript={userScript} parameters={parameters} />
    </div>
  );
}; 