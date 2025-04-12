'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import type { WindowName } from '@/types';

const ParametricScene = dynamic(() => import('../3d/ParametricScene'), {
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
  const [parameters, setParameters] = useState({
    amplitude: 1,
    frequency: 1,
    resolution: 20,
    color: '#f5f5dc',
  });

  const handleParameterChange = (key: keyof typeof parameters, value: string) => {
    setParameters(prev => ({
      ...prev,
      [key]: key === 'color' ? value : value === '' ? '' : parseFloat(value),
    }));
  };

  return (
    <div className="flex h-full w-full">
      <div className="flex-1">
        <ParametricScene parameters={parameters} />
      </div>
      <div className="w-64 p-4 bg-[#1a1a1a] border-l border-white/10">
        <h3 className="text-lg font-semibold mb-4 text-white">Parameters</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">Amplitude</label>
            <input
              type="number"
              value={parameters.amplitude}
              onChange={(e) => handleParameterChange('amplitude', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#2a2a2a] text-white border border-[#3a3a3a] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">Frequency</label>
            <input
              type="number"
              value={parameters.frequency}
              onChange={(e) => handleParameterChange('frequency', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#2a2a2a] text-white border border-[#3a3a3a] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">Resolution</label>
            <input
              type="number"
              value={parameters.resolution}
              onChange={(e) => handleParameterChange('resolution', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#2a2a2a] text-white border border-[#3a3a3a] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white/90">Color</label>
            <input
              type="color"
              value={parameters.color}
              onChange={(e) => handleParameterChange('color', e.target.value)}
              className="w-full h-8 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Model3DWindow; 