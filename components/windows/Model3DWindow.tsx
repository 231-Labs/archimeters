'use client';

import React, { useState, useCallback } from 'react';
import { Parameters, defaultParameters } from '../3d/ParametricScene';
import ParametricScene from '../3d/ParametricScene';

interface Model3DWindowProps {
  onClose: () => void;
}

const Model3DWindow: React.FC<Model3DWindowProps> = () => {
  const [parameters, setParameters] = useState<Parameters>(() => 
    Object.fromEntries(
      Object.entries(defaultParameters).map(([key, value]) => [key, value.default])
    ) as Parameters
  );
  const [inputValues, setInputValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      Object.entries(defaultParameters).map(([key, value]) => [key, value.default.toString()])
    )
  );

  const handleParameterChange = useCallback((key: keyof Parameters, value: string) => {
    const paramDef = defaultParameters[key];
    setInputValues(prev => ({ ...prev, [key]: value }));

    if (paramDef.type === 'number') {
      const defaultValue = paramDef.default as number;
      const parsedValue = value === '' ? defaultValue : Number(value);
      if (isNaN(parsedValue)) return;
      setParameters(prev => ({
        ...prev,
        [key]: parsedValue
      }));
    } else if (paramDef.type === 'color') {
      if (key === 'color') {
        setParameters(prev => ({
          ...prev,
          color: value
        }));
      }
    }
  }, []);

  const renderParameterInput = (key: keyof Parameters) => {
    const paramDef = defaultParameters[key];
    const value = inputValues[key] ?? parameters[key] ?? paramDef.default;

    if (paramDef.type === 'color') {
      return (
        <div key={key} className="mb-6">
          <label className="block text-sm font-medium mb-1 text-white/90">
            {paramDef.label}
          </label>
          <input
            type="color"
            value={value}
            onChange={(e) => handleParameterChange(key, e.target.value)}
            className="w-full h-8 cursor-pointer"
          />
        </div>
      );
    }

    return (
      <div key={key} className="mb-6">
        <label className="block text-sm font-medium mb-1 text-white/90">
          {paramDef.label}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => handleParameterChange(key, e.target.value)}
          className="w-full px-3 py-1.5 bg-[#2a2a2a] text-white border border-[#3a3a3a] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    );
  };

  return (
    <div className="flex h-full">
      <div className="flex-grow">
        <ParametricScene parameters={parameters} />
      </div>
      <div className="w-80 min-w-[320px] max-w-[320px] p-4 bg-[#1a1a1a] border-l border-white/10 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Parameters</h2>
        </div>
        <div className="space-y-2">
          {Object.keys(defaultParameters).map(key => 
            renderParameterInput(key as keyof Parameters)
          )}
        </div>
      </div>
    </div>
  );
};

export default Model3DWindow; 