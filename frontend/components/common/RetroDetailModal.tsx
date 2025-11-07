'use client';

import React from 'react';

interface RetroDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function RetroDetailModal({ isOpen, onClose, children }: RetroDetailModalProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="absolute inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div 
        className="absolute inset-0 bg-[#0a0a0a] z-50 transform transition-transform duration-300 flex items-center justify-center p-4"
        style={{
          borderLeft: '2px solid #2a2a2a',
          boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.8)',
        }}
      >
        <div className="grid grid-cols-2 gap-4 max-w-6xl w-full" style={{ maxHeight: '90vh' }}>
          {children}
        </div>
      </div>
    </>
  );
}

interface DetailHeaderProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

export function DetailHeader({ title, subtitle, onClose }: DetailHeaderProps) {
  return (
    <div className="p-3 flex items-center justify-between" style={{
      background: '#1a1a1a',
      borderTop: '2px solid #444',
      borderLeft: '2px solid #444',
      borderBottom: '2px solid #000',
      borderRight: '2px solid #000',
      boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.08), inset -1px -1px 2px rgba(0, 0, 0, 0.5), 0 2px 4px rgba(0, 0, 0, 0.3)',
    }}>
      <div className="flex-1">
        <p className="text-white/50 text-sm font-mono tracking-widest mb-1">{subtitle}</p>
        <h2 className="text-white/90 text-base font-mono tracking-wide truncate">{title}</h2>
      </div>
      <button
        onClick={onClose}
        className="px-3 py-1 text-xs font-medium transition-all duration-75 bg-[#1a1a1a] text-[#cccccc]"
        style={{
          borderTop: '2px solid #2a2a2a',
          borderLeft: '2px solid #2a2a2a',
          borderBottom: '2px solid #0a0a0a',
          borderRight: '2px solid #0a0a0a',
          boxShadow: 'inset 1px 1px 2px rgba(255, 255, 255, 0.05), inset -1px -1px 2px rgba(0, 0, 0, 0.5)',
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'translateY(1px)';
          e.currentTarget.style.borderTop = '2px solid #0a0a0a';
          e.currentTarget.style.borderLeft = '2px solid #0a0a0a';
          e.currentTarget.style.borderBottom = '2px solid #2a2a2a';
          e.currentTarget.style.borderRight = '2px solid #2a2a2a';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderTop = '2px solid #2a2a2a';
          e.currentTarget.style.borderLeft = '2px solid #2a2a2a';
          e.currentTarget.style.borderBottom = '2px solid #0a0a0a';
          e.currentTarget.style.borderRight = '2px solid #0a0a0a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderTop = '2px solid #2a2a2a';
          e.currentTarget.style.borderLeft = '2px solid #2a2a2a';
          e.currentTarget.style.borderBottom = '2px solid #0a0a0a';
          e.currentTarget.style.borderRight = '2px solid #0a0a0a';
        }}
      >
        BACK
      </button>
    </div>
  );
}

interface InfoFieldProps {
  label: string;
  value: string;
  isLast?: boolean;
}

export function InfoField({ label, value, isLast }: InfoFieldProps) {
  return (
    <div className={`flex justify-between items-center py-1 ${!isLast ? 'border-b border-white/5' : ''}`}>
      <span className="text-white/50 text-xs font-mono tracking-wide">{label}</span>
      <span className="text-white/80 font-mono text-xs">{value}</span>
    </div>
  );
}

