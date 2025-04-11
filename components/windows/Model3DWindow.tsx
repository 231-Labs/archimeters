'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { WindowName } from '@/types';

const ThreeScene = dynamic(() => import('../3d/ThreeScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-white">Loading 3D Scene...</div>
    </div>
  ),
});

interface Model3DWindowProps {
  onClose: () => void;
  name: WindowName;
}

const Model3DWindow: React.FC<Model3DWindowProps> = ({ onClose, name }) => {
  const [dimensions, setDimensions] = useState({
    width: '',
    height: '',
    depth: '',
  });

  const handleDimensionChange = (key: keyof typeof dimensions, value: string) => {
    setDimensions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const getNumericDimensions = () => {
    return {
      width: dimensions.width === '' ? 1 : parseFloat(dimensions.width) || 1,
      height: dimensions.height === '' ? 1 : parseFloat(dimensions.height) || 1,
      depth: dimensions.depth === '' ? 1 : parseFloat(dimensions.depth) || 1,
    };
  };

  const inputClassName = `
    w-full px-3 border
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    bg-[#2a2a2a] text-white border-[#3a3a3a]
    [appearance:textfield] 
    [&::-webkit-outer-spin-button]:appearance-none 
    [&::-webkit-inner-spin-button]:appearance-none
  `;

  return (
    <div className="flex h-full w-full">
      <div className="flex-1">
        <ThreeScene dimensions={getNumericDimensions()} />
      </div>
      <div className="w-64 p-4 bg-[#1a1a1a] border-l border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-white">Dimensions</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">Width</label>
            <input
              type="number"
              value={dimensions.width}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'e' || e.key === '-' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-white/60">Enter a value between 0.1 and 10</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">Height</label>
            <input
              type="number"
              value={dimensions.height}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'e' || e.key === '-' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-white/60">Enter a value between 0.1 and 10</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">Depth</label>
            <input
              type="number"
              value={dimensions.depth}
              onChange={(e) => handleDimensionChange('depth', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'e' || e.key === '-' || e.key === '+') {
                  e.preventDefault();
                }
              }}
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-white/60">Enter a value between 0.1 and 10</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model3DWindow; 